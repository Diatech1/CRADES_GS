import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { homePage } from './pages/home'
import { aboutPage } from './pages/about'
import { publicationsPage } from './pages/publications'
import { publicationDetailPage } from './pages/publication-detail'
import { dashboardsPage } from './pages/dashboards'
import { dataPage } from './pages/data'
import { actualitesPage } from './pages/actualites'
import { actualiteDetailPage } from './pages/actualite-detail'
import { contactPage } from './pages/contact'
import { dash2Page } from './pages/dash2'
import { commerceExterieurPage } from './pages/commerce-exterieur'
import { commerceInterieurPage } from './pages/commerce-interieur'
import { industriePage } from './pages/industrie'
import { pmePmiPage } from './pages/pme-pmi'
import { prototypeGensparkPage } from './pages/prototype-genspark'
import { prototypeGensparkSplitPage } from './pages/prototype-genspark-split'
import { adminRedirectPage } from './pages/admin'
import { apiRoutes } from './api/routes'
import { schemaOrg } from './utils/seo'
import { sitemapXml } from './utils/sitemap'
import { getWpAdminUrl } from './utils/wp-api'

const app = new Hono()

// CORS for API routes
app.use('/api/*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

// ---- API routes (WordPress proxy) ----
app.route('/api', apiRoutes)

// ---- Page routes (WordPress Headless SSR) ----

app.get('/', async (c) => {
  return c.html(await homePage())
})

app.get('/a-propos', async (c) => {
  return c.html(await aboutPage())
})

app.get('/publications', async (c) => {
  return c.html(await publicationsPage(c.req.query()))
})

app.get('/publications/:slug', async (c) => {
  return c.html(await publicationDetailPage(c.req.param('slug')))
})

app.get('/tableaux-de-bord', async (c) => {
  return c.html(await dashboardsPage())
})

app.get('/donnees', async (c) => {
  return c.html(await dataPage())
})

app.get('/dash2', async (c) => {
  return c.html(await dash2Page())
})

app.get('/commerce-exterieur', async (c) => {
  return c.html(await commerceExterieurPage())
})

app.get('/commerce-interieur', async (c) => {
  return c.html(await commerceInterieurPage())
})

app.get('/industrie', async (c) => {
  return c.html(await industriePage())
})

app.get('/pme-pmi', async (c) => {
  return c.html(await pmePmiPage())
})

app.get('/prototype-genspark', async (c) => {
  return c.html(await prototypeGensparkPage())
})

app.get('/prototype/commerce-exterieur', async (c) => {
  return c.html(await prototypeGensparkSplitPage('commerce-exterieur'))
})

app.get('/prototype/commerce-interieur', async (c) => {
  return c.html(await prototypeGensparkSplitPage('commerce-interieur'))
})

app.get('/prototype/industrie', async (c) => {
  return c.html(await prototypeGensparkSplitPage('industrie'))
})

app.get('/prototype/pme-pmi', async (c) => {
  return c.html(await prototypeGensparkSplitPage('pme'))
})

app.get('/actualites', async (c) => {
  return c.html(await actualitesPage())
})

app.get('/actualites/:slug', async (c) => {
  return c.html(await actualiteDetailPage(c.req.param('slug')))
})

app.get('/contact', async (c) => {
  return c.html(await contactPage())
})

// ---- Utility routes ----

// Schema.org JSON-LD
app.get('/schema.json', (c) => {
  return c.json(schemaOrg())
})

// Sitemap XML
app.get('/sitemap.xml', async (c) => {
  const xml = await sitemapXml()
  return c.text(xml, 200, { 'Content-Type': 'application/xml' })
})

// Admin — redirect page with WordPress shortcuts
app.get('/admin', (c) => {
  return c.html(adminRedirectPage())
})
app.get('/admin/*', (c) => {
  return c.redirect(getWpAdminUrl())
})

export default app
