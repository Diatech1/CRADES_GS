/**
 * Senegal Ministry APIs Client
 * Integration with various ministry data sources for sector-specific indicators
 * 
 * Ministries:
 * - Ministry of Commerce (Commerce Intérieur & Extérieur)
 * - Ministry of Industry and SMEs (PME-PMI)
 * - Ministry of Industry and SMEs (industrial data)
 * 
 * This client currently focuses on industry and commerce data.
 */

// ─── Configuration ────────────────────────────────────

const MINISTRY_APIS = {
  commerce: 'https://api.commerce.sn',
  industry: 'https://api.industrie.sn',
  // Fallback to main data portal
  dataPortal: 'https://data.senegal.gov.sn/api',
}

const ministryCache = new Map<string, { data: any; expires: number }>()
const MINISTRY_CACHE_TTL = 24 * 60 * 60 * 1000

// ─── Types ───────────────────────────────────────────────

export interface CommerceData {
  type: 'domestic' | 'foreign'
  totalValue: number
  currency: string
  period: string
  byProduct: Array<{
    product: string
    productFr: string
    value: number
    share: number
  }>
  topPartners: Array<{
    country: string
    value: number
    share: number
  }>
}

export interface IndustryData {
  registeredSMEs: number
  activeFactories: number
  industrialOutput: number
  capacityUtilization: number
  employees: number
  byRegion: Array<{
    region: string
    smeCount: number
    employmentLevel: number
  }>
  bySubsector: Array<{
    subsector: string
    subsectorFr: string
    factoryCount: number
    output: number
  }>
}


// ─── Ministry of Commerce ──────────────────────────────

export async function getCommerceData(type: 'domestic' | 'foreign' = 'foreign'): Promise<CommerceData> {
  const cacheKey = `ministry:commerce:${type}`
  const cached = ministryCache.get(cacheKey)
  if (cached && cached.expires > Date.now()) {
    return cached.data
  }

  try {
    const endpoint = type === 'domestic' ? 'commerce/domestic' : 'commerce/foreign'
    const res = await fetch(`${MINISTRY_APIS.commerce}/${endpoint}`, {
      headers: { 'Accept': 'application/json' },
    })

    if (res.ok) {
      const data = await res.json()
      const transformed = transformCommerceData(data, type)
      ministryCache.set(cacheKey, { data: transformed, expires: Date.now() + MINISTRY_CACHE_TTL })
      return transformed
    }
  } catch (e) {
    console.warn(`Ministry of Commerce API unavailable (${type}):`, e)
  }

  return {
    type,
    totalValue: 0,
    currency: 'FCFA',
    period: 'n/a',
    byProduct: [],
    topPartners: [],
  }
}

export async function getIndustryData(): Promise<IndustryData> {
  const cacheKey = 'ministry:industry'
  const cached = ministryCache.get(cacheKey)
  if (cached && cached.expires > Date.now()) {
    return cached.data
  }

  try {
    const res = await fetch(`${MINISTRY_APIS.industry}/overview`, {
      headers: { 'Accept': 'application/json' },
    })

    if (res.ok) {
      const data = await res.json()
      const transformed = transformIndustryData(data)
      ministryCache.set(cacheKey, { data: transformed, expires: Date.now() + MINISTRY_CACHE_TTL })
      return transformed
    }
  } catch (e) {
    console.warn('Ministry of Industry API unavailable:', e)
  }

  return {
    registeredSMEs: 0,
    activeFactories: 0,
    industrialOutput: 0,
    capacityUtilization: 0,
    employees: 0,
    byRegion: [],
    bySubsector: [],
  }
}


export async function getSectorSpecificData(sector: string): Promise<any> {
  switch (sector.toLowerCase()) {
    case 'commerce':
    case 'commerce-exterieur':
      return getCommerceData('foreign')
    case 'commerce-interieur':
      return getCommerceData('domestic')
    case 'industrie':
    case 'industrie-manufacturiere':
      return getIndustryData()
    default:
      return null
  }
}

// ─── Data Transformers ────────────────────────────────

function transformCommerceData(rawData: any, type: string): CommerceData {
  return {
    type: type as 'domestic' | 'foreign',
    totalValue: rawData.totalValue || 0,
    currency: rawData.currency || 'FCFA',
    period: rawData.period || '',
    byProduct: rawData.byProduct || [],
    topPartners: rawData.topPartners || [],
  }
}

function transformIndustryData(rawData: any): IndustryData {
  return {
    registeredSMEs: rawData.registeredSMEs || 0,
    activeFactories: rawData.activeFactories || 0,
    industrialOutput: rawData.industrialOutput || 0,
    capacityUtilization: rawData.capacityUtilization || 0,
    employees: rawData.employees || 0,
    byRegion: rawData.byRegion || [],
    bySubsector: rawData.bySubsector || [],
  }
}


// ─── Sample Data (Fallback) ────────────────────────────

