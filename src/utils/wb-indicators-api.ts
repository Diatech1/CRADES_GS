/**
 * World Bank Indicators API Client
 * Economic development and social indicators for Senegal
 * 
 * Documentation: https://datahelpdesk.worldbank.org/knowledgebase/articles/889386-api-documentation
 * 
 * Key indicators for Senegal:
 * - GDP (current US$): NY.GDP.MKTP.CD
 * - GDP growth (annual %): NY.GDP.MKTP.KD.ZG
 * - GNI per capita: NY.GNP.PCAP.CD
 * - Exports (% of GDP): NE.EXP.GNFS.CD
 * - Imports (% of GDP): NE.IMP.GNFS.CD
 * - FDI net inflows: BX.KLT.DINV.CD.WD
 * - Manufacturing (% of GDP): NV.IND.MANF.CD
 * - Literacy rate: SE.ADT.LITR.ZS
 * - Life expectancy: SP.DYN.LE00.IN
 * - Poverty headcount ratio: SI.POV.DDAY
 */

import { getSenegalWeoLatest, getSenegalWeoSeries } from './imf-api'

const WB_BASE = 'https://api.worldbank.org/v2'
const SENEGAL_CODE = 'SEN'

// In-memory cache — 24h TTL
const wbCache = new Map<string, { data: any; expires: number }>()
const WB_CACHE_TTL = 24 * 60 * 60 * 1000

// ─── Types ───────────────────────────────────────────────

export interface WBIndicator {
  code: string
  name: string
  value: number
  unit: string
  year: number
  source: string
}

export interface WBCountryData {
  name: string
  region: string
  incomeLevel: string
  lendingType: string
}

// ─── Economic Indicators ───────────────────────────────

const KEY_INDICATORS = [
  'NY.GDP.MKTP.CD',      // GDP (current US$)
  'NY.GDP.MKTP.KD.ZG',   // GDP growth (annual %)
  'NY.GNP.PCAP.CD',      // GNI per capita
  'NE.EXP.GNFS.CD',      // Exports
  'NE.IMP.GNFS.CD',      // Imports
  'BX.KLT.DINV.CD.WD',   // FDI inflows
  'NV.IND.MANF.CD',      // Manufacturing value added
  'NE.RSB.GNFS.CD',      // Trade balance (goods and services)
]

// IMF-first mapping (WEO annual indicators). If a WB code is not mapped here,
// the client will directly fall back to World Bank.
const WB_TO_IMF_WEO: Record<string, string> = {
  'NY.GDP.MKTP.CD': 'NGDPD',
  'NY.GDP.MKTP.KD.ZG': 'NGDP_RPCH',
  'NE.EXP.GNFS.CD': 'BX',
  'NE.IMP.GNFS.CD': 'BM',
  'SP.POP.TOTL': 'LP',
}

const INDICATOR_NAMES: Record<string, { en: string; fr: string; unit: string }> = {
  'NY.GDP.MKTP.CD': {
    en: 'GDP (current US$)',
    fr: 'PIB (US$ courants)',
    unit: 'US$ millions',
  },
  'NY.GDP.MKTP.KD.ZG': {
    en: 'GDP growth (annual %)',
    fr: 'Croissance du PIB (%)',
    unit: '%',
  },
  'NY.GNP.PCAP.CD': {
    en: 'GNI per capita',
    fr: 'RNB par habitant',
    unit: 'US$',
  },
  'NE.EXP.GNFS.CD': {
    en: 'Exports (goods and services)',
    fr: 'Exportations (biens et services)',
    unit: 'US$ millions',
  },
  'NE.IMP.GNFS.CD': {
    en: 'Imports (goods and services)',
    fr: 'Importations (biens et services)',
    unit: 'US$ millions',
  },
  'BX.KLT.DINV.CD.WD': {
    en: 'FDI net inflows',
    fr: 'IDE nets entrants',
    unit: 'US$ millions',
  },
  'NV.IND.MANF.CD': {
    en: 'Manufacturing value added',
    fr: 'Valeur ajoutée manufacturière',
    unit: 'US$ millions',
  },
  'NE.RSB.GNFS.CD': {
    en: 'Trade balance',
    fr: 'Balance commerciale',
    unit: 'US$ millions',
  },
  'SP.POP.TOTL': {
    en: 'Population, total',
    fr: 'Population totale',
    unit: 'persons',
  },
}

async function getImfMappedIndicator(code: string, year?: number): Promise<WBIndicator | null> {
  const imfCode = WB_TO_IMF_WEO[code]
  if (!imfCode) return null

  const point = await getSenegalWeoLatest(imfCode, year)
  if (!point) return null

  const meta = INDICATOR_NAMES[code] || {
    en: code,
    fr: code,
    unit: '',
  }
  return {
    code,
    name: meta.en,
    value: point.value,
    unit: meta.unit,
    year: point.year,
    source: `IMF WEO (${imfCode})`,
  }
}

async function getImfMappedTimeSeries(code: string, startYear: number, endYear: number): Promise<WBIndicator[]> {
  const imfCode = WB_TO_IMF_WEO[code]
  if (!imfCode) return []

  const points = await getSenegalWeoSeries(imfCode, startYear)
  if (!points.length) return []

  const meta = INDICATOR_NAMES[code] || { en: code, fr: code, unit: '' }
  return points
    .filter((p) => p.year >= startYear && p.year <= endYear)
    .map((p) => ({
      code,
      name: meta.en,
      value: p.value,
      unit: meta.unit,
      year: p.year,
      source: `IMF WEO (${imfCode})`,
    }))
}

export async function getCountryInfo(): Promise<WBCountryData> {
  const cacheKey = 'wb:country:sen'
  const cached = wbCache.get(cacheKey)
  if (cached && cached.expires > Date.now()) {
    return cached.data
  }

  try {
    const res = await fetch(`${WB_BASE}/country/${SENEGAL_CODE}`)
    if (!res.ok) throw new Error(`WB API error: ${res.status}`)

    const data = await res.json()
    if (!data || !data[1] || !data[1][0]) throw new Error('Invalid response')

    const country = data[1][0]
    const info: WBCountryData = {
      name: country.name,
      region: country.region?.value || '',
      incomeLevel: country.incomeLevel?.value || '',
      lendingType: country.lendingType?.value || '',
    }

    wbCache.set(cacheKey, { data: info, expires: Date.now() + WB_CACHE_TTL })
    return info
  } catch (e) {
    console.warn('WB Country info fetch failed:', e)
    return {
      name: '',
      region: '',
      incomeLevel: '',
      lendingType: '',
    }
  }
}

export async function getIndicators(year?: number): Promise<WBIndicator[]> {
  const cacheKey = `wb:indicators:${year || 'latest'}`
  const cached = wbCache.get(cacheKey)
  if (cached && cached.expires > Date.now()) {
    return cached.data
  }

  const indicators: WBIndicator[] = []

  for (const code of KEY_INDICATORS) {
    try {
      // First choice: IMF (when mapping exists)
      const imfIndicator = await getImfMappedIndicator(code, year)
      if (imfIndicator) {
        indicators.push(imfIndicator)
        continue
      }

      // Second choice: World Bank
      const params = new URLSearchParams({
        format: 'json',
        per_page: '10',
      })

      const res = await fetch(
        `${WB_BASE}/country/${SENEGAL_CODE}/indicator/${code}?${params}`,
        { headers: { 'Accept': 'application/json' } }
      )

      if (!res.ok) continue

      const data = await res.json()
      if (!data || !data[1]) continue

      // Find the most recent year with data
      const entry = data[1].find((e: any) => {
        if (year) return parseInt(e.date) === year
        return e.value !== null
      })

      if (entry && entry.value !== null) {
        const meta = INDICATOR_NAMES[code]
        indicators.push({
          code,
          name: meta.en,
          value: parseFloat(entry.value),
          unit: meta.unit,
          year: parseInt(entry.date),
          source: 'World Bank',
        })
      }
    } catch (e) {
      console.warn(`Failed to fetch WB indicator ${code}:`, e)
    }
  }

  wbCache.set(cacheKey, { data: indicators, expires: Date.now() + WB_CACHE_TTL })
  return indicators
}

export async function getIndicator(code: string, year?: number): Promise<WBIndicator | null> {
  const cacheKey = `wb:indicator:${code}:${year || 'latest'}`
  const cached = wbCache.get(cacheKey)
  if (cached && cached.expires > Date.now()) {
    return cached.data
  }

  // First choice: IMF (when mapping exists)
  const imfIndicator = await getImfMappedIndicator(code, year)
  if (imfIndicator) {
    wbCache.set(cacheKey, { data: imfIndicator, expires: Date.now() + WB_CACHE_TTL })
    return imfIndicator
  }

  // Second choice: World Bank
  try {
    const params = new URLSearchParams({
      format: 'json',
      per_page: '50',
    })

    const res = await fetch(
      `${WB_BASE}/country/${SENEGAL_CODE}/indicator/${code}?${params}`,
      { headers: { 'Accept': 'application/json' } }
    )

    if (!res.ok) return null

    const data = await res.json()
    if (!data || !data[1]) return null

    const entry = data[1].find((e: any) => {
      if (year) return parseInt(e.date) === year
      return e.value !== null
    })

    if (entry && entry.value !== null) {
      const meta = INDICATOR_NAMES[code] || {
        en: code,
        fr: code,
        unit: '',
      }

      const indicator: WBIndicator = {
        code,
        name: meta.en,
        value: parseFloat(entry.value),
        unit: meta.unit,
        year: parseInt(entry.date),
        source: 'World Bank',
      }

      wbCache.set(cacheKey, { data: indicator, expires: Date.now() + WB_CACHE_TTL })
      return indicator
    }
  } catch (e) {
    console.warn(`WB Indicator fetch failed for ${code}:`, e)
  }

  return null
}

export async function getTimeSeries(
  code: string,
  startYear: number = 2015,
  endYear: number = 2025
): Promise<WBIndicator[]> {
  const cacheKey = `wb:timeseries:${code}:${startYear}:${endYear}`
  const cached = wbCache.get(cacheKey)
  if (cached && cached.expires > Date.now()) {
    return cached.data
  }

  // First choice: IMF (when mapping exists)
  const imfSeries = await getImfMappedTimeSeries(code, startYear, endYear)
  if (imfSeries.length > 0) {
    wbCache.set(cacheKey, { data: imfSeries, expires: Date.now() + WB_CACHE_TTL })
    return imfSeries
  }

  // Second choice: World Bank
  try {
    const params = new URLSearchParams({
      format: 'json',
      per_page: '100',
    })

    const res = await fetch(
      `${WB_BASE}/country/${SENEGAL_CODE}/indicator/${code}?${params}`,
      { headers: { 'Accept': 'application/json' } }
    )

    if (!res.ok) return []

    const data = await res.json()
    if (!data || !data[1]) return []

    const timeSeries = data[1]
      .filter((e: any) => {
        const year = parseInt(e.date)
        return e.value !== null && year >= startYear && year <= endYear
      })
      .map((e: any) => {
        const meta = INDICATOR_NAMES[code] || { en: code, fr: code, unit: '' }
        return {
          code,
          name: meta.en,
          value: parseFloat(e.value),
          unit: meta.unit,
          year: parseInt(e.date),
          source: 'World Bank',
        }
      })

    wbCache.set(cacheKey, { data: timeSeries, expires: Date.now() + WB_CACHE_TTL })
    return timeSeries
  } catch (e) {
    console.warn(`WB TimeSeries fetch failed for ${code}:`, e)
    return []
  }
}

// ─── Sample Data ───────────────────────────────────────

