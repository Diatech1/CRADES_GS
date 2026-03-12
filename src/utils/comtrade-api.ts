/**
 * UN Comtrade API helper
 *
 * Notes:
 * - `public/v1/getComtradeReleases` is public (no key)
 * - `data/v1/get/...` requires `Ocp-Apim-Subscription-Key`
 */

const COMTRADE_RELEASES_URL = 'https://comtradeapi.un.org/public/v1/getComtradeReleases'
const COMTRADE_DATA_URL = 'https://comtradeapi.un.org/data/v1/get/C/A/HS'
const COMTRADE_REPORTER_CODE = '686' // Senegal

const comtradeCache = new Map<string, { data: any; expires: number }>()

function getEnvVar(name: string): string {
  const value = (globalThis as any)?.process?.env?.[name]
  return typeof value === 'string' ? value.trim() : ''
}

export async function getComtradeReleases(): Promise<any | null> {
  const cacheKey = 'comtrade:releases'
  const cached = comtradeCache.get(cacheKey)
  if (cached && cached.expires > Date.now()) return cached.data
  try {
    const res = await fetch(COMTRADE_RELEASES_URL, { headers: { Accept: 'application/json' } })
    if (!res.ok) return null
    const data = await res.json()
    comtradeCache.set(cacheKey, { data, expires: Date.now() + 6 * 60 * 60 * 1000 })
    return data
  } catch {
    return null
  }
}

export function parseLatestYearFromReleases(releases: any): number | null {
  const rows = Array.isArray(releases?.data) ? releases.data : []
  let best: number | null = null
  for (const row of rows) {
    const desc = String(row?.datasetDesc || '')
    const m = desc.match(/\b(CM|CA)\s+(\d{4})(\d{2})?\b/i)
    if (!m) continue
    const y = Number(m[2])
    if (!Number.isFinite(y)) continue
    if (best === null || y > best) best = y
  }
  return best
}

export async function getComtradeAnnualOverview(year: number): Promise<{
  year: number
  totalExports: number
  totalImports: number
  tradeBalance: number
} | null> {
  const apiKey = getEnvVar('COMTRADE_API_KEY')
  if (!apiKey) return null

  const cacheKey = `comtrade:overview:${year}`
  const cached = comtradeCache.get(cacheKey)
  if (cached && cached.expires > Date.now()) return cached.data

  const params = new URLSearchParams({
    reporterCode: COMTRADE_REPORTER_CODE,
    period: String(year),
    partnerCode: '0',
    cmdCode: 'TOTAL',
    flowCode: 'M,X',
    customsCode: 'C00',
    motCode: '0',
    maxRecords: '500',
    format: 'JSON',
  })

  try {
    const res = await fetch(`${COMTRADE_DATA_URL}?${params.toString()}`, {
      headers: {
        Accept: 'application/json',
        'Ocp-Apim-Subscription-Key': apiKey,
      },
    })
    if (!res.ok) return null
    const data = await res.json()
    const rows = Array.isArray(data?.data) ? data.data : (Array.isArray(data?.dataset) ? data.dataset : [])
    if (!rows.length) return null

    let exportsUsd = 0
    let importsUsd = 0
    for (const r of rows) {
      const rawVal = Number(r?.primaryValue ?? r?.tradeValue ?? r?.TradeValue ?? 0)
      if (!Number.isFinite(rawVal) || rawVal <= 0) continue
      const flow = String(r?.flowCode ?? r?.flow ?? r?.flowDesc ?? '').toUpperCase()
      if (flow === 'X' || flow.includes('EXPORT')) exportsUsd += rawVal
      else if (flow === 'M' || flow.includes('IMPORT')) importsUsd += rawVal
    }

    // Normalize to US$ thousands for compatibility with existing WITS format.
    const overview = {
      year,
      totalExports: Math.round(exportsUsd / 1000),
      totalImports: Math.round(importsUsd / 1000),
      tradeBalance: Math.round((exportsUsd - importsUsd) / 1000),
    }
    comtradeCache.set(cacheKey, { data: overview, expires: Date.now() + 24 * 60 * 60 * 1000 })
    return overview
  } catch {
    return null
  }
}
