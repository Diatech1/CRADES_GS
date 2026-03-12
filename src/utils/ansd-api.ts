/**
 * ANSD (Agence Nationale de la Statistique et de la Démographie) API Client
 * Senegal's official statistics agency
 * 
 * Data sources:
 * - Economic indicators (GDP, inflation, employment)
 * - Trade statistics (imports/exports)
 * - Industrial production index
 * - Consumer price index
 * - Labor statistics
 * 
 * Base URL: https://www.ansd.sn/api (if available)
 * Policy: never generate synthetic fallback statistics.
 */

const ANSD_BASE = 'https://api.ansd.sn'
const ANSD_ODA_BASE = 'https://senegal.opendataforafrica.org/api/1.0/sdmx/data/niofshc'
const ANSD_ODA_KEY_QUERY = 'key=I1+I2.C32+05-39'

// In-memory cache — 24h TTL (official statistics change infrequently)
const ansdCache = new Map<string, { data: any; expires: number }>()
const ANSD_CACHE_TTL = 24 * 60 * 60 * 1000

// ─── Types ───────────────────────────────────────────────

export interface MacroIndicator {
  code: string
  name: string
  nameFr: string
  value: number
  unit: string
  period: string
  source: string
  lastUpdated: string
}

export interface IndustrialIndex {
  month: string
  year: number
  indexValue: number
  previousMonth: number
  changePercent: number
  sector: string
}

export interface ConsumerPriceIndex {
  month: string
  year: number
  general: number
  food: number
  energy: number
  services: number
  changeYoY: number
}

export interface EmploymentData {
  period: string
  totalEmployed: number
  unemployment: number
  unemploymentRate: number
  sector: string
}

export interface AnsdFetchOptions {
  browserFetcherUrl?: string
  browserFetcherToken?: string
}

function safeJsonParse(text: string): any | null {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

function looksLikeCloudflareChallenge(status: number, text: string, contentType: string): boolean {
  const body = String(text || '').toLowerCase()
  const ctype = String(contentType || '').toLowerCase()
  if (status === 403 || status === 503) {
    if (body.includes('cf-chl') || body.includes('cloudflare') || body.includes('just a moment')) return true
  }
  if (ctype.includes('text/html') && (body.includes('cf-chl') || body.includes('cloudflare challenge'))) return true
  return false
}

async function fetchViaBrowserFetcher(targetUrl: string, options: AnsdFetchOptions): Promise<any | null> {
  const browserFetcherUrl = String(options.browserFetcherUrl || '').trim()
  if (!browserFetcherUrl) return null

  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (options.browserFetcherToken) {
    headers.Authorization = `Bearer ${options.browserFetcherToken}`
  }

  const res = await fetch(browserFetcherUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      url: targetUrl,
      method: 'GET',
      headers: { Accept: 'application/json' },
      provider: 'ANSD',
    }),
  })
  if (!res.ok) {
    throw new Error(`ANSD browser fetcher failed (${res.status})`)
  }

  const text = await res.text()
  const parsed = safeJsonParse(text)
  if (parsed === null) {
    throw new Error('ANSD browser fetcher returned non-JSON payload')
  }

  // Supports either:
  // 1) raw JSON payload from ANSD
  // 2) wrapper payload: { status, body, data }
  if (parsed && typeof parsed === 'object') {
    if (parsed.data !== undefined) return parsed.data
    if (parsed.body !== undefined) {
      if (typeof parsed.body === 'string') return safeJsonParse(parsed.body)
      return parsed.body
    }
  }
  return parsed
}

async function fetchJsonWithCloudflareFallback(url: string, options: AnsdFetchOptions = {}): Promise<any | null> {
  try {
    const direct = await fetch(url, {
      headers: { Accept: 'application/json' },
    })
    const text = await direct.text()
    const contentType = direct.headers.get('content-type') || ''
    const parsed = safeJsonParse(text)
    if (direct.ok && parsed !== null) return parsed

    if (looksLikeCloudflareChallenge(direct.status, text, contentType)) {
      const fallback = await fetchViaBrowserFetcher(url, options)
      if (fallback !== null) return fallback
    }
  } catch (e) {
    // If direct fetch fails (network/protection), try browser fetcher when configured.
    try {
      const fallback = await fetchViaBrowserFetcher(url, options)
      if (fallback !== null) return fallback
    } catch {
      console.warn('ANSD direct+browser fetch failed:', e)
    }
  }
  return null
}

// ─── Macro Economic Indicators ─────────────────────────

export async function getMacroIndicators(options: AnsdFetchOptions = {}): Promise<MacroIndicator[]> {
  const cacheKey = 'ansd:macro'
  const cached = ansdCache.get(cacheKey)
  if (cached && cached.expires > Date.now()) {
    return cached.data
  }

  try {
    // Try direct ANSD API first
    const data = await fetchJsonWithCloudflareFallback(`${ANSD_BASE}/indicators`, options)
    if (data) {
      const indicators = transformAnsdIndicators(data)
      ansdCache.set(cacheKey, { data: indicators, expires: Date.now() + ANSD_CACHE_TTL })
      return indicators
    }
  } catch (e) {
    console.warn('ANSD API unavailable:', e)
  }

  return []
}

export async function getIndustrialIndex(
  year?: number,
  sector?: string,
  options: AnsdFetchOptions = {},
): Promise<IndustrialIndex[]> {
  const cacheKey = `ansd:ipi:${year || 'latest'}:${sector || 'all'}`
  const cached = ansdCache.get(cacheKey)
  if (cached && cached.expires > Date.now()) {
    return cached.data
  }

  // Primary IHPI source (ANSD dataset on OpenDataForAfrica, SDMX)
  // Try both known query styles.
  try {
    const odaQueries = [
      (() => {
        const p = new URLSearchParams({
          Indices: 'C32;05-39',
          'IPPI-IHPI': 'I1;I2',
        })
        return p.toString()
      })(),
      ANSD_ODA_KEY_QUERY,
    ]

    for (const query of odaQueries) {
      const odaJson = await fetchJsonWithCloudflareFallback(`${ANSD_ODA_BASE}?${query}`, options)
      if (!odaJson) continue
      const parsed = parseIhpiSdmx(odaJson)
      const filtered = year ? parsed.filter((p) => p.year === year) : parsed
      if (filtered.length > 0) {
        ansdCache.set(cacheKey, { data: filtered, expires: Date.now() + ANSD_CACHE_TTL })
        return filtered
      }
    }
  } catch (e) {
    console.warn('ANSD ODA IHPI unavailable:', e)
  }

  try {
    const params = new URLSearchParams()
    if (year) params.append('year', String(year))
    if (sector) params.append('sector', sector)

    const data = await fetchJsonWithCloudflareFallback(`${ANSD_BASE}/industrial-index?${params.toString()}`, options)
    if (data) {
      ansdCache.set(cacheKey, { data, expires: Date.now() + ANSD_CACHE_TTL })
      return data
    }
  } catch (e) {
    console.warn('ANSD Industrial Index unavailable:', e)
  }

  return []
}

export async function getConsumerPriceIndex(
  months = 12,
  options: AnsdFetchOptions = {},
): Promise<ConsumerPriceIndex[]> {
  const cacheKey = `ansd:cpi:${months}`
  const cached = ansdCache.get(cacheKey)
  if (cached && cached.expires > Date.now()) {
    return cached.data
  }

  try {
    const data = await fetchJsonWithCloudflareFallback(`${ANSD_BASE}/cpi?months=${months}`, options)
    if (data) {
      ansdCache.set(cacheKey, { data, expires: Date.now() + ANSD_CACHE_TTL })
      return data
    }
  } catch (e) {
    console.warn('ANSD CPI unavailable:', e)
  }

  return []
}

export async function getEmploymentStats(
  sector?: string,
  options: AnsdFetchOptions = {},
): Promise<EmploymentData[]> {
  const cacheKey = `ansd:employment:${sector || 'all'}`
  const cached = ansdCache.get(cacheKey)
  if (cached && cached.expires > Date.now()) {
    return cached.data
  }

  try {
    const url = sector 
      ? `${ANSD_BASE}/employment?sector=${sector}`
      : `${ANSD_BASE}/employment`

    const data = await fetchJsonWithCloudflareFallback(url, options)
    if (data) {
      ansdCache.set(cacheKey, { data, expires: Date.now() + ANSD_CACHE_TTL })
      return data
    }
  } catch (e) {
    console.warn('ANSD Employment data unavailable:', e)
  }

  return []
}

// ─── Helper Functions ─────────────────────────────────

function transformAnsdIndicators(rawData: any): MacroIndicator[] {
  // Transform ANSD API response to MacroIndicator format
  // Adapt based on actual ANSD API response structure
  return rawData.indicators?.map((ind: any) => ({
    code: ind.code,
    name: ind.name,
    nameFr: ind.name_fr || ind.name,
    value: parseFloat(ind.value),
    unit: ind.unit || '',
    period: ind.period || new Date().getFullYear().toString(),
    source: 'ANSD',
    lastUpdated: new Date().toISOString(),
  })) || []
}

function parseIhpiSdmx(raw: any): IndustrialIndex[] {
  const dataSets = raw?.dataSets
  const datasetSeries = dataSets?.[0]?.series
  const seriesDims = raw?.structure?.dimensions?.series || []
  const obsTimeValues = raw?.structure?.dimensions?.observation?.[0]?.values || []
  if (!datasetSeries || typeof datasetSeries !== 'object') return []

  const points: Array<{ month: string; year: number; value: number; sortKey: number }> = []

  for (const [seriesKey, seriesData] of Object.entries<any>(datasetSeries)) {
    const dimIndexes = String(seriesKey).split(':').map((x) => Number(x))
    let isIhpiSeries = false
    seriesDims.forEach((dim: any, i: number) => {
      const idx = dimIndexes[i]
      const dimValue = dim?.values?.[idx]
      const id = String(dimValue?.id || '').toUpperCase()
      const name = String(dimValue?.name || '').toUpperCase()
      if (id === 'I2' || name.includes('IHPI')) isIhpiSeries = true
    })
    if (!isIhpiSeries) continue

    const observations = seriesData?.observations || {}
    for (const [obsIndexKey, obsValueRaw] of Object.entries<any>(observations)) {
      const obsIndex = Number(obsIndexKey)
      const val = Array.isArray(obsValueRaw) ? Number(obsValueRaw[0]) : Number(obsValueRaw)
      if (!Number.isFinite(val)) continue
      const periodId = String(obsTimeValues?.[obsIndex]?.id || obsTimeValues?.[obsIndex]?.name || '')
      const parsedPeriod = parsePeriod(periodId)
      if (!parsedPeriod) continue
      points.push({
        month: parsedPeriod.month,
        year: parsedPeriod.year,
        value: val,
        sortKey: parsedPeriod.sortKey,
      })
    }
  }

  points.sort((a, b) => a.sortKey - b.sortKey)
  if (points.length === 0) return []

  return points.map((p, i) => {
    const prev = i > 0 ? points[i - 1] : null
    const prevVal = prev ? prev.value : p.value
    const change = prevVal !== 0 ? ((p.value - prevVal) / prevVal) * 100 : 0
    return {
      month: p.month,
      year: p.year,
      indexValue: p.value,
      previousMonth: prevVal,
      changePercent: change,
      sector: 'Industrial',
    }
  })
}

function parsePeriod(period: string): { month: string; year: number; sortKey: number } | null {
  const v = String(period || '').trim()
  if (!v) return null

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ]

  // 2025M03
  let m = v.match(/^(\d{4})M(\d{2})$/i)
  if (m) {
    const year = Number(m[1])
    const month = Number(m[2])
    if (month >= 1 && month <= 12) {
      return { month: monthNames[month - 1], year, sortKey: year * 100 + month }
    }
  }

  // 2025-03 or 2025/03
  m = v.match(/^(\d{4})[-\/](\d{1,2})$/)
  if (m) {
    const year = Number(m[1])
    const month = Number(m[2])
    if (month >= 1 && month <= 12) {
      return { month: monthNames[month - 1], year, sortKey: year * 100 + month }
    }
  }

  // Yearly format
  m = v.match(/^(\d{4})$/)
  if (m) {
    const year = Number(m[1])
    return { month: 'December', year, sortKey: year * 100 + 12 }
  }

  return null
}

