/**
 * WITS (World Integrated Trade Solution) API Client
 * World Bank — Trade Statistics for Senegal
 * 
 * Base URL: https://wits.worldbank.org/API/V1
 * Data source: tradestats-trade (exports/imports)
 * Reporter: SEN (Senegal)
 * Format: JSON (SDMX-JSON)
 */
import {
  getComtradeAnnualOverview,
  getComtradeReleases,
  parseLatestYearFromReleases,
} from './comtrade-api'

const WITS_BASE = 'https://wits.worldbank.org/API/V1/SDMX/V21/datasource'
const REPORTER = 'sen'

// In-memory cache — 24h TTL (trade data is annual, rarely changes)
const tradeCache = new Map<string, { data: any; expires: number }>()
const TRADE_CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours

// ─── Types ───────────────────────────────────────────────

export interface TradeOverview {
  year: number
  totalExports: number    // US$ thousands
  totalImports: number    // US$ thousands
  tradeBalance: number    // US$ thousands
}

export interface TradeBySector {
  code: string
  name: string
  nameFr: string
  exports: number
  imports: number
}

export interface TradePartner {
  code: string
  name: string
  value: number
  share: number  // percentage
}

export interface TradeTimeSeries {
  years: number[]
  exports: number[]
  imports: number[]
  balance: number[]
}

// ─── Product name translations ────────────────────────────

const PRODUCT_FR: Record<string, string> = {
  'Animal': 'Produits animaux',
  'Vegetable': 'Produits végétaux',
  'Food Products': 'Produits alimentaires',
  'Minerals': 'Minéraux',
  'Fuel': 'Combustibles',
  'Fuels': 'Combustibles',
  'Chemical': 'Produits chimiques',
  'Chemicals': 'Produits chimiques',
  'Plastic or Rubber': 'Plastique / Caoutchouc',
  'Hides and Skins': 'Cuirs et peaux',
  'Wood': 'Bois',
  'Textiles and Clothing': 'Textiles et habillement',
  'Textiles': 'Textiles',
  'Footwear': 'Chaussures',
  'Stone and Glass': 'Pierre et verre',
  'Metals': 'Métaux',
  'Mach and Elec': 'Machines et électronique',
  'Transportation': 'Transport',
  'Miscellaneous': 'Divers',
  'All Products': 'Tous produits',
  'Agricultural Raw Materials': 'Matières premières agricoles',
  'Manufactures': 'Produits manufacturés',
  'Ores and Metals': 'Minerais et métaux',
  'Machinery and Transport Equipment': 'Machines et matériel de transport',
  'Raw materials': 'Matières premières',
  'Intermediate goods': 'Biens intermédiaires',
  'Consumer goods': 'Biens de consommation',
  'Capital goods': 'Biens d\'équipement',
}

// ─── Partner name translations (common) ──────────────────

const PARTNER_FR: Record<string, string> = {
  'World': 'Monde',
  'France': 'France',
  'China': 'Chine',
  'India': 'Inde',
  'United States': 'États-Unis',
  'Spain': 'Espagne',
  'Belgium': 'Belgique',
  'Netherlands': 'Pays-Bas',
  'Germany': 'Allemagne',
  'United Kingdom': 'Royaume-Uni',
  'Italy': 'Italie',
  'Russian Federation': 'Russie',
  'Switzerland': 'Suisse',
  'Mali': 'Mali',
  'Guinea': 'Guinée',
  'Gambia, The': 'Gambie',
  'Cote d\'Ivoire': 'Côte d\'Ivoire',
  'United Arab Emirates': 'Émirats arabes unis',
  'Turkey': 'Turquie',
  'Turkiye': 'Turquie',
  'Nigeria': 'Nigéria',
  'Morocco': 'Maroc',
  'Japan': 'Japon',
  'Australia': 'Australie',
  'Brazil': 'Brésil',
  'Thailand': 'Thaïlande',
  'South Africa': 'Afrique du Sud',
  'Mauritania': 'Mauritanie',
  'Cameroon': 'Cameroun',
  'Burkina Faso': 'Burkina Faso',
  'Ghana': 'Ghana',
  'Togo': 'Togo',
  'Benin': 'Bénin',
}

// ─── Region codes to exclude from partner rankings ───────

const REGION_CODES = new Set([
  'WLD', 'SSF', 'ECS', 'EAS', 'SAS', 'MEA', 'LCN', 'NAC',
  'SSA', 'OED', 'NOC', 'BUN', 'SPE',
  'Sub-Saharan Africa', 'Europe and Central Asia',
  'East Asia and Pacific', 'South Asia',
  'Middle East and North Africa', 'Latin America and Caribbean',
  'North America', 'Bunkers',
])

// ─── Core fetch with cache ───────────────────────────────

async function witsFetch(url: string): Promise<any> {
  const cached = tradeCache.get(url)
  if (cached && cached.expires > Date.now()) {
    return cached.data
  }

  try {
    const res = await fetch(url, {
      headers: { 'Accept': 'application/json' },
    })

    if (!res.ok) {
      console.error(`WITS API error: ${res.status} for ${url}`)
      return null
    }

    // Verify response is JSON
    const ct = res.headers.get('content-type') || ''
    if (!ct.includes('json') && !ct.includes('sdmx')) {
      console.error(`WITS API returned non-JSON (${ct}) for ${url}`)
      return null
    }

    const data = await res.json()
    tradeCache.set(url, { data, expires: Date.now() + TRADE_CACHE_TTL })
    return data
  } catch (e) {
    console.error(`WITS API fetch failed: ${e} for ${url}`)
    return null
  }
}

// ─── SDMX-JSON parser helpers ────────────────────────────

interface SDMXDimValue {
  id: string
  name: string
}

function parseDimensions(data: any): {
  partners: SDMXDimValue[]
  products: SDMXDimValue[]
  indicators: SDMXDimValue[]
  years: SDMXDimValue[]
} {
  const dims = data.structure.dimensions.series
  const obsDims = data.structure.dimensions.observation || []
  return {
    partners: dims[2]?.values || [],
    products: dims[3]?.values || [],
    indicators: dims[4]?.values || [],
    years: obsDims[0]?.values || [],
  }
}

function getSeriesValue(series: any, seriesKey: string, obsKey = '0'): number | null {
  const s = series[seriesKey]
  if (!s?.observations?.[obsKey]) return null
  return s.observations[obsKey][0]
}

// ─── Public API functions ────────────────────────────────

/**
 * Get trade overview for a single year (total exports, imports, balance)
 */
export async function getTradeOverview(year: number): Promise<TradeOverview | null> {
  const url = `${WITS_BASE}/tradestats-trade/reporter/${REPORTER}/year/${year}/partner/wld/product/Total/indicator/XPRT-TRD-VL;MPRT-TRD-VL?format=JSON`
  const data = await witsFetch(url)
  if (!data?.dataSets?.[0]?.series) return null

  const dims = parseDimensions(data)
  const series = data.dataSets[0].series

  let exports = 0
  let imports = 0

  for (const [key, val] of Object.entries(series) as [string, any][]) {
    const parts = key.split(':')
    const indIdx = parseInt(parts[4])
    const indicator = dims.indicators[indIdx]?.id
    const obsVal = val.observations?.['0']?.[0] || 0

    if (indicator === 'XPRT-TRD-VL') exports = obsVal
    else if (indicator === 'MPRT-TRD-VL') imports = obsVal
  }

  return {
    year,
    totalExports: exports,
    totalImports: imports,
    tradeBalance: exports - imports,
  }
}

/**
 * Get trade time series over multiple years
 */
export async function getTradeTimeSeries(startYear = 2013, endYear = 2023): Promise<TradeTimeSeries> {
  const years: number[] = []
  const exports: number[] = []
  const imports: number[] = []
  const balance: number[] = []

  // Fetch each year in parallel
  const yearRange = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i)
  const results = await Promise.all(
    yearRange.map(async (y) => {
      const comtrade = await getComtradeAnnualOverview(y)
      if (comtrade) return comtrade
      return getTradeOverview(y)
    })
  )

  for (const r of results) {
    if (r) {
      years.push(r.year)
      exports.push(Math.round(r.totalExports / 1000)) // Convert to US$ millions
      imports.push(Math.round(r.totalImports / 1000))
      balance.push(Math.round(r.tradeBalance / 1000))
    }
  }

  return { years, exports, imports, balance }
}

/**
 * Get trade by product sector for a given year
 */
export async function getTradeBySector(year: number): Promise<TradeBySector[]> {
  const url = `${WITS_BASE}/tradestats-trade/reporter/${REPORTER}/year/${year}/partner/wld/product/all/indicator/XPRT-TRD-VL;MPRT-TRD-VL?format=JSON`
  const data = await witsFetch(url)
  if (!data?.dataSets?.[0]?.series) return []

  const dims = parseDimensions(data)
  const series = data.dataSets[0].series

  // Collect by product
  const productMap = new Map<number, { exports: number; imports: number }>()

  for (const [key, val] of Object.entries(series) as [string, any][]) {
    const parts = key.split(':')
    const prodIdx = parseInt(parts[3])
    const indIdx = parseInt(parts[4])
    const indicator = dims.indicators[indIdx]?.id
    const obsVal = val.observations?.['0']?.[0] || 0

    if (!productMap.has(prodIdx)) {
      productMap.set(prodIdx, { exports: 0, imports: 0 })
    }
    const entry = productMap.get(prodIdx)!

    if (indicator === 'XPRT-TRD-VL') entry.exports = obsVal
    else if (indicator === 'MPRT-TRD-VL') entry.imports = obsVal
  }

  // Only keep HS chapter groups (first 16 products, indices 0-15)
  const sectors: TradeBySector[] = []
  for (const [idx, vals] of productMap) {
    const product = dims.products[idx]
    if (!product) continue
    // Skip aggregate categories (Total, Manufactures, etc.)
    if (['Total', 'All Products'].includes(product.name)) continue
    // Only keep HS-chapter based groups (first set)
    if (idx > 15) continue

    sectors.push({
      code: product.id,
      name: product.name,
      nameFr: PRODUCT_FR[product.name] || product.name,
      exports: Math.round(vals.exports / 1000), // US$ millions
      imports: Math.round(vals.imports / 1000),
    })
  }

  // Sort by total trade volume
  sectors.sort((a, b) => (b.exports + b.imports) - (a.exports + a.imports))
  return sectors
}

/**
 * Get top trade partners (countries only, excluding regions)
 */
export async function getTopPartners(year: number, indicator: 'XPRT-TRD-VL' | 'MPRT-TRD-VL', limit = 10): Promise<TradePartner[]> {
  const url = `${WITS_BASE}/tradestats-trade/reporter/${REPORTER}/year/${year}/partner/all/product/Total/indicator/${indicator}?format=JSON`
  const data = await witsFetch(url)
  if (!data?.dataSets?.[0]?.series) return []

  const dims = parseDimensions(data)
  const series = data.dataSets[0].series

  let worldTotal = 0
  const partners: { code: string; name: string; value: number }[] = []

  for (const [key, val] of Object.entries(series) as [string, any][]) {
    const parts = key.split(':')
    const partnerIdx = parseInt(parts[2])
    const partner = dims.partners[partnerIdx]
    if (!partner) continue

    const obsVal = val.observations?.['0']?.[0] || 0

    if (partner.id === 'WLD') {
      worldTotal = obsVal
    } else if (!REGION_CODES.has(partner.id)) {
      partners.push({
        code: partner.id,
        name: PARTNER_FR[partner.name] || partner.name,
        value: Math.round(obsVal / 1000), // US$ millions
      })
    }
  }

  // Sort by value descending
  partners.sort((a, b) => b.value - a.value)
  const top = partners.slice(0, limit)

  // Calculate shares
  const worldMillion = worldTotal / 1000
  return top.map(p => ({
    ...p,
    share: worldMillion > 0 ? Math.round((p.value / worldMillion) * 1000) / 10 : 0,
  }))
}

/**
 * Get the latest available year of data
 */
export async function getLatestAvailableYear(): Promise<number> {
  const releases = await getComtradeReleases()
  const latestReleaseYear = parseLatestYearFromReleases(releases)
  if (latestReleaseYear && latestReleaseYear > 0) {
    const candidateYears = [latestReleaseYear, latestReleaseYear - 1, latestReleaseYear - 2]
    for (const year of candidateYears) {
      const comtrade = await getComtradeAnnualOverview(year)
      if (comtrade && comtrade.totalExports > 0) return year
      const overview = await getTradeOverview(year)
      if (overview && overview.totalExports > 0) return year
    }
  }

  // Try from newest to oldest
  for (const year of [2026, 2025, 2024, 2023, 2022, 2021, 2020]) {
    const overview = await getTradeOverview(year)
    if (overview && overview.totalExports > 0) return year
  }
  // No verified year available
  return 0
}

/**
 * Get complete dashboard data (all queries in parallel)
 */
export async function getTradeDashboardData() {
  const latestYear = await getLatestAvailableYear()
  const releases = await getComtradeReleases()
  const latestReleaseYear = parseLatestYearFromReleases(releases)

  const [
    overview,
    timeSeries,
    sectors,
    topExportPartners,
    topImportPartners,
  ] = await Promise.all([
    (async () => {
      const comtrade = await getComtradeAnnualOverview(latestYear)
      if (comtrade) return comtrade
      return getTradeOverview(latestYear)
    })(),
    getTradeTimeSeries(2013, latestYear),
    getTradeBySector(latestYear),
    getTopPartners(latestYear, 'XPRT-TRD-VL', 10),
    getTopPartners(latestYear, 'MPRT-TRD-VL', 10),
  ])

  return {
    latestYear,
    latestReleaseYear,
    overview,
    timeSeries,
    sectors,
    topExportPartners,
    topImportPartners,
    source: 'Comtrade (priority when API key available) + WITS fallback',
    lastUpdated: new Date().toISOString(),
  }
}
