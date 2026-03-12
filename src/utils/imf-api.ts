/**
 * IMF SDMX API client (public endpoint).
 * Focus: Senegal CPI series for dashboard use.
 */

export interface ImfIndexPoint {
  period: string
  value: number
}

export interface ImfAnnualPoint {
  year: number
  value: number
}

const IMF_SDMX_BASE = 'https://api.imf.org/external/sdmx/2.1/data'
const IMF_CACHE_TTL = 24 * 60 * 60 * 1000
const imfCache = new Map<string, { data: any; expires: number }>()

function parseAttrs(tag: string): Record<string, string> {
  const out: Record<string, string> = {}
  const re = /([A-Z0-9_:-]+)="([^"]*)"/g
  let m: RegExpExecArray | null
  while ((m = re.exec(tag)) !== null) out[m[1]] = m[2]
  return out
}

function parseCpiSeries(xml: string): ImfIndexPoint[] {
  const seriesRe = /<Series\b([^>]*)>([\s\S]*?)<\/Series>/g
  const obsRe = /<Obs\b([^>]*)\/>/g

  let targetBody = ''
  let sm: RegExpExecArray | null

  // Pick headline CPI monthly index series when available.
  while ((sm = seriesRe.exec(xml)) !== null) {
    const attrs = parseAttrs(sm[1] || '')
    if (
      attrs.COUNTRY === 'SEN' &&
      attrs.INDEX_TYPE === 'CPI' &&
      attrs.COICOP_1999 === '_T' &&
      attrs.TYPE_OF_TRANSFORMATION === 'IX' &&
      attrs.FREQUENCY === 'M'
    ) {
      targetBody = sm[2] || ''
      break
    }
  }

  if (!targetBody) return []

  const points: ImfIndexPoint[] = []
  let om: RegExpExecArray | null
  while ((om = obsRe.exec(targetBody)) !== null) {
    const attrs = parseAttrs(om[1] || '')
    const period = String(attrs.TIME_PERIOD || '').trim()
    const raw = attrs.OBS_VALUE
    const value = raw !== undefined ? Number(raw) : NaN
    if (!period || !Number.isFinite(value)) continue
    points.push({ period, value })
  }

  points.sort((a, b) => a.period.localeCompare(b.period))
  return points
}

function parseWeoAnnualSeries(xml: string, indicatorCode: string): ImfAnnualPoint[] {
  const seriesRe = /<Series\b([^>]*)>([\s\S]*?)<\/Series>/g
  const obsRe = /<Obs\b([^>]*)\/>/g

  let sm: RegExpExecArray | null
  const points: ImfAnnualPoint[] = []

  while ((sm = seriesRe.exec(xml)) !== null) {
    const attrs = parseAttrs(sm[1] || '')
    if (
      attrs.COUNTRY !== 'SEN' ||
      attrs.INDICATOR !== indicatorCode ||
      attrs.FREQUENCY !== 'A'
    ) continue

    const body = sm[2] || ''
    let om: RegExpExecArray | null
    while ((om = obsRe.exec(body)) !== null) {
      const obsAttrs = parseAttrs(om[1] || '')
      const year = Number(obsAttrs.TIME_PERIOD)
      const value = Number(obsAttrs.OBS_VALUE)
      if (!Number.isFinite(year) || !Number.isFinite(value)) continue
      points.push({ year, value })
    }
  }

  points.sort((a, b) => a.year - b.year)
  return points
}

export async function getSenegalCpiSeries(startPeriod = '2015-M01'): Promise<ImfIndexPoint[]> {
  const cacheKey = `imf:cpi:sen:${startPeriod}`
  const cached = imfCache.get(cacheKey)
  if (cached && cached.expires > Date.now()) return cached.data

  try {
    const url = `${IMF_SDMX_BASE}/CPI/SEN?startPeriod=${encodeURIComponent(startPeriod)}`
    const res = await fetch(url, {
      headers: {
        Accept: 'application/xml,text/xml',
      },
    })
    if (!res.ok) return []

    const xml = await res.text()
    const points = parseCpiSeries(xml)
    imfCache.set(cacheKey, { data: points, expires: Date.now() + IMF_CACHE_TTL })
    return points
  } catch {
    return []
  }
}

export async function getSenegalWeoSeries(indicatorCode: string, startYear = 2010): Promise<ImfAnnualPoint[]> {
  const cacheKey = `imf:weo:sen:${indicatorCode}:${startYear}`
  const cached = imfCache.get(cacheKey)
  if (cached && cached.expires > Date.now()) return cached.data

  try {
    const url = `${IMF_SDMX_BASE}/WEO/SEN.${encodeURIComponent(indicatorCode)}?startPeriod=${startYear}`
    const res = await fetch(url, {
      headers: {
        Accept: 'application/xml,text/xml',
      },
    })
    if (!res.ok) return []

    const xml = await res.text()
    const series = parseWeoAnnualSeries(xml, indicatorCode)
    imfCache.set(cacheKey, { data: series, expires: Date.now() + IMF_CACHE_TTL })
    return series
  } catch {
    return []
  }
}

export async function getSenegalWeoLatest(indicatorCode: string, year?: number): Promise<ImfAnnualPoint | null> {
  const series = await getSenegalWeoSeries(indicatorCode)
  if (series.length === 0) return null
  if (year !== undefined) {
    const match = series.find((p) => p.year === year)
    return match || null
  }
  const currentYear = new Date().getFullYear()
  const historicalOrCurrent = series.filter((p) => p.year <= currentYear)
  if (historicalOrCurrent.length > 0) {
    return historicalOrCurrent[historicalOrCurrent.length - 1]
  }
  return series[series.length - 1]
}
