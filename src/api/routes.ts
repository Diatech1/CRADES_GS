import { Hono } from 'hono'
import { fetchPmeData } from '../utils/pme-sheets-api'
import { fetchCommerceInterieurData } from '../utils/commerce-interieur-sheets-api'
import { fetchCommerceExterieurData } from '../utils/commerce-exterieur-sheets-api'
import { fetchIndustryData } from '../utils/industry-sheets-api'

const api = new Hono()

/* ---------- Dashboard data endpoints ---------- */

api.get('/pme-pmi', async (c) => {
  try {
    const data = await fetchPmeData()
    return c.json(data)
  } catch (e) {
    return c.json({ error: 'Failed to fetch PME/PMI data' }, 500)
  }
})

api.get('/commerce-interieur', async (c) => {
  try {
    const data = await fetchCommerceInterieurData()
    return c.json(data)
  } catch (e) {
    return c.json({ error: 'Failed to fetch Commerce Interieur data' }, 500)
  }
})

api.get('/commerce-exterieur', async (c) => {
  try {
    const data = await fetchCommerceExterieurData()
    return c.json(data)
  } catch (e) {
    return c.json({ error: 'Failed to fetch Commerce Exterieur data' }, 500)
  }
})

api.get('/industrie', async (c) => {
  try {
    const data = await fetchIndustryData()
    return c.json(data)
  } catch (e) {
    return c.json({ error: 'Failed to fetch Industry data' }, 500)
  }
})

export { api as apiRoutes }
