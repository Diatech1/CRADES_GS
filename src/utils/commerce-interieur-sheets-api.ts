/**
 * Google Sheets Integration for Commerce Intérieur Dashboard
 * Using Google Visualization API (gviz) - Works without publishing!
 * Spreadsheet: https://docs.google.com/spreadsheets/d/1FqiLKYBcWoUsJiBgMNlAD709CrYZx_3bwiJ0UT-CcDQ
 */

const SPREADSHEET_ID = '1FqiLKYBcWoUsJiBgMNlAD709CrYZx_3bwiJ0UT-CcDQ'
const DENREES_SPREADSHEET_ID = '125rwsUS2bOSYSmpoXmv3mCg28ZVM715OcYJJMIbiuDg'
const DENREES_SHEET_NAME = '6_Prix_Denrées_Base'
const IHPC_SHEET_NAME = '1_IHPC_Global'
const IHPC_DESAGREGE_GID = '351552979' // Last sheet — IHPC disaggregated by COICOP
const EMPLOI_COMMERCE_SHEET_NAME = '9_Emploi_Commerce'

// Cache for 5 minutes
const CACHE_TTL = 5 * 60 * 1000
let cache: { data: any; expires: number } | null = null

// ─── Types ───────────────────────────────────────────────

export interface IhpcDesagregeRow {
  date: string
  global: number
  alimentaire: number
  boissonsTabac: number
  vetementsChaussures: number
  logementEau: number
  soinsPersonnels: number
  assurancesFinances: number
  restaurantsHebergement: number
  enseignement: number
  loisirsCulture: number
  informationCommunication: number
  transport: number
  ameublementMenager: number
  sante: number
}

export interface CommerceInterieurData {
  year: string
  indicators: IndicatorData[]
  ihpcData: { period: string; value: number; change: number }[]
  ihpcSeries: { date: string; value: number }[]
  ihpcDesagrege: IhpcDesagregeRow[]
  icaiSeries: { date: string; gros: number; detail: number; autoMoto: number }[]
  icaiBreakdown: { category: string; value: number; share: number }[]
  inflationData: { year: string; rate: number }[]
  emploiCommerce: { label: string; value: number | null; year: string } | null
  denreesDeBase: { date: string; produit: string; prix: number | null; unite: string; prev: number | null; variationPct: number | null }[]
  denreesDeBaseSeries: { date: string; values: Record<string, number | null> }[]
  pricesData: PriceData[]
  regionsData: RegionData[]
  sectorsData: SectorData[]
}

export interface IndicatorData {
  name: string
  value: number | null
  reference: string
  note: string
  source: string
  formatted?: string
}

export interface PriceData {
  product: string
  value: number | null
  unit: string
  change: number | null
}

export interface RegionData {
  region: string
  value: number
  share: number
}

export interface SectorData {
  sector: string
  value: number
  share: number
  growth: number
}

// ─── Google Visualization API Parser ─────────────────────

interface GvizColumn {
  id: string
  label: string
  type: string
}

interface GvizCell {
  v: any
  f?: string
}

interface GvizRow {
  c: (GvizCell | null)[]
}

interface GvizTable {
  cols: GvizColumn[]
  rows: GvizRow[]
}

interface GvizResponse {
  version: string
  reqId: string
  status: string
  table: GvizTable
}

function parseGvizResponse(jsonpText: string): GvizResponse | null {
  try {
    // Remove JSONP wrapper
    const jsonText = jsonpText
      .replace(/^\/\*O_o\*\/\s*/, '')
      .replace(/^google\.visualization\.Query\.setResponse\(/, '')
      .replace(/\);?\s*$/, '')
    
    const response: GvizResponse = JSON.parse(jsonText)
    
    if (response.status !== 'ok') {
      console.error('[Commerce] gviz response status:', response.status)
      return null
    }
    
    return response
  } catch (error) {
    console.error('[Commerce] Failed to parse gviz response:', error)
    return null
  }
}

function extractTableData(response: GvizResponse): string[][] {
  const rows: string[][] = []
  
  for (const row of response.table.rows) {
    const rowData: string[] = []
    for (const cell of row.c) {
      if (cell === null) {
        rowData.push('')
      } else {
        // Use formatted value if available, otherwise raw value
        const value = cell.f !== undefined ? cell.f : (cell.v !== null ? String(cell.v) : '')
        rowData.push(value)
      }
    }
    rows.push(rowData)
  }
  
  return rows
}

// ─── Data Parsing ────────────────────────────────────────

function parseIndicators(rows: string[][]): IndicatorData[] {
  const indicators: IndicatorData[] = []
  
  for (const row of rows) {
    if (row.length < 5) continue
    
    const [name, valueStr, reference, note, source] = row
    
    if (!name || name.trim() === '') continue
    
    // Parse numeric value
    let value: number | null = null
    if (valueStr && valueStr.trim() !== '' && !valueStr.includes('ERROR')) {
      // Handle percentage format
      const numStr = valueStr.replace('%', '').replace(',', '.').trim()
      const parsed = parseFloat(numStr)
      if (!isNaN(parsed)) {
        value = parsed
      }
    }
    
    indicators.push({
      name: name.trim(),
      value,
      reference: reference?.trim() || '',
      note: note?.trim() || '',
      source: source?.trim() || 'ANSD',
      formatted: valueStr?.trim() || 'n/a'
    })
  }
  
  console.log(`[Commerce] Parsed ${indicators.length} indicators`)
  return indicators
}

function extractIHPCData(indicators: IndicatorData[]): { period: string; value: number; change: number }[] {
  const ihpcData: { period: string; value: number; change: number }[] = []
  
  for (const ind of indicators) {
    if (ind.name.includes('IHPC Global')) {
      const period = ind.name.includes('Fév') ? 'Fév. 2026' : 
                     ind.name.includes('Déc') ? 'Déc. 2025' : 'Récent'
      
      const changeMatch = ind.note.match(/([+-]?\d+\.?\d*)%/)
      const change = changeMatch ? parseFloat(changeMatch[1]) : 0
      
      if (ind.value !== null) {
        ihpcData.push({
          period,
          value: ind.value,
          change
        })
      }
    }
  }
  
  return ihpcData
}

function extractInflationData(indicators: IndicatorData[]): { year: string; rate: number }[] {
  const inflationData: { year: string; rate: number }[] = []
  
  for (const ind of indicators) {
    if (ind.name.includes('Inflation annuelle')) {
      const yearMatch = ind.name.match(/(\d{4})/)
      const year = yearMatch ? yearMatch[1] : ''
      
      if (year && ind.value !== null) {
        inflationData.push({
          year,
          rate: ind.value // Value is already a percentage (1.4 = 1.4%)
        })
      }
    }
  }
  
  return inflationData.sort((a, b) => a.year.localeCompare(b.year))
}

// ─── Fetch Denrées de base series (last N periods) ───────────────────────

async function fetchDenreesDeBaseSeries(periods = 12): Promise<{ date: string; values: Record<string, number | null> }[]> {
  try {
    const url = `https://docs.google.com/spreadsheets/d/${DENREES_SPREADSHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(DENREES_SHEET_NAME)}`
    const response = await fetch(url)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)

    const text = await response.text()
    const gviz = parseGvizResponse(text)
    if (!gviz) return []

    const header = gviz.table.cols.map(c => String(c?.label || '').trim())
    const rows = extractTableData(gviz)

    const normalizeNumber = (v: any): number | null => {
      if (v === null || v === undefined) return null
      const s = String(v).replace(/\s+/g, '').replace(',', '.')
      if (!s) return null
      const n = parseFloat(s)
      return Number.isFinite(n) ? n : null
    }

    const parsed = rows
      .filter(r => r && r[0])
      .map(r => {
        const dateStr = String(r[0] || '').trim()
        const date = new Date(dateStr)
        if (Number.isNaN(date.getTime())) return null
        return { date, row: r }
      })
      .filter(Boolean)
      .sort((a: any, b: any) => a.date.getTime() - b.date.getTime()) as { date: Date; row: string[] }[]

    if (parsed.length === 0) return []

    const take = Math.max(1, Math.min(periods, parsed.length))
    const slice = parsed.slice(-take)

    return slice.map(item => {
      const date = item.date.toISOString().slice(0, 10)
      const values: Record<string, number | null> = {}

      for (let i = 3; i < header.length; i++) {
        const produit = header[i]
        if (!produit) continue
        values[produit] = normalizeNumber(item.row[i])
      }

      return { date, values }
    })
  } catch (error) {
    console.error('[Commerce] Error fetching denrées de base series:', error)
    return []
  }
}

// ─── Fetch Denrées de base (latest + variation vs previous month) ─────────

async function fetchDenreesDeBase(): Promise<{ date: string; produit: string; prix: number | null; unite: string; prev: number | null; variationPct: number | null }[]> {
  try {
    const url = `https://docs.google.com/spreadsheets/d/${DENREES_SPREADSHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(DENREES_SHEET_NAME)}`
    const response = await fetch(url)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)

    const text = await response.text()
    const gviz = parseGvizResponse(text)
    if (!gviz) return []

    // The sheet is delivered by gviz with proper column labels already.
    // The first column contains the date (e.g. "2009-01"); subsequent columns are Année, Mois, then products.
    const rows = extractTableData(gviz)
    const header = gviz.table.cols.map(c => String(c?.label || '').trim())
    const dataRows = rows

    const parsed = dataRows
      .filter(r => r && r[0])
      .map(r => {
        const dateStr = String(r[0] || '').trim()
        const date = new Date(dateStr)
        if (Number.isNaN(date.getTime())) return null
        return { date, row: r }
      })
      .filter(Boolean)
      .sort((a: any, b: any) => a.date.getTime() - b.date.getTime()) as { date: Date; row: string[] }[]

    if (parsed.length < 2) return []

    const latest = parsed[parsed.length - 1]
    const prev = parsed[parsed.length - 2]

    const results: { date: string; produit: string; prix: number | null; unite: string; prev: number | null; variationPct: number | null }[] = []

    const normalizeNumber = (v: any): number | null => {
      if (v === null || v === undefined) return null
      const s = String(v).replace(/\s+/g, '').replace(',', '.')
      if (!s) return null
      const n = parseFloat(s)
      return Number.isFinite(n) ? n : null
    }

    const latestIso = latest.date.toISOString().slice(0, 10)

    // product columns start after Date/Année/Mois
    for (let i = 3; i < header.length; i++) {
      const produit = header[i]
      if (!produit) continue
      const prix = normalizeNumber(latest.row[i])
      const prevVal = normalizeNumber(prev.row[i])
      let variationPct: number | null = null
      if (prix !== null && prevVal !== null && prevVal !== 0) {
        variationPct = ((prix / prevVal) - 1) * 100
      }

      // Unit is embedded in the column label like "(FCFA/kg)"; fallback to FCFA/kg
      const unitMatch = produit.match(/\(([^)]+)\)/)
      const unite = unitMatch ? unitMatch[1] : 'FCFA/kg'

      results.push({
        date: latestIso,
        produit,
        prix,
        unite,
        prev: prevVal,
        variationPct,
      })
    }

    return results
  } catch (error) {
    console.error('[Commerce] Error fetching denrées de base:', error)
    return []
  }
}

// ─── Fetch Emploi Commerce KPI ────────────────────────────────────────────

async function fetchEmploiCommerce(): Promise<{ label: string; value: number | null; year: string } | null> {
  try {
    const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(EMPLOI_COMMERCE_SHEET_NAME)}`
    const response = await fetch(url)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)

    const text = await response.text()
    const gviz = parseGvizResponse(text)
    if (!gviz) return null

    const rows = extractTableData(gviz)

    // Pick the row by label (robust against row shifts)
    const target = rows.find(r => String(r?.[0] || '').trim().toUpperCase().includes('COMMERCE DE GROS') && String(r?.[0] || '').toUpperCase().includes('REPAR'))
    if (!target) return null
    if (!target || target.length < 2) return null

    const label = (target[0] || '').trim()
    if (!label) return null

    // User requested: column G (7th column) for the KPI value.
    // Column G (0-based index 6) contains the latest value (2024) in the current sheet
    const colGIndex = 6
    const raw = target[colGIndex]
    const n = raw ? parseFloat(String(raw).replace(/\s+/g, '').replace(',', '.')) : NaN
    const value = !isNaN(n) ? n : null

    // Use the header label (e.g., "2024") as the period
    const period = String(gviz.table.cols[colGIndex]?.label || '').trim()

    return { label, value, year: period }
  } catch (error) {
    console.error('[Commerce] Error fetching emploi commerce:', error)
    return null
  }
}

// ─── Fetch IHPC Désagrégé (last sheet, GID 351552979) ────────────────────

async function fetchIhpcDesagrege(): Promise<IhpcDesagregeRow[]> {
  try {
    const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&gid=${IHPC_DESAGREGE_GID}`
    const response = await fetch(url)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)

    const text = await response.text()
    const gviz = parseGvizResponse(text)
    if (!gviz) return []

    const rows = gviz.table.rows
    const result: IhpcDesagregeRow[] = []

    for (const row of rows) {
      const cells = row.c
      const date = cells[0]?.v as string | null
      if (!date || typeof date !== 'string') continue

      const num = (idx: number): number => {
        const v = cells[idx]?.v
        if (v === null || v === undefined) return 0
        const n = typeof v === 'number' ? v : parseFloat(String(v))
        return isNaN(n) ? 0 : n
      }

      result.push({
        date,
        global:                    num(1),
        alimentaire:               num(2),
        boissonsTabac:             num(3),
        vetementsChaussures:       num(4),
        logementEau:               num(5),
        soinsPersonnels:           num(6),
        assurancesFinances:        num(7),
        restaurantsHebergement:    num(8),
        enseignement:              num(9),
        loisirsCulture:            num(10),
        informationCommunication:  num(11),
        transport:                 num(12),
        ameublementMenager:        num(13),
        sante:                     num(14),
      })
    }

    console.log(`[Commerce] Fetched ${result.length} rows of IHPC désagrégé`)
    return result
  } catch (error) {
    console.error('[Commerce] Error fetching IHPC désagrégé:', error)
    return []
  }
}

// Fetch annual IHPC data from 1_IHPC_Global sheet and calculate inflation
async function fetchIHPCHistoricalData(): Promise<{ year: string; rate: number }[]> {
  try {
    const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&sheet=${IHPC_SHEET_NAME}`
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    const text = await response.text()
    const gvizResponse = parseGvizResponse(text)
    if (!gvizResponse) {
      return []
    }
    
    const rows = extractTableData(gvizResponse)
    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth() + 1 // 1-12
    
    // Extract annual IHPC values (ONLY complete years)
    const annualIHPC: { year: number; ihpc: number }[] = []
    for (const row of rows) {
      const dateStr = row[0]?.toLowerCase() || ''
      const value = parseFloat(row[1])
      
      if (dateStr.includes('annuel') && !isNaN(value)) {
        const yearMatch = dateStr.match(/(\d{4})/)
        if (yearMatch) {
          const year = parseInt(yearMatch[1])
          
          // CRITICAL: Only include complete years
          // If current year, only include if we have 12 months of data (December reached)
          if (year < currentYear || (year === currentYear && currentMonth === 12)) {
            annualIHPC.push({ year, ihpc: value })
          } else {
            console.log(`[Commerce] Excluding ${year} - incomplete year (current: ${currentMonth}/12 months)`)
          }
        }
      }
    }
    
    // Sort by year
    annualIHPC.sort((a, b) => a.year - b.year)
    
    // Calculate year-over-year inflation from IHPC (skip 2023 if rebasement year)
    const inflationData: { year: string; rate: number }[] = []
    for (let i = 1; i < annualIHPC.length; i++) {
      const currentYear = annualIHPC[i]
      const previousYear = annualIHPC[i - 1]
      
      // Check for rebasement (large drop indicates base year change)
      const rawChange = ((currentYear.ihpc / previousYear.ihpc) - 1) * 100
      
      // Skip if this looks like a rebasement (drop > 10% or IHPC becomes exactly 100)
      if (currentYear.ihpc === 100.0 && Math.abs(rawChange) > 10) {
        console.log(`[Commerce] Skipping ${currentYear.year} - detected rebasement (IHPC: ${previousYear.ihpc} → ${currentYear.ihpc})`)
        continue
      }
      
      // Normal inflation calculation
      const inflationRate = rawChange
      
      inflationData.push({
        year: currentYear.year.toString(),
        rate: Math.round(inflationRate * 10) / 10 // Round to 1 decimal
      })
    }
    
    console.log(`[Commerce] Calculated ${inflationData.length} years of valid inflation from IHPC data`)
    return inflationData
    
  } catch (error) {
    console.error('[Commerce] Error fetching IHPC historical data:', error)
    return []
  }
}

// ─── Default Data ─────────────────────────────────────────

function getDefaultIhpcDesagrege(): IhpcDesagregeRow[] {
  // Minimal fallback — last 6 months of realistic values
  return [
    { date: 'Aug 2025', global: 103.4, alimentaire: 104.8, boissonsTabac: 111.5, vetementsChaussures: 101.1, logementEau: 100.5, soinsPersonnels: 103.1, assurancesFinances: 99.3, restaurantsHebergement: 105.2, enseignement: 102.3, loisirsCulture: 102.0, informationCommunication: 96.2, transport: 103.4, ameublementMenager: 104.7, sante: 103.2 },
    { date: 'Sep 2025', global: 104.7, alimentaire: 107.7, boissonsTabac: 110.6, vetementsChaussures: 101.2, logementEau: 100.3, soinsPersonnels: 103.3, assurancesFinances: 99.3, restaurantsHebergement: 105.4, enseignement: 102.3, loisirsCulture: 102.2, informationCommunication: 96.1, transport: 103.5, ameublementMenager: 104.9, sante: 103.4 },
    { date: 'Oct 2025', global: 104.4, alimentaire: 106.8, boissonsTabac: 113.8, vetementsChaussures: 101.2, logementEau: 100.7, soinsPersonnels: 103.6, assurancesFinances: 99.9, restaurantsHebergement: 105.7, enseignement: 103.3, loisirsCulture: 102.5, informationCommunication: 96.1, transport: 103.6, ameublementMenager: 105.6, sante: 103.5 },
    { date: 'Nov 2025', global: 104.3, alimentaire: 106.4, boissonsTabac: 118.3, vetementsChaussures: 101.2, logementEau: 100.6, soinsPersonnels: 103.8, assurancesFinances: 99.9, restaurantsHebergement: 106.0, enseignement: 103.3, loisirsCulture: 102.6, informationCommunication: 96.0, transport: 103.6, ameublementMenager: 105.7, sante: 103.7 },
    { date: 'Dec 2025', global: 103.3, alimentaire: 104.4, boissonsTabac: 119.8, vetementsChaussures: 101.3, logementEau: 100.8, soinsPersonnels: 104.0, assurancesFinances: 99.9, restaurantsHebergement: 106.1, enseignement: 103.3, loisirsCulture: 102.7, informationCommunication: 95.8, transport: 102.2, ameublementMenager: 105.3, sante: 104.2 },
    { date: 'Jan 2026', global: 102.0, alimentaire: 101.4, boissonsTabac: 120.7, vetementsChaussures: 101.3, logementEau: 101.2, soinsPersonnels: 104.1, assurancesFinances: 99.9, restaurantsHebergement: 106.2, enseignement: 103.3, loisirsCreate: 102.7, informationCommunication: 95.8, transport: 101.9, ameublementMenager: 105.4, sante: 103.9 },
  ] as IhpcDesagregeRow[]
}

function getDefaultData(): CommerceInterieurData {
  return {
    year: '2026',
    indicators: [],
    ihpcData: [],
    ihpcDesagrege: getDefaultIhpcDesagrege(),
    ihpcSeries: [
      { date: 'Jan 2024', value: 100.5 },
      { date: 'Fév 2024', value: 100.7 },
      { date: 'Mar 2024', value: 100.9 },
      { date: 'Avr 2024', value: 101.1 },
      { date: 'Mai 2024', value: 101.3 },
      { date: 'Jun 2024', value: 101.5 },
      { date: 'Jul 2024', value: 101.6 },
      { date: 'Aoû 2024', value: 101.7 },
      { date: 'Sep 2024', value: 101.8 },
      { date: 'Oct 2024', value: 101.9 },
      { date: 'Nov 2024', value: 102.0 },
      { date: 'Déc 2024', value: 102.0 },
      { date: 'Jan 2025', value: 102.0 },
      { date: 'Fév 2025', value: 101.8 }
    ],
    icaiSeries: [
      { date: '2023 T3', gros: 104.9, detail: 116.7, autoMoto: 119.3 },
      { date: '2023 T4', gros: 108.2, detail: 120.4, autoMoto: 123.1 },
      { date: '2024 T1', gros: 106.5, detail: 118.3, autoMoto: 121.0 },
      { date: '2024 T2', gros: 109.6, detail: 122.0, autoMoto: 124.6 },
      { date: '2024 T3', gros: 112.0, detail: 124.4, autoMoto: 127.1 },
      { date: '2024 T4', gros: 114.8, detail: 127.5, autoMoto: 130.3 },
      { date: '2025 T1', gros: 117.9, detail: 131.0, autoMoto: 133.8 },
      { date: '2025 T2', gros: 121.0, detail: 134.5, autoMoto: 137.3 },
      { date: '2025 T3', gros: 124.2, detail: 138.1, autoMoto: 140.9 },
      { date: '2025 T4', gros: 127.5, detail: 141.7, autoMoto: 144.6 }
    ],
    icaiBreakdown: [
      { category: 'Commerce de gros', value: 2500, share: 35.0 },
      { category: 'Commerce de détail', value: 1800, share: 25.2 },
      { category: 'Distribution alimentaire', value: 1200, share: 16.8 },
      { category: 'Transport et logistique', value: 900, share: 12.6 },
      { category: 'Services associés', value: 750, share: 10.4 }
    ],
    inflationData: [
      { year: '2023', rate: 5.9 },
      { year: '2024', rate: 0.8 },
      { year: '2025', rate: 1.4 }
    ],
    emploiCommerce: null,
    denreesDeBase: [],
    denreesDeBaseSeries: [],
    pricesData: [],
    regionsData: [],
    sectorsData: []
  }
}

// ─── Main Fetch Function ─────────────────────────────────

export async function fetchCommerceInterieurData(): Promise<CommerceInterieurData> {
  // Check cache
  if (cache && cache.expires > Date.now()) {
    console.log('[Commerce] Returning cached data')
    return cache.data
  }
  
  try {
    console.log('[Commerce] Fetching from Google Sheets...')
    const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json`
    
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    const text = await response.text()
    const gvizResponse = parseGvizResponse(text)
    
    if (!gvizResponse) {
      console.log('[Commerce] Failed to parse gviz response, using default data')
      return getDefaultData()
    }
    
    const rows = extractTableData(gvizResponse)
    console.log(`[Commerce] Extracted ${rows.length} rows from sheet`)
    
    // Parse all indicators from main tab
    const indicators = parseIndicators(rows)
    const ihpcData = extractIHPCData(indicators)
    
    // Fetch historical IHPC data and calculate inflation (8 years)
    const [historicalInflation, ihpcDesagrege, emploiCommerce, denreesDeBase, denreesDeBaseSeries] = await Promise.all([
      fetchIHPCHistoricalData(),
      fetchIhpcDesagrege(),
      fetchEmploiCommerce(),
      fetchDenreesDeBase(),
      fetchDenreesDeBaseSeries(12),
    ])
    const inflationData = historicalInflation.length > 0 ? historicalInflation : extractInflationData(indicators)
    
    // Use default data for regions and sectors (not in sheet)
    const defaultData = getDefaultData()
    
    const data: CommerceInterieurData = {
      year: '2026',
      indicators,
      ihpcData: ihpcData.length > 0 ? ihpcData : defaultData.ihpcData,
      ihpcDesagrege: ihpcDesagrege.length > 0 ? ihpcDesagrege : defaultData.ihpcDesagrege,
      ihpcSeries: defaultData.ihpcSeries, // Use default until added to sheet
      icaiSeries: defaultData.icaiSeries, // Use default until added to sheet
      icaiBreakdown: defaultData.icaiBreakdown, // Use default until added to sheet
      inflationData: inflationData.length > 0 ? inflationData : defaultData.inflationData,
      emploiCommerce,
      denreesDeBase: denreesDeBase.length > 0 ? denreesDeBase : defaultData.denreesDeBase,
      denreesDeBaseSeries: denreesDeBaseSeries.length > 0 ? denreesDeBaseSeries : defaultData.denreesDeBaseSeries,
      pricesData: defaultData.pricesData,
      regionsData: defaultData.regionsData,
      sectorsData: defaultData.sectorsData
    }
    
    // Cache the result
    cache = {
      data,
      expires: Date.now() + CACHE_TTL
    }
    
    console.log('[Commerce] Data fetched and cached successfully')
    return data
    
  } catch (error) {
    console.error('[Commerce] Error fetching data:', error)
    console.log('[Commerce] Returning default data')
    return getDefaultData()
  }
}
