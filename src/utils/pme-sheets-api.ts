/**
 * Google Sheets Integration for PME/PMI Dashboard
 * Spreadsheet: https://docs.google.com/spreadsheets/d/1QmxcEYEwlmuFo22ukoYI3s9hbwA9cFbHw2cqWjJmBtk
 * Sources: ANSD/BDEF, ANSD/NINEA, Banque Mondiale Enterprise Surveys
 */

const SPREADSHEET_ID = '1QmxcEYEwlmuFo22ukoYI3s9hbwA9cFbHw2cqWjJmBtk'
const CACHE_TTL = 5 * 60 * 1000
let cache: { data: PmeData; expires: number } | null = null

// ─── Types ───────────────────────────────────────────────

export interface PmeData {
  // KPIs
  immatriculations: number
  immatricVariation: string
  exportatrices: string    // ~16%
  creditAccess: string     // % with credit line (WB)
  femmesDirigeantes: string // % women owners/managers (WB)
  croissanceEmploi: string  // employment growth (WB)

  // NINEA time series (annual totals 2019–2024)
  immatricSeries: { year: number; total: number }[]

  // Répartition par type (absolute numbers 2019–2024)
  typeBreakdown: { type: string; values: Record<number, number> }[]

  // Répartition par taille (WB Survey)
  tailleBreakdown: { label: string; pct: number }[]

  // Régime juridique (2024 %)
  regimeBreakdown: { label: string; pct: number }[]

  // Secteur d'activité (2024 %)
  secteurBreakdown: { label: string; pct: number }[]

  // Secteur d'activité par année (2019-2024) for stacked bar
  secteurByYear: { label: string; values: Record<number, number> }[]

  // Géographique (14 régions, 2024 %)
  regionBreakdown: { region: string; pct: number }[]

  // Âge (2024 %)
  ageBreakdown: { label: string; pct: number }[]

  // Genre (2024 %)
  genreBreakdown: { label: string; pct: number }[]

  // Obstacles à l'activité (WB Survey)
  obstacles: { label: string; pct: number; note: string }[]
}

// ─── Gviz Fetcher ────────────────────────────────────────

async function fetchSheet(sheetName: string): Promise<any[][] | null> {
  try {
    const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`
    const response = await fetch(url, { headers: { 'User-Agent': 'CRADES-PME-Dashboard/2.0' } })
    if (!response.ok) return null
    const text = await response.text()
    const match = text.match(/google\.visualization\.Query\.setResponse\((.*)\);?\s*$/)
    if (!match) return null
    const data = JSON.parse(match[1])
    if (data.status !== 'ok') return null
    const table = data.table
    return table.rows.map((r: any) =>
      r.c.map((cell: any) => {
        if (!cell || cell.v === null || cell.v === undefined) return null
        return cell.v
      })
    )
  } catch (e) {
    console.error(`[PME] Error fetching "${sheetName}":`, e)
    return null
  }
}

// ─── Parsers ─────────────────────────────────────────────

function parseNum(v: any): number {
  if (v === null || v === undefined || v === '') return 0
  const s = String(v).replace(/[^0-9.\-]/g, '')
  return parseFloat(s) || 0
}

function parsePct(v: any): number {
  if (v === null || v === undefined || v === '') return 0
  const s = String(v).replace(/[~%]/g, '').trim()
  return parseFloat(s) || 0
}

function parseNINEA(rows: any[][]): Partial<PmeData> {
  const years = [2019, 2020, 2021, 2022, 2023, 2024]

  // Row 0: Total immatriculations
  const totals = years.map((y, i) => ({ year: y, total: parseNum(rows[0]?.[i + 1]) }))
  const latestTotal = totals[totals.length - 1]?.total || 0
  const variation = rows[0]?.[7] ? String(rows[0][7]) : ''

  // Rows 5-9: Type breakdown (absolute numbers)
  const typeLabels = ['Entreprise Personne Physique', 'Entreprise Personne Morale', 'Propriétaires Fonciers', 'Opérateurs Occasionnels', 'Associés']
  const typeBreakdown = typeLabels.map((label, idx) => {
    const row = rows[5 + idx]
    const values: Record<number, number> = {}
    years.forEach((y, i) => { values[y] = parseNum(row?.[i + 1]) })
    return { type: label, values }
  })

  // Rows 20-26: Secteur (% 2024 = col index 6)
  const secteurRows = [
    { row: 20, label: 'Commerce' },
    { row: 21, label: 'Services personnels' },
    { row: 22, label: 'Services aux entreprises' },
    { row: 23, label: 'Agriculture & Pêche' },
    { row: 24, label: 'BTP' },
    { row: 25, label: 'Hôtels & Restaurants' },
    { row: 26, label: 'Autres industries' },
  ]
  const secteurBreakdown = secteurRows
    .map(s => ({ label: s.label, pct: parsePct(rows[s.row]?.[6]) || parsePct(rows[s.row]?.[5]) }))
    .filter(s => s.pct > 0)
    .sort((a, b) => b.pct - a.pct)

  // Sector data by year for stacked bar chart
  // Compute "Autres industries" as remainder when missing
  const secteurByYearRaw = secteurRows.map(s => {
    const values: Record<number, number> = {}
    years.forEach((y, i) => { values[y] = parsePct(rows[s.row]?.[i + 1]) })
    return { label: s.label, values }
  })
  // Fill in "Autres industries" as 100 - sum(others) when 0
  const autresIdx = secteurByYearRaw.findIndex(s => s.label === 'Autres industries')
  if (autresIdx >= 0) {
    years.forEach(y => {
      if (secteurByYearRaw[autresIdx].values[y] === 0) {
        const sumOthers = secteurByYearRaw.reduce((acc, s, i) => i === autresIdx ? acc : acc + s.values[y], 0)
        secteurByYearRaw[autresIdx].values[y] = Math.max(0, parseFloat((100 - sumOthers).toFixed(1)))
      }
    })
  }
  const secteurByYear = secteurByYearRaw.filter(s => Object.values(s.values).some(v => v > 0))

  // Rows 37-50: Régions (% 2024 = col index 6)
  const regionRows = [
    { row: 37, region: 'Dakar' }, { row: 38, region: 'Thiès' }, { row: 39, region: 'Diourbel' },
    { row: 40, region: 'Kaolack' }, { row: 41, region: 'Ziguinchor' }, { row: 42, region: 'Saint-Louis' },
    { row: 43, region: 'Louga' }, { row: 44, region: 'Fatick' }, { row: 45, region: 'Tambacounda' },
    { row: 46, region: 'Kolda' }, { row: 47, region: 'Matam' }, { row: 48, region: 'Kaffrine' },
    { row: 49, region: 'Sédhiou' }, { row: 50, region: 'Kédougou' },
  ]
  const regionBreakdown = regionRows.map(r => ({
    region: r.region,
    pct: parsePct(rows[r.row]?.[6]) || parsePct(rows[r.row]?.[5]),
  }))

  // Rows 53-54: Genre (% 2024 = col index 6)
  const genreBreakdown = [
    { label: 'Hommes', pct: parsePct(rows[53]?.[6]) || parsePct(rows[53]?.[5]) },
    { label: 'Femmes', pct: parsePct(rows[54]?.[6]) || parsePct(rows[54]?.[5]) },
  ]

  // Rows 57-60: Âge (% 2024 = col index 6)
  const ageBreakdown = [
    { label: '< 25 ans', pct: parsePct(rows[57]?.[6]) || parsePct(rows[57]?.[5]) },
    { label: '25–34 ans', pct: parsePct(rows[58]?.[6]) || parsePct(rows[58]?.[5]) },
    { label: '35–54 ans', pct: parsePct(rows[59]?.[6]) || parsePct(rows[59]?.[5]) },
    { label: '55+ ans', pct: parsePct(rows[60]?.[6]) || parsePct(rows[60]?.[5]) },
  ]

  // Rows 63-69: Régime juridique (2023 col=1, 2024 col=2)
  const regimeBreakdown = [
    { label: 'Entreprises Individuelles', pct: parsePct(rows[63]?.[2]) || parsePct(rows[63]?.[1]) },
    { label: 'GIE', pct: parsePct(rows[65]?.[2]) || parsePct(rows[65]?.[1]) },
    { label: 'SARL', pct: parsePct(rows[66]?.[2]) || parsePct(rows[66]?.[1]) },
    { label: 'SUARL', pct: parsePct(rows[67]?.[2]) || parsePct(rows[67]?.[1]) },
    { label: 'Propriétaires Fonciers', pct: parsePct(rows[68]?.[2]) || parsePct(rows[68]?.[1]) },
    { label: 'Opérateurs Occasionnels', pct: parsePct(rows[69]?.[2]) || parsePct(rows[69]?.[1]) },
  ].filter(r => r.pct > 0)

  return {
    immatriculations: latestTotal,
    immatricVariation: variation,
    immatricSeries: totals,
    typeBreakdown,
    secteurBreakdown,
    secteurByYear,
    regionBreakdown,
    genreBreakdown,
    ageBreakdown,
    regimeBreakdown,
  }
}

function parseEnqueteWB(rows: any[][]): Partial<PmeData> {
  // Rows 5-7: Taille
  const tailleBreakdown = [
    { label: 'Petites (5-19 emp.)', pct: parsePct(rows[5]?.[1]) },
    { label: 'Moyennes (20-99 emp.)', pct: parsePct(rows[6]?.[1]) },
    { label: 'Grandes (100+ emp.)', pct: parsePct(rows[7]?.[1]) },
  ]

  // Row 8: Exportatrices
  const exportatrices = rows[8]?.[1] ? String(rows[8][1]).trim() : '~16%'

  // Row 10: % femmes propriétaires/dirigeantes
  const femmesDirigeantes = rows[10]?.[1] ? String(rows[10][1]).trim() : '~25%'

  // Row 20: % entreprises avec ligne de crédit/prêt bancaire
  const creditAccess = rows[20]?.[1] ? String(rows[20][1]).trim() : '~25%'

  // Row 47: Croissance emploi
  const croissanceEmploi = rows[47]?.[1] ? String(rows[47][1]).trim() : '~+5%'

  // Rows 12-18: Obstacles
  const obstacleRows = [
    { row: 12, label: 'Accès au financement' },
    { row: 13, label: 'Secteur informel' },
    { row: 14, label: 'Corruption' },
    { row: 15, label: 'Fiscalité' },
    { row: 16, label: 'Électricité' },
    { row: 17, label: 'Accès au foncier' },
    { row: 18, label: 'Réglementation douanière' },
  ]
  const obstacles = obstacleRows.map(o => ({
    label: o.label,
    pct: parsePct(rows[o.row]?.[1]),
    note: rows[o.row]?.[3] ? String(rows[o.row][3]).trim() : '',
  })).sort((a, b) => b.pct - a.pct)

  return { tailleBreakdown, exportatrices, femmesDirigeantes, creditAccess, croissanceEmploi, obstacles }
}

function parseMacroPIB(rows: any[][]): Partial<PmeData> {
  // Row 0: PIB (2023 = col 6)
  const pib = parseNum(rows[0]?.[6]) || parseNum(rows[0]?.[5])
  // Row 4: Croissance PIB (2024 = col 7, 2023 = col 6)
  const pibGrowthRaw = parseNum(rows[4]?.[7]) || parseNum(rows[4]?.[6])
  const pibGrowth = pibGrowthRaw < 1 ? pibGrowthRaw * 100 : pibGrowthRaw  // Handle 0.069 → 6.9%
  // Row 18: VA growth (2022 = col 5)
  const vaGrowthRaw = parseNum(rows[18]?.[5]) || parseNum(rows[18]?.[4])
  const vaGrowth = vaGrowthRaw < 1 ? vaGrowthRaw * 100 : vaGrowthRaw

  return { pib, pibGrowth, vaGrowth }
}

// ─── Default Data ────────────────────────────────────────

function getDefaultData(): PmeData {
  return {
    immatriculations: 91936,
    immatricVariation: '+72.1%',
    exportatrices: '~16%',
    creditAccess: '~25%',
    femmesDirigeantes: '~25%',
    croissanceEmploi: '~+5%',
    immatricSeries: [
      { year: 2019, total: 53406 }, { year: 2020, total: 57289 }, { year: 2021, total: 80104 },
      { year: 2022, total: 84870 }, { year: 2023, total: 95982 }, { year: 2024, total: 91936 },
    ],
    typeBreakdown: [
      { type: 'Entreprise Personne Physique', values: { 2019: 35125, 2020: 33090, 2021: 45580, 2022: 48928, 2023: 67940, 2024: 66683 } },
      { type: 'Entreprise Personne Morale', values: { 2019: 7863, 2020: 8405, 2021: 12160, 2022: 11834, 2023: 12476, 2024: 13267 } },
      { type: 'Propriétaires Fonciers', values: { 2019: 2778, 2020: 7500, 2021: 13523, 2022: 17056, 2023: 8337, 2024: 4623 } },
      { type: 'Opérateurs Occasionnels', values: { 2019: 7094, 2020: 6172, 2021: 6806, 2022: 5367, 2023: 5802, 2024: 7115 } },
      { type: 'Associés', values: { 2019: 486, 2020: 435, 2021: 502, 2022: 621, 2023: 510, 2024: 248 } },
    ],
    tailleBreakdown: [
      { label: 'Petites (5-19 emp.)', pct: 52 },
      { label: 'Moyennes (20-99 emp.)', pct: 31 },
      { label: 'Grandes (100+ emp.)', pct: 17 },
    ],
    regimeBreakdown: [
      { label: 'Entreprises Individuelles', pct: 72.5 },
      { label: 'GIE', pct: 4.8 },
      { label: 'SARL', pct: 2.2 },
      { label: 'SUARL', pct: 1.8 },
      { label: 'Propriétaires Fonciers', pct: 5.1 },
      { label: 'Opérateurs Occasionnels', pct: 7.7 },
    ],
    secteurBreakdown: [
      { label: 'Commerce', pct: 69.8 }, { label: 'Services personnels', pct: 7.8 },
      { label: 'Services aux entreprises', pct: 6.1 }, { label: 'BTP', pct: 2.8 },
      { label: 'Agriculture & Pêche', pct: 2.3 }, { label: 'Hôtels & Restaurants', pct: 1.0 },
    ],
    secteurByYear: [
      { label: 'Commerce', values: { 2019: 56.7, 2020: 52.6, 2021: 47.7, 2022: 43.3, 2023: 65.0, 2024: 69.8 } },
      { label: 'Services personnels', values: { 2019: 12.0, 2020: 18.9, 2021: 23.0, 2022: 24.0, 2023: 13.0, 2024: 7.8 } },
      { label: 'Services aux entreprises', values: { 2019: 6.0, 2020: 6.5, 2021: 5.8, 2022: 5.5, 2023: 6.3, 2024: 6.1 } },
      { label: 'Agriculture & Pêche', values: { 2019: 5.2, 2020: 5.1, 2021: 4.8, 2022: 4.9, 2023: 0, 2024: 2.3 } },
      { label: 'BTP', values: { 2019: 3.9, 2020: 4.1, 2021: 3.5, 2022: 3.0, 2023: 4.1, 2024: 2.8 } },
      { label: 'Hôtels & Restaurants', values: { 2019: 2.1, 2020: 1.8, 2021: 1.7, 2022: 1.5, 2023: 1.4, 2024: 1.0 } },
      { label: 'Autres industries', values: { 2019: 14.1, 2020: 11.0, 2021: 13.5, 2022: 17.8, 2023: 10.2, 2024: 10.2 } },
    ],
    regionBreakdown: [
      { region: 'Dakar', pct: 54.8 }, { region: 'Thiès', pct: 13.8 }, { region: 'Diourbel', pct: 5.5 },
      { region: 'Kaolack', pct: 5.6 }, { region: 'Ziguinchor', pct: 3.8 }, { region: 'Saint-Louis', pct: 2.9 },
      { region: 'Louga', pct: 2.1 }, { region: 'Fatick', pct: 1.8 }, { region: 'Tambacounda', pct: 1.7 },
      { region: 'Kolda', pct: 1.8 }, { region: 'Matam', pct: 1.2 }, { region: 'Kaffrine', pct: 1.3 },
      { region: 'Sédhiou', pct: 1.3 }, { region: 'Kédougou', pct: 0.8 },
    ],
    ageBreakdown: [
      { label: '< 25 ans', pct: 7.5 }, { label: '25–34 ans', pct: 37.8 },
      { label: '35–54 ans', pct: 43.0 }, { label: '55+ ans', pct: 11.7 },
    ],
    genreBreakdown: [
      { label: 'Hommes', pct: 68.3 }, { label: 'Femmes', pct: 31.7 },
    ],
    obstacles: [
      { label: 'Accès au financement', pct: 35, note: 'Principale contrainte PME' },
      { label: 'Secteur informel', pct: 30, note: 'Concurrence déloyale' },
      { label: 'Corruption', pct: 25, note: 'Justice, fiscalité' },
      { label: 'Fiscalité', pct: 22, note: '' },
      { label: 'Électricité', pct: 20, note: 'Délestages, coûts' },
      { label: 'Accès au foncier', pct: 18, note: '' },
      { label: 'Réglementation douanière', pct: 15, note: '' },
    ],
  }
}

// ─── Main Fetch ──────────────────────────────────────────

export async function fetchPmeData(): Promise<PmeData> {
  if (cache && cache.expires > Date.now()) {
    console.log('[PME] Returning cached data')
    return cache.data
  }

  console.log('[PME] Fetching fresh data from Google Sheets...')
  const defaults = getDefaultData()

  try {
    const [nineaRows, wbRows, macroRows] = await Promise.all([
      fetchSheet('NINEA_Immatric'),
      fetchSheet('EnquêteWB_PME'),
      fetchSheet('Macro_PIB'),
    ])

    const ninea = nineaRows ? parseNINEA(nineaRows) : {}
    const wb = wbRows ? parseEnqueteWB(wbRows) : {}
    const macro = macroRows ? parseMacroPIB(macroRows) : {}

    console.log(`[PME] Parsed: NINEA=${!!nineaRows}, WB=${!!wbRows}, Macro=${!!macroRows}`)

    const result: PmeData = {
      immatriculations: ninea.immatriculations || defaults.immatriculations,
      immatricVariation: ninea.immatricVariation || defaults.immatricVariation,
      exportatrices: wb.exportatrices || defaults.exportatrices,
      creditAccess: wb.creditAccess || defaults.creditAccess,
      femmesDirigeantes: wb.femmesDirigeantes || defaults.femmesDirigeantes,
      croissanceEmploi: wb.croissanceEmploi || defaults.croissanceEmploi,
      immatricSeries: (ninea.immatricSeries && ninea.immatricSeries.length > 0) ? ninea.immatricSeries : defaults.immatricSeries,
      typeBreakdown: (ninea.typeBreakdown && ninea.typeBreakdown.length > 0) ? ninea.typeBreakdown : defaults.typeBreakdown,
      tailleBreakdown: (wb.tailleBreakdown && wb.tailleBreakdown.length > 0) ? wb.tailleBreakdown : defaults.tailleBreakdown,
      regimeBreakdown: (ninea.regimeBreakdown && ninea.regimeBreakdown.length > 0) ? ninea.regimeBreakdown : defaults.regimeBreakdown,
      secteurBreakdown: (ninea.secteurBreakdown && ninea.secteurBreakdown.length > 0) ? ninea.secteurBreakdown : defaults.secteurBreakdown,
      secteurByYear: (ninea.secteurByYear && ninea.secteurByYear.length > 0) ? ninea.secteurByYear : defaults.secteurByYear,
      regionBreakdown: (ninea.regionBreakdown && ninea.regionBreakdown.length > 0) ? ninea.regionBreakdown : defaults.regionBreakdown,
      ageBreakdown: (ninea.ageBreakdown && ninea.ageBreakdown.length > 0) ? ninea.ageBreakdown : defaults.ageBreakdown,
      genreBreakdown: (ninea.genreBreakdown && ninea.genreBreakdown.length > 0) ? ninea.genreBreakdown : defaults.genreBreakdown,
      obstacles: (wb.obstacles && wb.obstacles.length > 0) ? wb.obstacles : defaults.obstacles,
    }

    cache = { data: result, expires: Date.now() + CACHE_TTL }
    return result
  } catch (e) {
    console.error('[PME] Fetch failed, using defaults:', e)
    cache = { data: defaults, expires: Date.now() + CACHE_TTL }
    return defaults
  }
}
