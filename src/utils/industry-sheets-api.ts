/**
 * Google Sheets Integration for Industry Dashboard
 * Using Google Visualization API (gviz) - Works without publishing!
 * Spreadsheet: https://docs.google.com/spreadsheets/d/1w-yPjOouHYYjoD8Y8f42_4ovpIuBv9dWsBG_7N_aTYw
 */

const SPREADSHEET_ID = '1w-yPjOouHYYjoD8Y8f42_4ovpIuBv9dWsBG_7N_aTYw'

// Cache for 5 minutes
const CACHE_TTL = 5 * 60 * 1000
let cache: { data: any; expires: number } | null = null

// ─── Types ───────────────────────────────────────────────

export interface ProductionDPEERow {
  date: string
  values: Record<string, number | null>
}

export interface ProductionDPEEData {
  products: string[]
  series: ProductionDPEERow[]
}

export interface TUCPData {
  period: string
  value: number
}

export interface IndustryData {
  year: number
  indicators: IndicatorData[]
  ihpiData: TimeSeriesData[]
  ihpiBranches: BranchTimeSeriesData[]
  ippiData: TimeSeriesData[]
  ippiBranches: IPPIBranchData[]
  icaiData: QuarterlySeriesData[]
  icaiBranches: QuarterlyBranchData[]
  pibBranches: BranchData[]
  cipData: CIPYearData[]
  cipScore: CompetitivenessData | null
  pciData: PCIDimensionData[]
  productionDPEE: ProductionDPEEData
  tucpData: TUCPData[]
}

export interface IndicatorData {
  name: string
  lastPeriod: string
  value: string
  description: string
  source?: string
}

export interface TimeSeriesData {
  period: string
  value: number
  branch?: string
}

export interface BranchTimeSeriesData {
  branch: string
  data: { period: string; value: number }[]
}

export interface IPPIBranchData {
  branch: string
  data: { period: string; value: number; yoy: number | null }[]
}

export interface QuarterlySeriesData {
  period: string
  value: number
}

export interface QuarterlyBranchData {
  branch: string
  data: { period: string; value: number }[]
}

export interface BranchData {
  name: string
  code: string
  values: { [year: string]: number }
  latest: number
  growth: number
}

export interface CompetitivenessData {
  year: number
  score: number
  rank: number
  totalCountries: number
}

export interface CIPYearData {
  year: number
  score: number
  rank: number
  totalCountries: number
}

export interface PCIDimensionData {
  year: number
  global: number
  humanCapital: number
  naturalCapital: number
  energy: number
  transport: number
  ict: number
  institutions: number
  privateSector: number
  structuralChange: number
}

// ─── Google Visualization API Parser ─────────────────────

interface GvizColumn { id: string; label: string; type: string }
interface GvizCell { v: any; f?: string }
interface GvizRow { c: (GvizCell | null)[] }
interface GvizTable { cols: GvizColumn[]; rows: GvizRow[] }
interface GvizResponse { version: string; reqId: string; status: string; table: GvizTable }

function parseGvizResponse(text: string): GvizResponse | null {
  try {
    const match = text.match(/google\.visualization\.Query\.setResponse\((.*)\);?$/s)
    if (!match) return null
    return JSON.parse(match[1])
  } catch (error) {
    console.error('[Industry] Failed to parse gviz:', error)
    return null
  }
}

function gvizTableToRows(table: GvizTable): string[][] {
  const rows: string[][] = []
  rows.push(table.cols.map(col => col.label || col.id || ''))
  for (const row of table.rows) {
    const cells: string[] = []
    for (const cell of row.c) {
      if (cell === null || cell.v === null) cells.push('')
      else cells.push(String(cell.f || cell.v))
    }
    rows.push(cells)
  }
  return rows
}

async function fetchSheetDataViaGviz(sheetName: string): Promise<string[][] | null> {
  try {
    const encodedSheet = encodeURIComponent(sheetName)
    const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodedSheet}`
    console.log(`[Industry] Fetching sheet: "${sheetName}"`)
    const response = await fetch(url, { headers: { 'User-Agent': 'CRADES-Industry-Dashboard/2.0' } })
    if (!response.ok) { console.error(`[Industry] Fetch failed: ${response.status}`); return null }
    const text = await response.text()
    const gvizData = parseGvizResponse(text)
    if (!gvizData || gvizData.status !== 'ok') { console.error('[Industry] Gviz response not OK'); return null }
    const rows = gvizTableToRows(gvizData.table)
    console.log(`[Industry] Fetched ${rows.length} rows from "${sheetName}"`)
    return rows
  } catch (error) {
    console.error(`[Industry] Error fetching "${sheetName}":`, error)
    return null
  }
}

// ─── Parsers ─────────────────────────────────────

const MONTH_MAP: Record<string, string> = {
  'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'May': '05', 'Jun': '06',
  'Jul': '07', 'Aug': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
}
const MONTH_FR: Record<string, string> = {
  '01': 'Jan', '02': 'Fev', '03': 'Mar', '04': 'Avr', '05': 'Mai', '06': 'Jun',
  '07': 'Jul', '08': 'Aou', '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec'
}

function parseMonthHeader(h: string): string | null {
  const m = h.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})/)
  if (!m) return null
  return `${m[2]}-${MONTH_MAP[m[1]]}`
}

function parseIHPI(rows: string[][]): { ensemble: TimeSeriesData[]; branches: BranchTimeSeriesData[] } {
  if (rows.length < 2) return { ensemble: [], branches: [] }
  const headers = rows[0]
  const periods: string[] = []
  for (let c = 1; c < headers.length; c++) {
    const p = parseMonthHeader(headers[c])
    periods.push(p || '')
  }

  const ensemble: TimeSeriesData[] = []
  const branches: BranchTimeSeriesData[] = []

  for (let r = 1; r < rows.length; r++) {
    const branchName = rows[r][0]?.trim() || ''
    if (!branchName || branchName.length < 3) continue
    const isEnsemble = branchName.toUpperCase().includes('ENSEMBLE')
    const branchData: { period: string; value: number }[] = []

    for (let c = 1; c < rows[r].length && c - 1 < periods.length; c++) {
      const period = periods[c - 1]
      if (!period) continue
      const val = parseFloat(rows[r][c]?.replace(',', '.') || '')
      if (!isNaN(val) && val > 0) {
        if (isEnsemble) ensemble.push({ period, value: val })
        branchData.push({ period, value: val })
      }
    }
    if (branchData.length > 0 && !branchName.toUpperCase().includes('EGRENAGE')) {
      branches.push({ branch: branchName, data: branchData })
    }
  }
  console.log(`[Industry] Parsed IHPI: ${ensemble.length} ensemble points, ${branches.length} branches`)
  return { ensemble, branches }
}

function parseIPPI(rows: string[][]): { ensemble: TimeSeriesData[]; branches: IPPIBranchData[] } {
  if (rows.length < 2) return { ensemble: [], branches: [] }
  const headers = rows[0]
  const periods: string[] = []
  // IPPI has code in col 0, name in col 1, data from col 2+
  const dataStart = 2
  for (let c = dataStart; c < headers.length; c++) {
    const p = parseMonthHeader(headers[c])
    periods.push(p || '')
  }

  const ensemble: TimeSeriesData[] = []
  const branches: IPPIBranchData[] = []
  // Key sectors for heatmap
  const targetSectors = [
    'PRODUITS DES INDUSTRIES EXTRACTIVES',
    'Produits agro-alimentaires', 'Produits alimentaires',
    'Produits textiles', 'Produits chimiques',
    'Matériaux minéraux', 'Materiaux mineraux',
    'Produits métallurgiques', 'Produits metallurgiques',
    'ELECTRICITE', 'Electricité',
    'ENSEMBLE HORS EGRENAGE'
  ]

  for (let r = 1; r < rows.length; r++) {
    const branchName = (rows[r][1] || rows[r][0] || '').trim()
    if (!branchName || branchName.length < 3) continue
    const isEnsemble = branchName.toUpperCase().includes('ENSEMBLE HORS')
    const isTarget = targetSectors.some(t => branchName.toUpperCase().includes(t.toUpperCase()))

    const branchData: { period: string; value: number; yoy: number | null }[] = []
    const rawValues: { period: string; value: number }[] = []

    for (let c = dataStart; c < rows[r].length && c - dataStart < periods.length; c++) {
      const period = periods[c - dataStart]
      if (!period) continue
      const val = parseFloat(rows[r][c]?.replace(',', '.') || '')
      if (!isNaN(val) && val > 0) {
        rawValues.push({ period, value: val })
      }
    }

    // Compute YoY changes
    for (let i = 0; i < rawValues.length; i++) {
      const { period, value } = rawValues[i]
      let yoy: number | null = null
      if (i >= 12) {
        const prev = rawValues[i - 12]
        if (prev && prev.value > 0) {
          yoy = ((value - prev.value) / prev.value) * 100
        }
      }
      branchData.push({ period, value, yoy })
      if (isEnsemble) ensemble.push({ period, value })
    }

    if (branchData.length > 0 && (isTarget || isEnsemble)) {
      branches.push({ branch: branchName.replace(/dont…$/, '').trim(), data: branchData })
    }
  }
  console.log(`[Industry] Parsed IPPI: ${ensemble.length} ensemble, ${branches.length} branches`)
  return { ensemble, branches }
}

function parseICAI(rows: string[][]): { ensemble: QuarterlySeriesData[]; branches: QuarterlyBranchData[] } {
  if (rows.length < 2) return { ensemble: [], branches: [] }
  const headers = rows[0]
  const periods: string[] = []
  const dataStart = 2
  for (let c = dataStart; c < headers.length; c++) {
    const h = headers[c]?.trim() || ''
    const m = h.match(/(\d{4})Q(\d)/)
    if (m) periods.push(`${m[1]}-Q${m[2]}`)
    else periods.push(h)
  }

  const ensemble: QuarterlySeriesData[] = []
  const branches: QuarterlyBranchData[] = []

  for (let r = 1; r < rows.length; r++) {
    const branchName = (rows[r][1] || rows[r][0] || '').trim()
    if (!branchName || branchName.length < 3) continue
    const isEnsemble = branchName.toUpperCase().includes('ENSEMBLE HORS')
    // Capture main aggregate categories (the "dont…" rows) + ENSEMBLE
    const isMainAggregate = branchName.includes('dont…') || branchName.includes('dont...')
    const isEnvironmental = branchName.toUpperCase().includes('INDUSTRIES ENVIRONNEMENTALES')

    const branchData: { period: string; value: number }[] = []
    for (let c = dataStart; c < rows[r].length && c - dataStart < periods.length; c++) {
      const period = periods[c - dataStart]
      if (!period) continue
      const val = parseFloat(rows[r][c]?.replace(',', '.') || '')
      if (!isNaN(val) && val > 0) {
        if (isEnsemble) ensemble.push({ period, value: val })
        branchData.push({ period, value: val })
      }
    }
    if (branchData.length > 0 && (isMainAggregate || isEnsemble || isEnvironmental)) {
      branches.push({ branch: branchName.replace(/dont…$/, '').replace(/dont\.\.\.$/, '').trim(), data: branchData })
    }
  }
  console.log(`[Industry] Parsed ICAI: ${ensemble.length} ensemble, ${branches.length} branches`)
  return { ensemble, branches }
}

function parsePIBBranches(rows: string[][]): BranchData[] {
  if (rows.length < 3) return []
  const headers = rows[0]
  const yearColumns: { index: number; year: string }[] = []
  for (let i = 2; i < headers.length; i++) {
    const year = headers[i].trim().replace(/\s/g, '')
    if (year.match(/^\d{4}$/)) yearColumns.push({ index: i, year })
  }
  if (yearColumns.length === 0) return []

  const branches: BranchData[] = []
  // Skip header row, and stop before notes row
  for (let rowIdx = 1; rowIdx < rows.length; rowIdx++) {
    const row = rows[rowIdx]
    const code = row[0]?.trim() || ''
    const branchName = row[1]?.trim() || ''
    if (!branchName || branchName.length < 3) continue
    if (branchName.includes('Note') || branchName.includes('VALEUR AJOUTEE')) continue
    // Only secondary sector codes (E-M)
    if (!code.match(/^[A-Z]\d{2}$/)) continue

    const values: { [year: string]: number } = {}
    let latest = 0
    for (const { index, year } of yearColumns) {
      const v = parseFloat(row[index]?.replace(/[^0-9.-]/g, '') || '0')
      if (v > 0) { values[year] = v; latest = v }
    }
    if (Object.keys(values).length > 0) {
      const years = Object.keys(values).sort()
      const last2 = years.slice(-2)
      const growth = last2.length === 2
        ? ((values[last2[1]] - values[last2[0]]) / values[last2[0]]) * 100
        : 0
      branches.push({ name: branchName, code, values, latest, growth })
    }
  }
  console.log(`[Industry] Parsed ${branches.length} PIB branches`)
  return branches
}

function parseCIP(rows: string[][]): { latest: CompetitivenessData | null; all: CIPYearData[] } {
  const all: CIPYearData[] = []
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    const year = parseInt(row[0] || '0')
    const score = parseFloat(row[1]?.replace(',', '.') || '0')
    const rank = parseInt(row[2] || '0')
    const total = parseInt(row[3] || '152')
    if (year >= 2010 && score > 0 && rank > 0) {
      all.push({ year, score, rank, totalCountries: total })
    }
  }
  all.sort((a, b) => a.year - b.year)
  const latest = all.length > 0 ? all[all.length - 1] : null
  console.log(`[Industry] Parsed CIP: ${all.length} years, latest = ${latest?.year}`)
  return { latest, all }
}

function parsePCI(rows: string[][]): PCIDimensionData[] {
  if (rows.length < 2) return []
  const data: PCIDimensionData[] = []
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r]
    const year = parseInt(row[0] || '0')
    if (year < 2000) continue
    const pf = (v: string) => parseFloat(v?.replace(',', '.') || '0')
    data.push({
      year,
      global: pf(row[1]),
      humanCapital: pf(row[2]),
      naturalCapital: pf(row[3]),
      energy: pf(row[4]),
      transport: pf(row[5]),
      ict: pf(row[6]),
      institutions: pf(row[7]),
      privateSector: pf(row[8]),
      structuralChange: pf(row[9]),
    })
  }
  console.log(`[Industry] Parsed PCI: ${data.length} years`)
  return data
}

function parseTUCP(rows: string[][]): TUCPData[] {
  const data: TUCPData[] = []
  for (let r = 0; r < rows.length; r++) {
    const periodRaw = (rows[r][0] || '').trim()
    const valRaw = (rows[r][1] || '').replace(',', '.').trim()
    // Match patterns like "2018 T2", "2024 T1"
    const m = periodRaw.match(/(\d{4})\s*T(\d)/)
    if (!m) continue
    const val = parseFloat(valRaw)
    if (isNaN(val) || val <= 0) continue
    data.push({ period: `${m[1]}-T${m[2]}`, value: val })
  }
  console.log(`[Industry] Parsed TUCP: ${data.length} quarters`)
  return data
}

function parseProductionDPEE(rows: string[][]): ProductionDPEEData {
  if (rows.length < 2) return { products: [], series: [] }
  const headers = rows[0]
  // Col 0 = Date, cols 1..N = product names
  const products: string[] = []
  for (let c = 1; c < headers.length; c++) {
    products.push(headers[c]?.trim() || `Col${c}`)
  }

  const series: ProductionDPEERow[] = []
  for (let r = 1; r < rows.length; r++) {
    const dateRaw = rows[r][0]?.trim() || ''
    // gviz date format: "Date(YYYY,M,D)" or "YYYY-MM"
    let date = dateRaw
    const dm = dateRaw.match(/Date\((\d{4}),(\d{1,2}),/)
    if (dm) {
      date = `${dm[1]}-${String(parseInt(dm[2]) + 1).padStart(2, '0')}`
    }
    if (!date || date.length < 6) continue

    const values: Record<string, number | null> = {}
    for (let c = 1; c < rows[r].length && c - 1 < products.length; c++) {
      const raw = rows[r][c]?.replace(',', '.').replace(/\s/g, '') || ''
      const val = parseFloat(raw)
      values[products[c - 1]] = isNaN(val) ? null : val
    }
    series.push({ date, values })
  }
  console.log(`[Industry] Parsed Production DPEE: ${series.length} rows, ${products.length} products`)
  return { products, series }
}

function parseIndicatorsSummary(rows: string[][]): IndicatorData[] {
  const indicators: IndicatorData[] = []
  let inSummarySection = false
  for (const row of rows) {
    const col0 = row[0]?.trim() || ''
    if (col0.includes('DERNIÈRES VALEURS') || col0.includes('DERNIERES VALEURS')) { inSummarySection = true; continue }
    if (col0 === 'Indicateur') continue
    if (inSummarySection && col0.length > 3) {
      const name = col0
      const period = row[1]?.trim() || ''
      const value = row[2]?.trim() || ''
      if (name && value && value !== '—' && value !== '–') {
        let source = 'ANSD'
        if (name.includes('CIP')) source = 'UNIDO'
        indicators.push({ name, lastPeriod: period, value, description: `${name} - ${value}`, source })
      }
    }
  }
  console.log(`[Industry] Parsed ${indicators.length} indicators`)
  return indicators
}

// ─── Default Data ─────────────────────────────────────

function getDefaultData(): IndustryData {
  return {
    year: 2024,
    indicators: [
      { name: 'IHPI Ensemble', lastPeriod: 'Déc. 2024', value: '+24,9% en 2024 (cumul)', description: 'Production Industrielle', source: 'ANSD' },
      { name: 'IPPI Ensemble', lastPeriod: 'Jan. 2026', value: '-1,7% variation annuelle', description: 'Prix Production', source: 'ANSD' },
      { name: 'ICAI Ensemble', lastPeriod: 'T3 2025', value: '+16,5% variation annuelle', description: "Chiffre d'Affaires", source: 'ANSD' },
      { name: 'CIP Score', lastPeriod: '2023', value: '0,061 / Rang 50', description: 'Compétitivité UNIDO', source: 'UNIDO' }
    ],
    ihpiData: [],
    ihpiBranches: [],
    ippiData: [],
    ippiBranches: [],
    icaiData: [],
    icaiBranches: [],
    pibBranches: [
      { name: 'Fabrication de produits agro-alimentaires', code: 'F00', values: { '2023': 1163 }, latest: 1163, growth: 0.3 },
      { name: 'Autres produits manufacturiers', code: 'J00', values: { '2023': 1010 }, latest: 1010, growth: 7.6 },
      { name: 'Construction', code: 'M00', values: { '2023': 366 }, latest: 366, growth: 7.0 },
      { name: 'Activités extractives', code: 'E00', values: { '2023': 296 }, latest: 296, growth: -11.1 },
      { name: 'Production et distribution d\'électricité et d\'eau', code: 'K00', values: { '2023': 194 }, latest: 194, growth: 9.0 },
      { name: 'Fabrication de matériaux de construction', code: 'I00', values: { '2023': 166 }, latest: 166, growth: 12.9 },
      { name: 'Distribution d\'eau, assainissement', code: 'L00', values: { '2023': 148 }, latest: 148, growth: 5.7 },
      { name: 'Fabrication de produits chimiques de base', code: 'H00', values: { '2023': 62 }, latest: 62, growth: 1.6 },
      { name: 'Raffinage du pétrole et cokéfaction', code: 'G00', values: { '2023': 59 }, latest: 59, growth: 63.9 },
    ],
    cipData: [
      { year: 2015, score: 0.070, rank: 48, totalCountries: 152 },
      { year: 2016, score: 0.079, rank: 63, totalCountries: 152 },
      { year: 2018, score: 0.063, rank: 50, totalCountries: 152 },
      { year: 2019, score: 0.058, rank: 53, totalCountries: 152 },
      { year: 2021, score: 0.054, rank: 50, totalCountries: 152 },
      { year: 2023, score: 0.061, rank: 50, totalCountries: 152 },
    ],
    cipScore: { year: 2023, score: 0.061, rank: 50, totalCountries: 152 },
    pciData: [
      { year: 2000, global: 23, humanCapital: 45.83, naturalCapital: 19.76, energy: 14.45, transport: 52.77, ict: 40.82, institutions: 6.33, privateSector: 11.95, structuralChange: 36.68 },
      { year: 2012, global: 31.51, humanCapital: 47.62, naturalCapital: 28.91, energy: 23.75, transport: 50.71, ict: 42.57, institutions: 22.46, privateSector: 14.16, structuralChange: 43.34 },
      { year: 2024, global: 38.59, humanCapital: 60.07, naturalCapital: 36.33, energy: 27.54, transport: 53.51, ict: 42.97, institutions: 40.93, privateSector: 19.21, structuralChange: 45.21 },
    ],
    productionDPEE: { products: [], series: [] },
    tucpData: [],
  }
}

// ─── Main Fetch Function ──────────────────────────────────

export async function fetchIndustryData(): Promise<IndustryData> {
  if (cache && cache.expires > Date.now()) {
    console.log('[Industry] Returning cached data')
    return cache.data
  }

  console.log('[Industry] Fetching fresh data from Google Sheets...')

  try {
    const [summaryRows, ihpiRows, ippiRows, icaiRows, pibRows, cipRows, pciRows, prodDPEERows, tucpRows] = await Promise.all([
      fetchSheetDataViaGviz('Feuille 1'),
      fetchSheetDataViaGviz('IHPI'),
      fetchSheetDataViaGviz('IPPI'),
      fetchSheetDataViaGviz('ICAI'),
      fetchSheetDataViaGviz('PIB_Branches'),
      fetchSheetDataViaGviz('CIP_Competitivite'),
      fetchSheetDataViaGviz('PCI_Granulaire_UNCTAD'),
      fetchSheetDataViaGviz('Production_Industrielle_DPEE'),
      fetchSheetDataViaGviz('Taux_utilisation'),
    ])

    const indicators = summaryRows ? parseIndicatorsSummary(summaryRows) : getDefaultData().indicators
    const ihpiParsed = ihpiRows ? parseIHPI(ihpiRows) : { ensemble: [], branches: [] }
    const ippiParsed = ippiRows ? parseIPPI(ippiRows) : { ensemble: [], branches: [] }
    const icaiParsed = icaiRows ? parseICAI(icaiRows) : { ensemble: [], branches: [] }
    const pibBranches = pibRows ? parsePIBBranches(pibRows) : getDefaultData().pibBranches
    const cipParsed = cipRows ? parseCIP(cipRows) : { latest: getDefaultData().cipScore, all: getDefaultData().cipData }
    const pciData = pciRows ? parsePCI(pciRows) : getDefaultData().pciData
    const productionDPEE = prodDPEERows ? parseProductionDPEE(prodDPEERows) : getDefaultData().productionDPEE
    const tucpData = tucpRows ? parseTUCP(tucpRows) : getDefaultData().tucpData

    const data: IndustryData = {
      year: cipParsed.latest?.year || 2024,
      indicators: indicators.length > 0 ? indicators : getDefaultData().indicators,
      ihpiData: ihpiParsed.ensemble.length > 0 ? ihpiParsed.ensemble : getDefaultData().ihpiData,
      ihpiBranches: ihpiParsed.branches,
      ippiData: ippiParsed.ensemble,
      ippiBranches: ippiParsed.branches,
      icaiData: icaiParsed.ensemble,
      icaiBranches: icaiParsed.branches,
      pibBranches: pibBranches.length > 0 ? pibBranches : getDefaultData().pibBranches,
      cipData: cipParsed.all.length > 0 ? cipParsed.all : getDefaultData().cipData,
      cipScore: cipParsed.latest || getDefaultData().cipScore,
      pciData: pciData.length > 0 ? pciData : getDefaultData().pciData,
      productionDPEE: productionDPEE.series.length > 0 ? productionDPEE : getDefaultData().productionDPEE,
      tucpData: tucpData.length > 0 ? tucpData : getDefaultData().tucpData,
    }

    console.log('[Industry] Successfully parsed all data')
    cache = { data, expires: Date.now() + CACHE_TTL }
    return data
  } catch (error) {
    console.error('[Industry] Failed to fetch data:', error)
    const data = getDefaultData()
    cache = { data, expires: Date.now() + CACHE_TTL }
    return data
  }
}
