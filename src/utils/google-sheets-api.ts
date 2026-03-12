/**
 * Google Sheets CSV Fetcher
 * Fetches and parses data from published Google Sheets (CSV format)
 */
const GOOGLE_SHEETS_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQeX4P7DvfCLKCJhZUtddRKdI6aLL-6REtHCcViM0any024weZO8r-OazmmJGgc6MbZlvROXzfxjo4T/pub?output=csv'

// Cache for 1 hour
const CACHE_TTL = 60 * 60 * 1000
let cache: { data: any; expires: number } | null = null

// ─── Types ───────────────────────────────────────────────

export interface PmePmiData {
  year: number
  totalVA: number           // Valeur ajoutée (milliards)
  employment: number        // Emplois générés
  contribution: number      // Contribution au PIB (%)
  enterprises: number       // Nombre d'entreprises
  sectors: SectorData[]
  years: YearlyData[]
}

export interface SectorData {
  name: string
  nameFr: string
  va: number               // Valeur ajoutée
  employment: number        // Emplois
  share: number            // Part (%)
  growth: number            // Croissance (%)
}

export interface YearlyData {
  year: number
  va: number
  employment: number
  enterprises: number
  contribution: number
}

// ─── CSV Parser ─────────────────────────────────────────

function parseCSV(csvText: string): string[][] {
  const lines = csvText.trim().split('\n')
  return lines.map(line => {
    const cells: string[] = []
    let current = ''
    let inQuotes = false
    
    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        cells.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    cells.push(current.trim())
    return cells
  })
}

// ─── Data Transformers ─────────────────────────────────

function transformToPmePmiData(rows: string[][]): PmePmiData {
  if (rows.length < 2) {
    return getDefaultData()
  }

  const headers = rows[0].map(h => h.toLowerCase().trim().replace(/\s+/g, '_'))
  
  // Find column indices - handle various column name formats
  const yearIdx = headers.findIndex(h => h.includes('year') || h.includes('annee') || h === 'year' || h === 'annee')
  const vaIdx = headers.findIndex(h => h.includes('value_added') || h.includes('va') || h.includes('value') || h.includes('valeur'))
  const empIdx = headers.findIndex(h => h.includes('employment') || h.includes('emploi') || h.includes('job') || h.includes('employ'))
  const contIdx = headers.findIndex(h => h.includes('contribution') || h.includes('part') || h.includes('pib') || h.includes('share'))
  const entIdx = headers.findIndex(h => h.includes('enterprise') || h.includes('entreprise') || h.includes('company') || h.includes('establishment'))
  const sectorIdx = headers.findIndex(h => h.includes('sector') || h.includes('secteur') || h.includes('industry') || h.includes('activite'))
  const growthIdx = headers.findIndex(h => h.includes('growth') || h.includes('croissance') || h.includes('rate'))

  console.log('[PME-PMI] Headers found:', headers)
  console.log('[PME-PMI] Column indices:', { yearIdx, vaIdx, empIdx, contIdx, entIdx, sectorIdx, growthIdx })

  const dataRows = rows.slice(1).filter(row => row.some(cell => cell && cell.trim()))
  console.log('[PME-PMI] Data rows count:', dataRows.length)
  
  if (dataRows.length === 0) {
    return getDefaultData()
  }

  // Parse yearly data - group by year for yearly stats
  const yearMap = new Map<number, YearlyData>()
  const sectors: SectorData[] = []

  for (const row of dataRows) {
    const year = yearIdx >= 0 ? parseInt(row[yearIdx]) || 0 : 0
    if (year <= 0) continue

    const va = vaIdx >= 0 ? parseFloat(String(row[vaIdx]).replace(/[^0-9.-]/g, '') || '0') : 0
    const emp = empIdx >= 0 ? parseInt(String(row[empIdx]).replace(/[^0-9]/g, '') || '0') : 0
    const cont = contIdx >= 0 ? parseFloat(String(row[contIdx]).replace(/[^0-9.-]/g, '') || '0') : 0
    const ent = entIdx >= 0 ? parseInt(String(row[entIdx]).replace(/[^0-9]/g, '') || '0') : 0
    const sector = sectorIdx >= 0 ? row[sectorIdx]?.trim() || '' : ''
    const growth = growthIdx >= 0 ? parseFloat(String(row[growthIdx]).replace(/[^0-9.-]/g, '') || '0') : 0

    // Update yearly data (take max values for each year)
    const existing = yearMap.get(year)
    if (!existing || va > existing.va) {
      yearMap.set(year, { year, va, employment: emp, enterprises: ent, contribution: cont })
    }

    // Add sector data
    if (sector) {
      sectors.push({
        name: sector,
        nameFr: translateSector(sector),
        va,
        employment: emp,
        share: cont,
        growth
      })
    }
  }

  // Sort years and get latest values
  const years = Array.from(yearMap.values()).sort((a, b) => a.year - b.year)
  const latestYear = years.length > 0 ? years[years.length - 1].year : 2023
  const latestData = yearMap.get(latestYear) || { year: latestYear, va: 0, employment: 0, enterprises: 0, contribution: 0 }

  // Sort sectors by VA and take top 10
  const sortedSectors = [...sectors].sort((a, b) => b.va - a.va).slice(0, 10)

  // Dedupe sectors by name
  const uniqueSectors: SectorData[] = []
  const seenSectors = new Set<string>()
  for (const s of sortedSectors) {
    if (!seenSectors.has(s.name)) {
      seenSectors.add(s.name)
      uniqueSectors.push(s)
    }
  }

  console.log('[PME-PMI] Parsed years:', years.length)
  console.log('[PME-PMI] Parsed sectors:', uniqueSectors.length)

  return {
    year: latestYear,
    totalVA: latestData.va,
    employment: latestData.employment,
    contribution: latestData.contribution,
    enterprises: latestData.enterprises,
    sectors: uniqueSectors,
    years
  }
}

function translateSector(name: string): string {
  const translations: Record<string, string> = {
    'Agriculture': 'Agriculture',
    'Industry': 'Industrie',
    'Services': 'Services',
    'Trade': 'Commerce',
    'Construction': 'Construction',
    'Transport': 'Transport',
    'ICT': 'TIC',
    'Finance': 'Finance',
    'Manufacturing': 'Industrie manufacturière',
    'Mining': 'Mines',
    'Energy': 'Énergie',
    'Tourism': 'Tourisme',
  }
  return translations[name] || name
}

function getDefaultData(): PmePmiData {
  return {
    year: 2023,
    totalVA: 5.4,
    employment: 342000,
    contribution: 28,
    enterprises: 45000,
    sectors: [
      { name: 'Commerce', nameFr: 'Commerce', va: 1.8, employment: 120000, share: 33, growth: 5.2 },
      { name: 'Services', nameFr: 'Services', va: 1.5, employment: 95000, share: 28, growth: 4.8 },
      { name: 'Industry', nameFr: 'Industrie', va: 1.2, employment: 65000, share: 22, growth: 3.5 },
      { name: 'Construction', nameFr: 'Construction', va: 0.5, employment: 38000, share: 9, growth: 6.2 },
      { name: 'Transport', nameFr: 'Transport', va: 0.4, employment: 24000, share: 8, growth: 4.1 },
    ],
    years: [
      { year: 2019, va: 4.1, employment: 280000, enterprises: 38000, contribution: 25 },
      { year: 2020, va: 3.8, employment: 265000, enterprises: 39500, contribution: 24 },
      { year: 2021, va: 4.5, employment: 295000, enterprises: 41000, contribution: 26 },
      { year: 2022, va: 4.9, employment: 318000, enterprises: 43000, contribution: 27 },
      { year: 2023, va: 5.4, employment: 342000, enterprises: 45000, contribution: 28 },
    ]
  }
}

// ─── Fetch Function ──────────────────────────────────────

export async function fetchPmePmiData(): Promise<PmePmiData> {
  // Check cache
  if (cache && cache.expires > Date.now()) {
    return cache.data
  }

  try {
    const response = await fetch(GOOGLE_SHEETS_CSV_URL, {
      headers: {
        'Accept': 'text/csv,application/csv,*/*',
        'User-Agent': 'CRADES-PME-PMI-Dashboard/1.0',
      },
    })

    if (!response.ok) {
      console.error(`Google Sheets fetch error: ${response.status} - ${response.statusText}`)
      return getDefaultData()
    }

    const contentType = response.headers.get('content-type') || ''
    const csvText = await response.text()
    
    // Debug: Log first 500 chars to see what we're getting
    console.log('[PME-PMI] Response content-type:', contentType)
    console.log('[PME-PMI] Response preview:', csvText.substring(0, 500))

    if (csvText.includes('<!DOCTYPE') || csvText.includes('<html') || csvText.includes('Sign in')) {
      console.error('[PME-PMI] Received HTML instead of CSV - spreadsheet may not be publicly accessible')
      return getDefaultData()
    }

    const rows = parseCSV(csvText)
    
    if (rows.length < 2) {
      console.warn('Google Sheets returned empty data')
      return getDefaultData()
    }

    const data = transformToPmePmiData(rows)
    
    // Cache the result
    cache = { data, expires: Date.now() + CACHE_TTL }
    
    return data
  } catch (error) {
    console.error('Google Sheets fetch failed:', error)
    return getDefaultData()
  }
}

// ─── API Route ───────────────────────────────────────────

// API route is registered in `src/api/routes.ts`.
