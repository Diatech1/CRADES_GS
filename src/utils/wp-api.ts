/**
 * WordPress REST API Client for Headless CRADES
 * Fetches data from WordPress CMS and transforms it for the Hono front-end
 */

const WP_URL = 'https://flowlevel.s5-tastewp.com'
const API_BASE = `${WP_URL}/wp-json/wp/v2`

// Cache in-memory (edge worker — resets on cold start, lasts ~30s to few minutes)
const cache = new Map<string, { data: any; expires: number }>()
const CACHE_TTL = 60_000 // 60 seconds

async function wpFetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const qs = new URLSearchParams(params).toString()
  const url = `${API_BASE}/${endpoint}${qs ? '?' + qs : ''}`

  // Check cache
  const cached = cache.get(url)
  if (cached && cached.expires > Date.now()) {
    return cached.data as T
  }

  try {
    const res = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      redirect: 'follow',
    })

    if (!res.ok) {
      console.error(`WP API error: ${res.status} ${url}`)
      return [] as unknown as T
    }

    // Verify content-type is JSON before parsing
    const ct = res.headers.get('content-type') || ''
    if (!ct.includes('json')) {
      console.error(`WP API returned non-JSON (${ct}) for ${url}`)
      return [] as unknown as T
    }

    const data = await res.json() as T
    cache.set(url, { data, expires: Date.now() + CACHE_TTL })
    return data
  } catch (e) {
    console.error(`WP API fetch failed: ${e} for ${url}`)
    return [] as unknown as T
  }
}

// ---- Types ----

export interface WPPost {
  id: number
  date: string
  slug: string
  title: { rendered: string }
  content: { rendered: string }
  excerpt: { rendered: string }
  featured_media: number
  categories: number[]
  tags: number[]
  meta: Record<string, any>
  _embedded?: {
    'wp:featuredmedia'?: Array<{ source_url: string; alt_text: string }>
    'wp:term'?: Array<Array<{ id: number; name: string; slug: string }>>
  }
}

export interface WPPage {
  id: number
  slug: string
  title: { rendered: string }
  content: { rendered: string }
  excerpt: { rendered: string }
}

export interface WPMedia {
  id: number
  source_url: string
  alt_text: string
  media_details: {
    width: number
    height: number
    sizes: Record<string, { source_url: string; width: number; height: number }>
  }
}

export interface WPTerm {
  id: number
  name: string
  slug: string
  count: number
}

// ---- Public API functions ----

/** Fetch posts (actualités/news) */
export async function getPosts(count = 10): Promise<WPPost[]> {
  return wpFetch<WPPost[]>('posts', {
    per_page: String(count),
    orderby: 'date',
    order: 'desc',
    _embed: 'true',
  })
}

/** Fetch a single post by slug */
export async function getPostBySlug(slug: string): Promise<WPPost | null> {
  const posts = await wpFetch<WPPost[]>('posts', {
    slug,
    _embed: 'true',
  })
  return posts.length > 0 ? posts[0] : null
}

/** Fetch pages */
export async function getPages(count = 20): Promise<WPPage[]> {
  return wpFetch<WPPage[]>('pages', {
    per_page: String(count),
    orderby: 'menu_order',
    order: 'asc',
  })
}

/** Fetch a single page by slug */
export async function getPageBySlug(slug: string): Promise<WPPage | null> {
  const pages = await wpFetch<WPPage[]>('pages', { slug })
  return pages.length > 0 ? pages[0] : null
}

/** Fetch a single page by ID */
export async function getPageById(id: number): Promise<WPPage | null> {
  try {
    return await wpFetch<WPPage>(`pages/${id}`)
  } catch {
    return null
  }
}

/** Fetch publications (CPT) */
export async function getPublications(count = 12, params: Record<string, string> = {}): Promise<WPPost[]> {
  return wpFetch<WPPost[]>('publication', {
    per_page: String(count),
    orderby: 'date',
    order: 'desc',
    _embed: 'true',
    ...params,
  })
}

/** Fetch a single publication by slug */
export async function getPublicationBySlug(slug: string): Promise<WPPost | null> {
  const items = await wpFetch<WPPost[]>('publication', {
    slug,
    _embed: 'true',
  })
  return items.length > 0 ? items[0] : null
}

/** Fetch indicateurs (CPT) */
export async function getIndicateurs(count = 10): Promise<WPPost[]> {
  return wpFetch<WPPost[]>('indicateur', {
    per_page: String(count),
    orderby: 'date',
    order: 'asc',
  })
}

/** Fetch commerce indicateurs (CPT with 'commerce' tag) */
export async function getCommerceIndicateurs(count = 10): Promise<WPPost[]> {
  return wpFetch<WPPost[]>('indicateur', {
    per_page: String(count),
    orderby: 'date',
    order: 'asc',
    tags: '5', // commerce tag ID
  })
}

/** Fetch dashboards (CPT) */
export async function getDashboards(count = 10): Promise<WPPost[]> {
  return wpFetch<WPPost[]>('dashboard', {
    per_page: String(count),
    orderby: 'date',
    order: 'asc',
  })
}

/** Fetch datasets (CPT) */
export async function getDatasets(count = 20): Promise<WPPost[]> {
  return wpFetch<WPPost[]>('dataset', {
    per_page: String(count),
    orderby: 'date',
    order: 'desc',
    _embed: 'true',
  })
}

/** Fetch categories */
export async function getCategories(): Promise<WPTerm[]> {
  return wpFetch<WPTerm[]>('categories', { per_page: '50' })
}

/** Fetch publication_type taxonomy */
export async function getPublicationTypes(): Promise<WPTerm[]> {
  return wpFetch<WPTerm[]>('publication_type', { per_page: '50' })
}

/** Fetch sector taxonomy */
export async function getSectors(): Promise<WPTerm[]> {
  return wpFetch<WPTerm[]>('sector', { per_page: '50' })
}

/** Fetch media by ID */
export async function getMedia(id: number): Promise<WPMedia | null> {
  if (!id) return null
  try {
    return await wpFetch<WPMedia>(`media/${id}`)
  } catch {
    return null
  }
}

// ---- Helper functions ----

/** Strip HTML tags from a string */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim()
}

/** Get featured image URL from embedded post data */
export function getFeaturedImage(post: WPPost): string | null {
  if (post._embedded?.['wp:featuredmedia']?.[0]) {
    return post._embedded['wp:featuredmedia'][0].source_url
  }
  return null
}

/** Get taxonomy terms from embedded post data */
export function getTerms(post: WPPost, index = 0): Array<{ name: string; slug: string }> {
  if (post._embedded?.['wp:term']?.[index]) {
    return post._embedded['wp:term'][index]
  }
  return []
}

/** Format a WordPress date string for display */
export function formatDate(dateStr: string, locale = 'fr-FR'): string {
  try {
    return new Date(dateStr).toLocaleDateString(locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

/** Get the WordPress admin URL */
export function getWpAdminUrl(): string {
  return `${WP_URL}/wp-admin/`
}

/** Get the WordPress CMS URL */
export function getWpUrl(): string {
  return WP_URL
}
