/**
 * UNIDO Statistics Portal API Client
 *
 * Provides metadata and data retrieval for the various UNIDO databases.
 * The API is protected by Cloudflare; simple fetch calls may return 403.
 * In that case a headful browser approach is necessary (see notes below).
 *
 * Usage pattern:
 * 1. GET dataset metadata via `getDatasetInfo(name)`
 * 2. POST to `/dataset/getDataWithoutActivities` or `/dataset/getData`
 *    with a payload containing the returned `datasetId`, countryCode,
 *    variableCodes, periods, and optionally `activities`.
 *
 * Endpoints:
 *   GET  https://stat.unido.org/portal/dataset/getDataset/{name}
 *   POST https://stat.unido.org/portal/dataset/getDataWithoutActivities
 *   POST https://stat.unido.org/portal/dataset/getData
 *
 * See: https://stat.unido.org/portal/swagger-ui/index.html
 */

const UNIDO_BASE = 'https://stat.unido.org/portal'
const UNIDO_ANALYTICAL_BASE = 'https://stat.unido.org/analytical-tools'
const UNIDO_LEGACY_BASE = 'https://stat.unido.org/api/2.0'

// simple in-memory cache for metadata, short TTL since dataset IDs change
const unidoCache = new Map<string, { data: any; expires: number }>()
const UNIDO_CACHE_TTL = 6 * 60 * 60 * 1000 // 6h

export const UNIDO_DATASET_PATHS: Record<string, string> = {
  INDSTAT3: 'INDSTAT/3',
  INDSTAT4: 'INDSTAT/4',
  IDSB3: 'IDSB/3',
  IDSB4: 'IDSB/4',
  NATIONAL_ACCOUNTS: 'NATIONAL_ACCOUNTS',
  MTD: 'MTD',
  MMTD: 'MMTD',
  IIP: 'IIP',
  COUNTRY_PROFILE: 'COUNTRY_PROFILE',
  SDG: 'SDG',
  CIP: 'CIP',
}

function normalizeDatasetPath(input: string): string {
  const raw = String(input || '').trim()
  if (!raw) return raw
  const key = raw.toUpperCase().replace(/[\s\-]/g, '_').replace(/\//g, '')
  if (UNIDO_DATASET_PATHS[key]) return UNIDO_DATASET_PATHS[key]
  if (raw.includes('/')) return raw
  return raw
}

function buildDatasetInfoUrl(dataset: string): string {
  const normalized = normalizeDatasetPath(dataset)
  const segments = normalized
    .split('/')
    .map((s) => encodeURIComponent(s))
    .join('/')
  return `${UNIDO_BASE}/dataset/getDataset/${segments}`
}

function parseJsonCandidate(raw: string): any | null {
  const trimmed = raw.trim()
  if (!trimmed) return null
  if (!(trimmed.startsWith('{') || trimmed.startsWith('['))) return null
  try {
    return JSON.parse(trimmed)
  } catch {
    return null
  }
}

function extractBalancedJsonAfterToken(text: string, tokenRegex: RegExp): any | null {
  const match = tokenRegex.exec(text)
  if (!match || match.index < 0) return null

  let i = match.index + match[0].length
  while (i < text.length && /\s/.test(text[i])) i++
  if (i >= text.length) return null

  const start = text[i]
  if (start !== '{' && start !== '[') return null
  const stack = [start]
  let inString = false
  let escaped = false

  for (let j = i + 1; j < text.length; j++) {
    const ch = text[j]
    if (inString) {
      if (escaped) {
        escaped = false
        continue
      }
      if (ch === '\\') {
        escaped = true
        continue
      }
      if (ch === '"') inString = false
      continue
    }

    if (ch === '"') {
      inString = true
      continue
    }
    if (ch === '{') stack.push('{')
    else if (ch === '[') stack.push('[')
    else if (ch === '}' || ch === ']') {
      const want = ch === '}' ? '{' : '['
      if (stack[stack.length - 1] !== want) return null
      stack.pop()
      if (stack.length === 0) {
        const candidate = text.slice(i, j + 1)
        return parseJsonCandidate(candidate)
      }
    }
  }

  return null
}

export function parseHtmlSnippetForData(htmlSnippet: string): any {
  const html = String(htmlSnippet || '')
  if (!html.trim()) {
    throw new Error('Empty HTML snippet')
  }

  // 1) JSON inside <script type="application/json">...</script>
  const scriptJsonRegex = /<script[^>]*type=["']application\/json["'][^>]*>([\s\S]*?)<\/script>/gi
  for (const m of html.matchAll(scriptJsonRegex)) {
    const parsed = parseJsonCandidate(m[1] || '')
    if (parsed !== null) return parsed
  }

  // 2) Common app bootstrapping globals
  const globalTokens = [
    /window\.__NEXT_DATA__\s*=\s*/i,
    /window\.__INITIAL_STATE__\s*=\s*/i,
    /window\.__DATA__\s*=\s*/i,
    /var\s+__DATA__\s*=\s*/i,
  ]
  for (const token of globalTokens) {
    const parsed = extractBalancedJsonAfterToken(html, token)
    if (parsed !== null) return parsed
  }

  // 3) Generic JSON-LD script
  const jsonLdRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  for (const m of html.matchAll(jsonLdRegex)) {
    const parsed = parseJsonCandidate(m[1] || '')
    if (parsed !== null) return parsed
  }

  // 4) Fallback: parse simple HTML tables to row arrays
  const tables = [...html.matchAll(/<table[\s\S]*?<\/table>/gi)].map((m) => m[0])
  if (tables.length > 0) {
    const tableRows = tables.map((table) => {
      const rows = [...table.matchAll(/<tr[\s\S]*?<\/tr>/gi)].map((r) => r[0])
      return rows
        .map((row) => {
          const cells = [...row.matchAll(/<(td|th)[^>]*>([\s\S]*?)<\/\1>/gi)]
            .map((c) => String(c[2] || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim())
            .filter(Boolean)
          return cells
        })
        .filter((cells) => cells.length > 0)
    }).filter((rows) => rows.length > 0)

    if (tableRows.length > 0) return { tables: tableRows }
  }

  throw new Error('No structured data found in HTML snippet')
}

async function unidoFetchJson(url: string, opts: RequestInit = {}): Promise<any> {
  const res = await fetch(url, {
    redirect: 'follow',
    ...opts,
  })
  if (!res.ok) {
    throw new Error(`UNIDO API error ${res.status} for ${url}`)
  }
  const text = await res.text()
  try {
    return JSON.parse(text)
  } catch (e) {
    // Some endpoints return HTML due to bot checks; try parsing structured payload.
    try {
      const parsedFromHtml = parseHtmlSnippetForData(text)
      console.warn('UNIDO returned HTML; extracted structured data from snippet.')
      return parsedFromHtml
    } catch {
      console.error('UNIDO returned non-JSON, body:', text.slice(0, 200))
      throw e
    }
  }
}

export async function getDatasetInfo(name: string): Promise<any> {
  const cacheKey = `unido:dataset:${name}`
  const cached = unidoCache.get(cacheKey)
  if (cached && cached.expires > Date.now()) return cached.data

  const url = buildDatasetInfoUrl(name)
  const data = await unidoFetchJson(url)
  unidoCache.set(cacheKey, { data, expires: Date.now() + UNIDO_CACHE_TTL })
  return data
}

export interface UNIDODataWithoutActivitiesRequest {
  datasetId: string
  countryCode: string
  fullPrecision?: boolean
  variableCodes: string[]
  periods: string[]
}

export interface UNIDODataWithActivitiesRequest {
  datasetId: string
  countryCode: string
  fullPrecision?: boolean
  variableCode: string
  activityCodes?: string[]
  periods: string[]
}

export async function getDataWithoutActivities(body: UNIDODataWithoutActivitiesRequest): Promise<any> {
  const url = `${UNIDO_BASE}/dataset/getDataWithoutActivities`
  const res = await unidoFetchJson(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return res
}

export async function getDataWithActivities(body: UNIDODataWithActivitiesRequest): Promise<any> {
  const url = `${UNIDO_BASE}/dataset/getData`
  const res = await unidoFetchJson(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return res
}

export interface UNIDOLegacyIhpiQuery {
  datasetId?: string
  indices?: string | string[]
  ihpiCodes?: string | string[]
}

function toCsv(value: string | string[] | undefined, fallback: string): string {
  if (Array.isArray(value)) {
    const cleaned = value.map((s) => String(s).trim()).filter(Boolean)
    return cleaned.length ? cleaned.join(',') : fallback
  }
  const raw = String(value || '').trim()
  return raw || fallback
}

export async function getLegacyIhpiData(query: UNIDOLegacyIhpiQuery = {}): Promise<any> {
  const datasetId = query.datasetId || 'niofshc'
  const indices = toCsv(query.indices, 'C1,05-39')
  const ihpiCodes = toCsv(query.ihpiCodes, 'I2')
  const params = new URLSearchParams({
    datasetId,
    indices,
    'ippi-ihpi': ihpiCodes,
  })
  const url = `${UNIDO_LEGACY_BASE}/data?${params.toString()}`
  return unidoFetchJson(url)
}

export async function getLegacyIhpiDashboardData(query: UNIDOLegacyIhpiQuery = {}): Promise<any> {
  const datasetId = query.datasetId || 'niofshc'
  const indicesCsv = toCsv(query.indices, 'C1,05-39')
  const ihpiCodesCsv = toCsv(query.ihpiCodes, 'I2')
  const indices = indicesCsv.split(',').map((s) => s.trim()).filter(Boolean)
  const ihpiCodes = ihpiCodesCsv.split(',').map((s) => s.trim()).filter(Boolean)
  const raw = await getLegacyIhpiData({
    datasetId,
    indices: indicesCsv,
    ihpiCodes: ihpiCodesCsv,
  })

  let rows: any[] = []
  if (Array.isArray(raw?.data)) {
    rows = raw.data.map((d: any) => ({
      period: d?.p ?? d?.period ?? null,
      indicatorCode: d?.c ?? d?.indicator ?? d?.ihpi ?? null,
      indexCode: d?.a ?? d?.index ?? d?.indices ?? null,
      value: typeof d?.v === 'number' ? d.v : (typeof d?.value === 'number' ? d.value : null),
      raw: d,
    }))
  } else if (Array.isArray(raw)) {
    rows = raw.map((d: any) => ({
      period: d?.p ?? d?.period ?? null,
      indicatorCode: d?.c ?? d?.indicator ?? d?.ihpi ?? null,
      indexCode: d?.a ?? d?.index ?? d?.indices ?? null,
      value: typeof d?.v === 'number' ? d.v : (typeof d?.value === 'number' ? d.value : null),
      raw: d,
    }))
  }

  return {
    datasetId,
    indices,
    ihpiCodes,
    rows,
    raw,
    source: 'UNIDO legacy API 2.0',
  }
}

export async function getLatestTrends(country = '686', codes = 'OTH_,MI_OTH'): Promise<any> {
  const params = new URLSearchParams({ country, codes })
  const url = `${UNIDO_ANALYTICAL_BASE}/latest-trends?${params.toString()}`
  return unidoFetchJson(url)
}

function resolveCountryCode(datasetInfo: any, countryInput = 'SEN'): string {
  const input = String(countryInput || '').trim().toUpperCase()
  if (!input) return '686'
  if (/^\d+$/.test(input)) return input

  const countries = Array.isArray(datasetInfo?.countries) ? datasetInfo.countries : []
  const found = countries.find((c: any) =>
    String(c?.iso3 || '').toUpperCase() === input ||
    String(c?.iso2 || '').toUpperCase() === input ||
    String(c?.c || '').toUpperCase() === input
  )
  return String(found?.c || datasetInfo?.location || '686')
}

function resolvePeriods(datasetInfo: any, periods?: string[]): string[] {
  if (Array.isArray(periods) && periods.length) return periods
  const all = Array.isArray(datasetInfo?.periods) ? datasetInfo.periods.map((p: any) => String(p)) : []
  return all.slice(-10)
}

function buildVariableMap(datasetInfo: any): Record<string, string> {
  const map: Record<string, string> = {}
  const vars = Array.isArray(datasetInfo?.variables) ? datasetInfo.variables : []
  for (const v of vars) {
    const code = String(v?.c || '')
    const label = String(v?.lang?.en || code)
    if (code) map[code] = label
  }
  return map
}

function buildActivityMap(datasetInfo: any): Record<string, string> {
  const map: Record<string, string> = {}
  const acts = Array.isArray(datasetInfo?.activities) ? datasetInfo.activities : []
  for (const a of acts) {
    const code = String(a?.c || '')
    const label = String(a?.lang?.en || code)
    if (code) map[code] = label
  }
  return map
}

export interface UNIDODashboardQuery {
  dataset: string
  country?: string
  variableCodes?: string[]
  variableCode?: string
  activityCodes?: string[]
  periods?: string[]
  fullPrecision?: boolean
}

export async function getUNIDODashboardData(query: UNIDODashboardQuery): Promise<any> {
  const datasetInfo = await getDatasetInfo(query.dataset)
  const datasetId = String(datasetInfo?.id || '')
  if (!datasetId) {
    throw new Error('UNIDO dataset id is missing in metadata response')
  }

  const countryCode = resolveCountryCode(datasetInfo, query.country || 'SEN')
  const periods = resolvePeriods(datasetInfo, query.periods)
  const variableMap = buildVariableMap(datasetInfo)
  const activityMap = buildActivityMap(datasetInfo)
  const hasActivities = Array.isArray(datasetInfo?.activities) && datasetInfo.activities.length > 0

  if (hasActivities) {
    const defaultVariable = String(datasetInfo?.variables?.[0]?.c || '')
    const variableCode = String(query.variableCode || defaultVariable)
    const requestedActivities = (query.activityCodes && query.activityCodes.length)
      ? query.activityCodes
      : [String(datasetInfo.activities.find((a: any) => a?.c === 'C')?.c || datasetInfo.activities[0]?.c || '')].filter(Boolean)

    if (!variableCode) throw new Error('variableCode is required for datasets with activities')
    const raw = await getDataWithActivities({
      datasetId,
      countryCode,
      variableCode,
      activityCodes: requestedActivities,
      periods,
      fullPrecision: query.fullPrecision !== false,
    })
    const rows = (Array.isArray(raw?.data) ? raw.data : []).map((d: any) => ({
      period: String(d?.p || ''),
      variableCode,
      variableLabel: variableMap[variableCode] || variableCode,
      activityCode: String(d?.a || ''),
      activityLabel: activityMap[String(d?.a || '')] || String(d?.a || ''),
      value: typeof d?.v === 'number' ? d.v : null,
      usdValue: typeof d?.u === 'number' ? d.u : null,
      metadata: d?.m || [],
    }))
    return {
      dataset: query.dataset,
      datasetId,
      countryCode,
      periods,
      hasActivities: true,
      rows,
      metadata: datasetInfo,
      source: 'UNIDO portal API',
    }
  }

  const requestedVariables = (query.variableCodes && query.variableCodes.length)
    ? query.variableCodes
    : (Array.isArray(datasetInfo?.variables) ? datasetInfo.variables.slice(0, 8).map((v: any) => String(v?.c || '')).filter(Boolean) : [])

  const raw = await getDataWithoutActivities({
    datasetId,
    countryCode,
    variableCodes: requestedVariables,
    periods,
    fullPrecision: query.fullPrecision !== false,
  })

  const rows = (Array.isArray(raw?.data) ? raw.data : []).map((d: any) => ({
    period: String(d?.p || ''),
    variableCode: String(d?.c || ''),
    variableLabel: variableMap[String(d?.c || '')] || String(d?.c || ''),
    value: typeof d?.v === 'number' ? d.v : null,
    metadata: d?.m || [],
  }))

  return {
    dataset: query.dataset,
    datasetId,
    countryCode,
    periods,
    hasActivities: false,
    rows,
    metadata: datasetInfo,
    source: 'UNIDO portal API',
  }
}

/**
 * Fallback note: if Cloudflare blocks simple fetch, you may need to
 * use a headful browser client (undetected_chromedriver) to obtain
 * the JSON as described in the user-provided instructions.
 */
