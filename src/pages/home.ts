import { layout } from '../components/layout'
import { getPosts, getPublications, getIndicateurs, getCommerceIndicateurs, getDashboards, stripHtml, formatDate, WPPost } from '../utils/wp-api'

export async function homePage(): Promise<string> {
  // Fetch ALL data from WordPress REST API in parallel
  const [indicateurs, commerceIndicateurs, dashboards, publications, actualites] = await Promise.all([
    getIndicateurs(8),
    getCommerceIndicateurs(4),
    getDashboards(4),
    getPublications(4),
    getPosts(3),
  ])

  // Filter indicators that have a value filled in
  const validIndicateurs = indicateurs.filter((ind: WPPost) => {
    const val = ind.meta?.indicateur_value
    return val && val.toString().trim() !== ''
  })

  // Build chart configs ONLY from WP dashboard meta — no fallback
  const defaultColors = ['#044bad', '#b8943e', '#3a7fd4', '#032d6b']
  const chartConfigs = dashboards
    .map((d: WPPost, i: number) => {
      let chartData = null
      try {
        const raw = d.meta?.dashboard_chart_data
        if (raw) chartData = typeof raw === 'string' ? JSON.parse(raw) : raw
      } catch (e) { /* invalid JSON */ }

      // Skip dashboards without chart data
      if (!chartData || !chartData.data || !chartData.data.length) return null

      return {
        id: `home-chart-${d.slug || d.id}`,
        slug: d.slug || d.id,
        title: d.title?.rendered || '',
        label: chartData.label || d.title?.rendered || '',
        data: chartData.data,
        labels: chartData.labels || [],
        type: chartData.type || 'line',
        color: d.meta?.dashboard_chart_color || defaultColors[i % 4],
      }
    })
    .filter(Boolean)

  const content = `
<!-- Hero -->
<section class="relative overflow-hidden bg-brand-frost">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 py-16 lg:py-20 ${validIndicateurs.length > 0 ? 'pb-28 lg:pb-32' : ''}">
    <div class="max-w-xl">
      <h1 class="font-display font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-brand-navy leading-tight">
        Centre de Recherche,<br>d'Analyse&nbsp;des&nbsp;Échanges et&nbsp;Statistiques
      </h1>
      <p class="text-gray-600 mt-5 text-sm leading-relaxed">
        Le CRADES produit et diffuse les statistiques, études et analyses stratégiques sur l'industrie et le commerce du Sénégal.
      </p>
      <div class="flex flex-wrap gap-4 mt-10">
        <a href="/publications" class="text-sm font-medium bg-brand-blue text-white px-5 py-2.5 rounded-lg hover:bg-brand-navy transition-colors shadow-sm">
          Publications
        </a>
        <a href="/donnees" class="text-sm font-medium bg-white text-brand-navy px-5 py-2.5 rounded-lg hover:bg-white/80 transition-colors border border-brand-ice shadow-sm">
          Données ouvertes
        </a>
      </div>
    </div>
  </div>

  ${validIndicateurs.length > 0 ? `
  <!-- Key stats strip — dynamic from WordPress indicateurs -->
  <div class="absolute bottom-0 inset-x-0 bg-brand-navy/90">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 py-4">
      <div class="grid grid-cols-2 sm:grid-cols-${Math.min(validIndicateurs.length, 4)} gap-4 text-center">
        ${validIndicateurs.slice(0, 4).map((ind: WPPost) => {
          const val = ind.meta?.indicateur_value || ''
          const unit = ind.meta?.indicateur_unit || ''
          const name = ind.title?.rendered || ''
          const dir = ind.meta?.indicateur_change_direction
          const pct = ind.meta?.indicateur_change_percent
          return `
          <div>
            <div class="text-lg sm:text-xl font-bold text-white">${val}<span class="text-xs font-normal text-white/70 ml-1">${unit}</span></div>
            <div class="text-[11px] text-white/50 mt-0.5">${name}</div>
            ${pct ? `<div class="text-[10px] mt-0.5 ${dir === 'up' ? 'text-emerald-400' : 'text-red-400'}">${dir === 'up' ? '↑' : '↓'} ${Math.abs(pct)}%</div>` : ''}
          </div>`
        }).join('')}
      </div>
    </div>
  </div>
  ` : ''}
</section>

<!-- Commerce International KPI Section -->
${commerceIndicateurs.length > 0 ? `
<section class="py-16 bg-white border-b border-gray-100">
  <div class="max-w-6xl mx-auto px-4 sm:px-6">
    <div class="flex items-center justify-between mb-10">
      <h2 class="font-display text-xl text-gray-800">Commerce International</h2>
      <a href="/commerce-exterieur" class="text-xs text-brand-gold hover:underline">Voir détails &rarr;</a>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      ${commerceIndicateurs.map((ind: WPPost) => {
        const val = ind.meta?.indicateur_value || ''
        const unit = ind.meta?.indicateur_unit || ''
        const name = ind.title?.rendered || ''
        const dir = ind.meta?.indicateur_change_direction
        const pct = ind.meta?.indicateur_change_percent
        const isNegative = val && val.toString().startsWith('-')
        return `
        <div class="bg-brand-frost rounded-lg p-6 border border-brand-ice/60 text-center">
          <div class="text-4xl font-bold ${isNegative ? 'text-red-600' : 'text-brand-blue'} leading-tight">${val}</div>
          ${unit ? `<div class="text-xs text-gray-500 mt-1">${unit}</div>` : ''}
          <div class="text-sm font-medium text-gray-800 mt-4">${name}</div>
          ${pct ? `<div class="text-xs mt-2 ${dir === 'up' ? 'text-emerald-600' : 'text-red-600'}">${dir === 'up' ? '↑' : '↓'} ${Math.abs(pct)}%</div>` : ''}
        </div>`
      }).join('')}
    </div>
  </div>
</section>
` : ''}

${chartConfigs.length > 0 ? `
<!-- KPI Cards Section -->
<section class="py-16 bg-brand-frost border-b border-brand-ice/50">
  <div class="max-w-6xl mx-auto px-4 sm:px-6">
    <div class="flex items-center justify-between mb-10">
      <h2 class="font-display text-xl text-gray-800">Indicateurs clés</h2>
      <a href="/tableaux-de-bord" class="text-xs text-brand-gold hover:underline">Voir tout &rarr;</a>
    </div>
    ${validIndicateurs.length > 0 ? `
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      ${validIndicateurs.slice(0, 4).map((ind: WPPost) => {
        const val = ind.meta?.indicateur_value || ''
        const unit = ind.meta?.indicateur_unit || ''
        const name = ind.title?.rendered || ''
        const dir = ind.meta?.indicateur_change_direction
        const pct = ind.meta?.indicateur_change_percent
        const isNegative = val && val.toString().startsWith('-')
        return `
        <div class="bg-white rounded-lg p-6 border border-brand-ice/60 text-center">
          <div class="text-4xl font-bold ${isNegative ? 'text-red-600' : 'text-brand-blue'} leading-tight">${val}</div>
          ${unit ? `<div class="text-xs text-gray-500 mt-1">${unit}</div>` : ''}
          <div class="text-sm font-medium text-gray-800 mt-4">${name}</div>
          ${pct ? `<div class="text-xs mt-2 ${dir === 'up' ? 'text-emerald-600' : 'text-red-600'}">${dir === 'up' ? '↑' : '↓'} ${Math.abs(pct)}%</div>` : ''}
        </div>`
      }).join('')}
    </div>
    ` : ''}
  </div>
</section>

<!-- Dashboard charts — dynamic from WordPress dashboards -->
<section class="py-12 border-b border-gray-100">
  <div class="max-w-6xl mx-auto px-4 sm:px-6">
    <div class="flex items-center justify-between mb-8">
      <h2 class="font-display text-xl text-gray-800">Tableaux de bord</h2>
      <a href="/tableaux-de-bord" class="text-xs text-brand-gold hover:underline">Voir tout &rarr;</a>
    </div>
    <div class="grid lg:grid-cols-2 gap-6">
      ${chartConfigs.map((d: any) => `
        <a href="/tableaux-de-bord/${d.slug}" class="block border border-gray-100 rounded-lg p-5 hover:shadow-md transition">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-medium text-gray-800">${d.title}</h3>
          </div>
          <div class="bg-gray-50 rounded-md p-3">
            <canvas id="${d.id}" height="160"></canvas>
          </div>
        </a>
      `).join('')}
    </div>
  </div>
</section>
` : `
<!-- Dashboard charts — fallback section -->
<section class="py-12 border-b border-gray-100">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 text-center py-8">
    <i class="fas fa-chart-area text-3xl mb-3 text-brand-ice"></i>
    <p class="text-sm text-gray-400">Aucun tableau de bord disponible.</p>
    <p class="text-xs text-gray-300 mt-1">Ajoutez des dashboards avec leurs données de graphique depuis <a href="/admin" class="text-brand-blue underline">l'administration</a>.</p>
  </div>
</section>
`}

<!-- Mission -->
<section class="py-14 bg-brand-frost border-b border-brand-ice/50">
  <div class="max-w-6xl mx-auto px-4 sm:px-6">
    <div class="grid md:grid-cols-3 gap-8 text-center">
      <div>
        <div class="w-12 h-12 mx-auto mb-4 rounded-full bg-brand-blue/10 flex items-center justify-center">
          <i class="fas fa-chart-line text-brand-blue text-lg"></i>
        </div>
        <h3 class="font-semibold text-sm text-gray-800 mb-2">Produire des statistiques</h3>
        <p class="text-xs text-gray-500 leading-relaxed">Collecter, traiter et diffuser les données statistiques sur l'industrie et le commerce du Sénégal.</p>
      </div>
      <div>
        <div class="w-12 h-12 mx-auto mb-4 rounded-full bg-brand-blue/10 flex items-center justify-center">
          <i class="fas fa-microscope text-brand-blue text-lg"></i>
        </div>
        <h3 class="font-semibold text-sm text-gray-800 mb-2">Analyser et rechercher</h3>
        <p class="text-xs text-gray-500 leading-relaxed">Mener des études et analyses stratégiques pour éclairer les politiques publiques et les acteurs économiques.</p>
      </div>
      <div>
        <div class="w-12 h-12 mx-auto mb-4 rounded-full bg-brand-blue/10 flex items-center justify-center">
          <i class="fas fa-globe-africa text-brand-blue text-lg"></i>
        </div>
        <h3 class="font-semibold text-sm text-gray-800 mb-2">Accompagner les échanges</h3>
        <p class="text-xs text-gray-500 leading-relaxed">Fournir aux opérateurs économiques et aux institutions les outils nécessaires au développement des échanges commerciaux.</p>
      </div>
    </div>
  </div>
</section>

<!-- Latest publications -->
<section class="py-16">
  <div class="max-w-6xl mx-auto px-4 sm:px-6">
    <div class="flex items-center justify-between mb-8">
      <h2 class="font-display text-xl text-gray-800">Dernières publications</h2>
      <a href="/publications" class="text-xs text-brand-gold hover:underline">Toutes les publications &rarr;</a>
    </div>
    <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
      ${publications.length > 0 ? publications.map((pub: WPPost) => `
        <a href="/publications/${pub.slug}" class="bg-white border border-brand-ice/60 rounded-lg p-5 hover:border-brand-sky/40 hover:shadow-md transition-all group flex flex-col">
          <div class="flex items-center gap-2 mb-3">
            <span class="text-[10px] font-semibold text-white bg-brand-blue px-2 py-0.5 rounded">Publication</span>
            <span class="text-[11px] text-gray-400">${new Date(pub.date).getFullYear()}</span>
          </div>
          <h3 class="text-sm font-semibold text-gray-800 group-hover:text-brand-blue transition-colors line-clamp-2 mb-2">${pub.title?.rendered || ''}</h3>
          <p class="text-xs text-gray-400 line-clamp-2 mb-3 flex-1">${stripHtml(pub.excerpt?.rendered || '')}</p>
          <div class="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
            <span class="text-[11px] text-gray-400"></span>
            <span class="text-xs text-brand-blue font-medium">Lire <i class="fas fa-arrow-right text-[9px] ml-0.5"></i></span>
          </div>
        </a>
      `).join('') : `
        <div class="col-span-4 text-center py-8 text-gray-400 text-sm">
          <i class="fas fa-book-open text-2xl mb-3 text-brand-ice"></i>
          <p>Aucune publication pour le moment.</p>
          <p class="text-xs mt-1">Ajoutez des publications depuis <a href="/admin" class="text-brand-blue underline">WordPress</a>.</p>
        </div>
      `}
    </div>
  </div>
</section>

<!-- Actualités -->
<section class="bg-brand-frost border-y border-brand-ice/50 py-16">
  <div class="max-w-6xl mx-auto px-4 sm:px-6">
    <div class="flex items-center justify-between mb-8">
      <h2 class="font-display text-xl text-gray-800">Actualités</h2>
      <a href="/actualites" class="text-xs text-brand-gold hover:underline">Toutes les actualités &rarr;</a>
    </div>
    <div class="grid md:grid-cols-3 gap-6">
      ${actualites.length > 0 ? actualites.map((actu: WPPost) => `
        <a href="/actualites/${actu.slug}" class="bg-white rounded-lg border border-brand-ice/60 p-5 hover:border-brand-sky/40 hover:shadow-sm transition-all group">
          <span class="text-[11px] text-gray-400">${formatDate(actu.date)}</span>
          <h3 class="text-sm font-medium text-gray-800 mt-2 group-hover:text-brand-blue transition-colors line-clamp-2">${actu.title?.rendered || ''}</h3>
          <p class="text-xs text-gray-400 mt-2 line-clamp-2">${stripHtml(actu.excerpt?.rendered || '')}</p>
        </a>
      `).join('') : `
        <div class="col-span-3 text-center py-8 text-gray-400 text-sm">
          <i class="fas fa-newspaper text-2xl mb-3 text-brand-ice"></i>
          <p>Aucune actualité pour le moment.</p>
          <p class="text-xs mt-1">Ajoutez des articles depuis <a href="/admin" class="text-brand-blue underline">WordPress</a>.</p>
        </div>
      `}
    </div>
  </div>
</section>

<!-- CTA -->
<section class="py-16">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 text-center">
    <h2 class="font-display text-xl text-gray-800">Accédez aux données ouvertes</h2>
    <p class="text-sm text-gray-400 mt-2 max-w-md mx-auto">Téléchargez les jeux de données du CRADES ou intégrez nos indicateurs via l'API publique.</p>
    <div class="flex items-center justify-center gap-3 mt-6">
      <a href="/donnees" class="text-sm font-medium bg-brand-blue text-white px-5 py-2.5 rounded-lg hover:bg-brand-navy transition-colors">Explorer les données</a>
      <a href="/api/indicators" class="text-sm font-medium text-gray-500 border border-gray-200 px-5 py-2.5 rounded-lg hover:border-gray-300 transition-colors">API</a>
    </div>
  </div>
</section>

${chartConfigs.length > 0 ? `
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
document.addEventListener('DOMContentLoaded', () => {
  const cfgs = ${JSON.stringify(chartConfigs)};
  cfgs.forEach(c => {
    const el = document.getElementById(c.id);
    if (!el || !c.data || !c.data.length) return;
    new Chart(el, {
      type: c.type || 'line',
      data: { labels: c.labels, datasets: [{ label: c.label, data: c.data, borderColor: c.color, backgroundColor: c.color + '10', fill: true, tension: .4, pointRadius: 2, borderWidth: 1.5 }] },
      options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: false, grid: { color: '#f1f5f9' }, ticks: { font: { size: 10 } } }, x: { grid: { display: false }, ticks: { font: { size: 10 } } } } }
    });
  });
});
</script>
` : ''}
`
  return layout(content, { 
    title: 'Accueil',
    description: 'CRADES - Institution de référence en données industrielles et commerciales du Sénégal',
    path: '/' 
  })
}
