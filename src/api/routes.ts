import { Hono } from 'hono'
import {
  getPosts, getPostBySlug, getPublications, getPublicationBySlug,
  getIndicateurs, getDashboards, getDatasets,
  getPublicationTypes, getSectors, getCategories,
  stripHtml, formatDate, getFeaturedImage, getTerms, getWpUrl,
  WPPost
} from '../utils/wp-api'
import {
  getTradeOverview, getTradeTimeSeries, getTradeBySector,
  getTopPartners, getLatestAvailableYear, getTradeDashboardData
} from '../utils/wits-api'
import {
  getComtradeReleases, parseLatestYearFromReleases
} from '../utils/comtrade-api'
import {
  getMacroIndicators, getIndustrialIndex, getConsumerPriceIndex, getEmploymentStats
} from '../utils/ansd-api'
import {
  getCountryInfo, getIndicators as getWBIndicators, getTimeSeries as getWBTimeSeries
} from '../utils/wb-indicators-api'
import {
  getSenegalCpiSeries
} from '../utils/imf-api'
import {
  getCommerceData, getIndustryData, getSectorSpecificData
} from '../utils/ministry-api'
import {
  getDatasetInfo, getDataWithoutActivities, getDataWithActivities, parseHtmlSnippetForData,
  getUNIDODashboardData, UNIDO_DATASET_PATHS, getLegacyIhpiData, getLegacyIhpiDashboardData
} from '../utils/unido-api'
import {
  fetchPmePmiData
} from '../utils/google-sheets-api'

const api = new Hono()

function getAnsdFetchOptions(c: any) {
  return {
    browserFetcherUrl: c?.env?.ANSD_BROWSER_FETCH_URL,
    browserFetcherToken: c?.env?.ANSD_BROWSER_FETCH_TOKEN,
  }
}

// ===============================
// PUBLIC API ENDPOINTS (WP PROXY)
// ===============================

/** GET /api/indicators — proxy to WP indicateur CPT */
api.get('/indicators', async (c) => {
  try {
    const indicators = await getIndicateurs(20)
    const mapped = indicators.map((ind: WPPost) => ({
      id: ind.id,
      name: ind.title?.rendered || '',
      value: ind.meta?.indicateur_value || '',
      unit: ind.meta?.indicateur_unit || '',
      change_percent: ind.meta?.indicateur_change_percent || 0,
      change_direction: ind.meta?.indicateur_change_direction || 'up',
      period: ind.meta?.indicateur_period || '',
    }))
    return c.json({ indicators: mapped, source: 'wordpress' })
  } catch (e: any) {
    return c.json({ indicators: [], error: e.message }, 500)
  }
})

/** GET /api/publications — proxy to WP publication CPT */
api.get('/publications', async (c) => {
  try {
    const count = parseInt(c.req.query('limit') || '20')
    const publications = await getPublications(count)
    const mapped = publications.map((pub: WPPost) => ({
      id: pub.id,
      title: pub.title?.rendered || '',
      slug: pub.slug,
      date: pub.date,
      year: new Date(pub.date).getFullYear(),
      excerpt: stripHtml(pub.excerpt?.rendered || ''),
      image: getFeaturedImage(pub),
      terms: getTerms(pub),
    }))
    return c.json({ publications: mapped, total: mapped.length, source: 'wordpress' })
  } catch (e: any) {
    return c.json({ publications: [], total: 0, error: e.message }, 500)
  }
})

/** GET /api/publications/:slug */
api.get('/publications/:slug', async (c) => {
  try {
    const slug = c.req.param('slug')
    const pub = await getPublicationBySlug(slug)
    if (!pub) return c.json({ error: 'Not found' }, 404)
    return c.json({
      publication: {
        id: pub.id,
        title: pub.title?.rendered || '',
        slug: pub.slug,
        date: pub.date,
        content: pub.content?.rendered || '',
        excerpt: stripHtml(pub.excerpt?.rendered || ''),
        image: getFeaturedImage(pub),
        meta: pub.meta,
      }
    })
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

/** GET /api/actualites — proxy to WP posts */
api.get('/actualites', async (c) => {
  try {
    const count = parseInt(c.req.query('limit') || '20')
    const posts = await getPosts(count)
    const mapped = posts.map((post: WPPost) => ({
      id: post.id,
      title: post.title?.rendered || '',
      slug: post.slug,
      date: post.date,
      date_formatted: formatDate(post.date),
      excerpt: stripHtml(post.excerpt?.rendered || ''),
      image: getFeaturedImage(post),
      categories: getTerms(post, 0),
    }))
    return c.json({ actualites: mapped, total: mapped.length, source: 'wordpress' })
  } catch (e: any) {
    return c.json({ actualites: [], total: 0, error: e.message }, 500)
  }
})

/** GET /api/actualites/:slug */
api.get('/actualites/:slug', async (c) => {
  try {
    const slug = c.req.param('slug')
    const post = await getPostBySlug(slug)
    if (!post) return c.json({ error: 'Not found' }, 404)
    return c.json({
      actualite: {
        id: post.id,
        title: post.title?.rendered || '',
        slug: post.slug,
        date: post.date,
        date_formatted: formatDate(post.date),
        content: post.content?.rendered || '',
        excerpt: stripHtml(post.excerpt?.rendered || ''),
        image: getFeaturedImage(post),
      }
    })
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

/** GET /api/dashboards — proxy to WP dashboard CPT */
api.get('/dashboards', async (c) => {
  try {
    const dashboards = await getDashboards(10)
    const mapped = dashboards.map((d: WPPost) => ({
      id: d.id,
      title: d.title?.rendered || '',
      slug: d.slug,
      content: d.content?.rendered || '',
      meta: d.meta,
    }))
    return c.json({ dashboards: mapped, source: 'wordpress' })
  } catch (e: any) {
    return c.json({ dashboards: [], error: e.message }, 500)
  }
})

/** GET /api/datasets — proxy to WP dataset CPT */
api.get('/datasets', async (c) => {
  try {
    const datasets = await getDatasets(20)
    const mapped = datasets.map((ds: WPPost) => ({
      id: ds.id,
      title: ds.title?.rendered || '',
      slug: ds.slug,
      date: ds.date,
      year: new Date(ds.date).getFullYear(),
      excerpt: stripHtml(ds.excerpt?.rendered || ''),
      meta: ds.meta,
    }))
    return c.json({ datasets: mapped, total: mapped.length, source: 'wordpress' })
  } catch (e: any) {
    return c.json({ datasets: [], total: 0, error: e.message }, 500)
  }
})

/** GET /api/taxonomies — publication types and sectors */
api.get('/taxonomies', async (c) => {
  try {
    const [types, sectors, categories] = await Promise.all([
      getPublicationTypes(),
      getSectors(),
      getCategories(),
    ])
    return c.json({ publication_types: types, sectors, categories, source: 'wordpress' })
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

/** GET /api/search — search across WP content */
api.get('/search', async (c) => {
  const q = c.req.query('q') || ''
  if (q.length < 2) return c.json({ results: [] })

  try {
    const wpUrl = getWpUrl()
    // Use WP REST API search endpoint
    const res = await fetch(`${wpUrl}/wp-json/wp/v2/search?search=${encodeURIComponent(q)}&per_page=10`, {
      headers: { 'Accept': 'application/json' },
    })
    
    if (!res.ok) {
      return c.json({ results: [] })
    }

    const items = await res.json() as Array<{ id: number; title: string; url: string; type: string; subtype: string }>
    
    const results = items.map(item => {
      let url = '/'
      if (item.subtype === 'post') url = `/actualites/${item.url.split('/').filter(Boolean).pop()}`
      else if (item.subtype === 'publication') url = `/publications/${item.url.split('/').filter(Boolean).pop()}`
      else if (item.subtype === 'page') url = `/${item.url.split('/').filter(Boolean).pop()}`
      else url = item.url

      return {
        title: item.title,
        url,
        type: item.subtype === 'post' ? 'Actualité' 
            : item.subtype === 'publication' ? 'Publication'
            : item.subtype === 'page' ? 'Page'
            : item.subtype || item.type,
      }
    })

    return c.json({ results })
  } catch (e: any) {
    return c.json({ results: [], error: e.message })
  }
})

/** GET /api/stats — summary counts */
api.get('/stats', async (c) => {
  try {
    const wpUrl = getWpUrl()
    // Fetch counts from WP by requesting 1 item and reading X-WP-Total header
    const [pubRes, postRes, datasetRes] = await Promise.all([
      fetch(`${wpUrl}/wp-json/wp/v2/publication?per_page=1`),
      fetch(`${wpUrl}/wp-json/wp/v2/posts?per_page=1`),
      fetch(`${wpUrl}/wp-json/wp/v2/dataset?per_page=1`),
    ])

    return c.json({
      publications: parseInt(pubRes.headers.get('X-WP-Total') || '0'),
      actualites: parseInt(postRes.headers.get('X-WP-Total') || '0'),
      datasets: parseInt(datasetRes.headers.get('X-WP-Total') || '0'),
      source: 'wordpress',
    })
  } catch (e: any) {
    return c.json({ publications: 0, actualites: 0, datasets: 0, error: e.message })
  }
})

/** POST /api/contact — receive contact form (stores in WP or sends email) */
api.post('/contact', async (c) => {
  try {
    const { name, email, organization, subject, message } = await c.req.json()
    if (!name || !email || !message) {
      return c.json({ error: 'Nom, email et message sont obligatoires' }, 400)
    }
    
    // For now, log the contact and return success
    // In production, integrate with WP Contact Form 7 REST API or email service
    console.log(`[CONTACT] ${name} <${email}> — ${subject || 'N/A'}: ${message.substring(0, 100)}`)
    
    return c.json({ success: true, message: 'Message reçu avec succès' })
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

/** GET /api/wp-info — WordPress connection info */
api.get('/wp-info', (c) => {
  return c.json({
    wordpress_url: getWpUrl(),
    architecture: 'headless',
    frontend: 'Hono + Cloudflare Pages',
    cms: 'WordPress REST API',
    cache_ttl: '60s',
  })
})

// ===============================
// TRADE DATA API (WITS / WORLD BANK)
// ===============================

/** GET /api/trade/overview — current year trade overview */
api.get('/trade/overview', async (c) => {
  try {
    const year = parseInt(c.req.query('year') || '') || await getLatestAvailableYear()
    const overview = await getTradeOverview(year)
    if (!overview) return c.json({ error: 'No data available' }, 404)
    return c.json({
      ...overview,
      totalExports_millions: Math.round(overview.totalExports / 1000),
      totalImports_millions: Math.round(overview.totalImports / 1000),
      tradeBalance_millions: Math.round(overview.tradeBalance / 1000),
      unit: 'US$ thousands (raw) / US$ millions (formatted)',
      source: 'WITS - World Bank',
    })
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

/** GET /api/trade/timeseries — trade evolution over years */
api.get('/trade/timeseries', async (c) => {
  try {
    const start = parseInt(c.req.query('start') || '2013')
    const end = parseInt(c.req.query('end') || '') || await getLatestAvailableYear()
    const ts = await getTradeTimeSeries(start, end)
    return c.json({ ...ts, unit: 'US$ millions', source: 'WITS - World Bank' })
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

/** GET /api/trade/sectors — trade by product sector */
api.get('/trade/sectors', async (c) => {
  try {
    const year = parseInt(c.req.query('year') || '') || await getLatestAvailableYear()
    const sectors = await getTradeBySector(year)
    return c.json({ year, sectors, unit: 'US$ millions', source: 'WITS - World Bank' })
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

/** GET /api/trade/partners/exports — top export destinations */
api.get('/trade/partners/exports', async (c) => {
  try {
    const year = parseInt(c.req.query('year') || '') || await getLatestAvailableYear()
    const limit = parseInt(c.req.query('limit') || '10')
    const partners = await getTopPartners(year, 'XPRT-TRD-VL', limit)
    return c.json({ year, partners, unit: 'US$ millions', source: 'WITS - World Bank' })
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

/** GET /api/trade/partners/imports — top import origins */
api.get('/trade/partners/imports', async (c) => {
  try {
    const year = parseInt(c.req.query('year') || '') || await getLatestAvailableYear()
    const limit = parseInt(c.req.query('limit') || '10')
    const partners = await getTopPartners(year, 'MPRT-TRD-VL', limit)
    return c.json({ year, partners, unit: 'US$ millions', source: 'WITS - World Bank' })
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

/** GET /api/trade/dashboard — complete dashboard data */
api.get('/trade/dashboard', async (c) => {
  try {
    const data = await getTradeDashboardData()
    return c.json(data)
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

/** GET /api/comtrade/releases — latest public Comtrade releases */
api.get('/comtrade/releases', async (c) => {
  try {
    const releases = await getComtradeReleases()
    return c.json({
      latestReleaseYear: parseLatestYearFromReleases(releases),
      count: releases?.count || 0,
      data: releases?.data || [],
      source: 'UN Comtrade public releases',
    })
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

// ===============================
// ANSD DATA ENDPOINTS
// ===============================

/** GET /api/ansd/macro-indicators — Senegal macro economic indicators */
api.get('/ansd/macro-indicators', async (c) => {
  try {
    const indicators = await getMacroIndicators(getAnsdFetchOptions(c))
    return c.json({ indicators, source: 'ANSD (Senegal)' })
  } catch (e: any) {
    return c.json({ indicators: [], error: e.message }, 500)
  }
})

/** GET /api/ansd/industrial-index — Industrial Production Index */
api.get('/ansd/industrial-index', async (c) => {
  try {
    const year = c.req.query('year') ? parseInt(c.req.query('year')!) : undefined
    const sector = c.req.query('sector')
    const data = await getIndustrialIndex(year, sector, getAnsdFetchOptions(c))
    return c.json({ 
      data, 
      unit: 'Index (2015=100)',
      source: 'ANSD - Industrial Statistics'
    })
  } catch (e: any) {
    return c.json({ data: [], error: e.message }, 500)
  }
})

/** GET /api/ansd/inflation — Consumer Price Index */
api.get('/ansd/inflation', async (c) => {
  try {
    const months = parseInt(c.req.query('months') || '12')
    const data = await getConsumerPriceIndex(months, getAnsdFetchOptions(c))
    return c.json({ 
      data, 
      unit: 'Index (year average=100)',
      source: 'ANSD - Price Statistics'
    })
  } catch (e: any) {
    return c.json({ data: [], error: e.message }, 500)
  }
})

/** GET /api/ansd/employment — Employment Statistics */
api.get('/ansd/employment', async (c) => {
  try {
    const sector = c.req.query('sector')
    const data = await getEmploymentStats(sector, getAnsdFetchOptions(c))
    return c.json({ 
      data, 
      source: 'ANSD - Labor Statistics'
    })
  } catch (e: any) {
    return c.json({ data: [], error: e.message }, 500)
  }
})

// ===============================
// WORLD BANK INDICATORS
// ===============================

/** GET /api/worldbank/country — Senegal country info */
api.get('/worldbank/country', async (c) => {
  try {
    const country = await getCountryInfo()
    return c.json({ country, source: 'World Bank' })
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

/** GET /api/worldbank/indicators — World Bank development indicators */
api.get('/worldbank/indicators', async (c) => {
  try {
    const year = c.req.query('year') ? parseInt(c.req.query('year')!) : undefined
    const indicators = await getWBIndicators(year)
    return c.json({ 
      indicators, 
      year: year || 'latest',
      source: 'World Bank'
    })
  } catch (e: any) {
    return c.json({ indicators: [], error: e.message }, 500)
  }
})

/** GET /api/worldbank/indicator/:code — Specific indicator time series */
api.get('/worldbank/indicator/:code', async (c) => {
  try {
    const code = c.req.param('code')
    const startYear = parseInt(c.req.query('startYear') || '2015')
    const endYear = parseInt(c.req.query('endYear') || '2025')
    
    const timeSeries = await getWBTimeSeries(code, startYear, endYear)
    return c.json({ 
      code,
      timeSeries,
      period: `${startYear}-${endYear}`,
      source: 'World Bank'
    })
  } catch (e: any) {
    return c.json({ timeSeries: [], error: e.message }, 500)
  }
})

// ===============================
// MINISTRY DATA ENDPOINTS
// ===============================

/** GET /api/ministry/commerce — Commerce data (foreign & domestic) */
api.get('/ministry/commerce', async (c) => {
  try {
    const type = (c.req.query('type') || 'foreign') as 'domestic' | 'foreign'
    const data = await getCommerceData(type)
    return c.json({ 
      commerce: data, 
      source: 'Ministry of Commerce'
    })
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

/** GET /api/ministry/industry — Industry & SME data */
api.get('/ministry/industry', async (c) => {
  try {
    const data = await getIndustryData()
    return c.json({ 
      industry: data,
      source: 'Ministry of Industry & SMEs'
    })
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})


/** GET /api/ministry/sector/:sector — Sector-specific ministry data */
api.get('/ministry/sector/:sector', async (c) => {
  try {
    const sector = c.req.param('sector')
    const data = await getSectorSpecificData(sector)
    
    if (!data) {
      return c.json({ error: `Unknown sector: ${sector}` }, 404)
    }
    
    return c.json({ 
      sector,
      data,
      source: 'Senegal Government Ministries'
    })
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})


// ===============================
// UNIDO DATA ENDPOINTS
// ===============================

/** GET /api/unido/dataset/:name — metadata for given database */
api.get('/unido/dataset/:name', async (c) => {
  try {
    const name = c.req.param('name')
    const info = await getDatasetInfo(name)
    return c.json({ info, source: 'UNIDO' })
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

/** GET /api/unido/datasets — supported UNIDO dataset aliases */
api.get('/unido/datasets', async (c) => {
  return c.json({
    datasets: UNIDO_DATASET_PATHS,
    source: 'UNIDO',
  })
})

/** POST /api/unido/dataWithoutActivities */
api.post('/unido/dataWithoutActivities', async (c) => {
  try {
    const body = await c.req.json()
    const data = await getDataWithoutActivities(body)
    return c.json({ data, source: 'UNIDO' })
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

/** POST /api/unido/dataWithActivities */
api.post('/unido/dataWithActivities', async (c) => {
  try {
    const body = await c.req.json()
    const data = await getDataWithActivities(body)
    return c.json({ data, source: 'UNIDO' })
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

/** GET /api/unido/dashboard — normalized payload for dashboards */
api.get('/unido/dashboard', async (c) => {
  try {
    const dataset = c.req.query('dataset') || 'CIP'
    const country = c.req.query('country') || 'SEN'
    const variableCode = c.req.query('variableCode') || undefined
    const variableCodes = (c.req.query('variableCodes') || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    const activityCodes = (c.req.query('activityCodes') || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    const periods = (c.req.query('periods') || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    const fullPrecision = (c.req.query('fullPrecision') || 'true').toLowerCase() !== 'false'

    const data = await getUNIDODashboardData({
      dataset,
      country,
      variableCode,
      variableCodes: variableCodes.length ? variableCodes : undefined,
      activityCodes: activityCodes.length ? activityCodes : undefined,
      periods: periods.length ? periods : undefined,
      fullPrecision,
    })

    return c.json(data)
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

/** GET /api/unido/legacy/ihpi — proxy to UNIDO legacy /api/2.0/data */
api.get('/unido/legacy/ihpi', async (c) => {
  try {
    const datasetId = c.req.query('datasetId') || 'niofshc'
    const indices = c.req.query('indices') || 'C1,05-39'
    const ihpiCodes = c.req.query('ippi-ihpi') || c.req.query('ihpiCodes') || 'I2'
    const data = await getLegacyIhpiData({ datasetId, indices, ihpiCodes })
    return c.json({
      datasetId,
      indices: String(indices).split(',').map((s) => s.trim()).filter(Boolean),
      ihpiCodes: String(ihpiCodes).split(',').map((s) => s.trim()).filter(Boolean),
      data,
      source: 'UNIDO legacy API 2.0',
    })
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

/** GET /api/unido/legacy/dashboard — normalized payload for dashboards */
api.get('/unido/legacy/dashboard', async (c) => {
  try {
    const datasetId = c.req.query('datasetId') || 'niofshc'
    const indices = c.req.query('indices') || 'C1,05-39'
    const ihpiCodes = c.req.query('ippi-ihpi') || c.req.query('ihpiCodes') || 'I2'
    const data = await getLegacyIhpiDashboardData({ datasetId, indices, ihpiCodes })
    return c.json(data)
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

// ===============================
// IMF DATA ENDPOINTS
// ===============================

/** GET /api/imf/cpi — Senegal CPI series from IMF SDMX */
api.get('/imf/cpi', async (c) => {
  try {
    const startPeriod = c.req.query('startPeriod') || '2015-M01'
    const series = await getSenegalCpiSeries(startPeriod)
    return c.json({
      country: 'SEN',
      dataset: 'CPI',
      series,
      source: 'IMF SDMX 2.1',
    })
  } catch (e: any) {
    return c.json({ series: [], error: e.message }, 500)
  }
})

/** POST /api/unido/parse-html-snippet */
api.post('/unido/parse-html-snippet', async (c) => {
  try {
    const body = await c.req.json()
    const htmlSnippet = String(body?.htmlSnippet || body?.html || '')
    if (!htmlSnippet.trim()) {
      return c.json({ error: 'htmlSnippet is required' }, 400)
    }
    const data = parseHtmlSnippetForData(htmlSnippet)
    return c.json({ data, source: 'HTML snippet parser' })
  } catch (e: any) {
    return c.json({ error: e.message }, 400)
  }
})

// ===============================
// PME/PMI GOOGLE SHEETS DATA
// ===============================

/** GET /api/pme-pmi — PME/PMI dashboard data from Google Sheets */
api.get('/pme-pmi', async (c) => {
  try {
    const data = await fetchPmePmiData()
    return c.json(data)
  } catch (error) {
    console.error('[PME-PMI] Error fetching data:', error)
    return c.json({ error: 'Failed to fetch PME/PMI data' }, 500)
  }
})

export { api as apiRoutes }
