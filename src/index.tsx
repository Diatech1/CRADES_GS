import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { homePage } from './pages/home'
import { aboutPage } from './pages/about'
import { publicationsPage } from './pages/publications'
import { actualitesPage } from './pages/actualites'
import { contactPage } from './pages/contact'
import { commerceExterieurPage } from './pages/commerce-exterieur'
import { commerceInterieurPage } from './pages/commerce-interieur'
import { industriePage } from './pages/industrie'
import { pmePmiPage } from './pages/pme-pmi'
import { apiRoutes } from './api/routes'

const app = new Hono()

// CORS for API routes
app.use('/api/*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

// ---- API routes ----
app.route('/api', apiRoutes)

// ---- Menu pages ----
app.get('/', (c) => c.html(homePage()))
app.get('/a-propos', (c) => c.html(aboutPage()))
app.get('/publications', (c) => c.html(publicationsPage()))
app.get('/actualites', (c) => c.html(actualitesPage()))
app.get('/contact', (c) => c.html(contactPage()))

// ---- Dashboard pages ----
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

export default app
