import { layout } from '../components/layout'

export function actualitesPage(): string {
  const lang = 'fr'

  const news = [
    { title: 'Le CRADES lance ses nouveaux tableaux de bord interactifs', date: '25 mars 2026', desc: 'Des outils de visualisation pour explorer les données du commerce extérieur, de l\'industrie et des PME/PMI du Sénégal.', tag: 'Lancement' },
    { title: 'Commerce extérieur : les exportations en hausse de 6,9% en 2025', date: '15 mars 2026', desc: 'Selon les dernières données de l\'ANSD, les exportations sénégalaises atteignent 4,2 milliards de FCFA, portées par les produits pétroliers et halieutiques.', tag: 'Statistiques' },
    { title: 'Publication du rapport annuel sur l\'industrie 2024', date: '28 février 2026', desc: 'Le rapport analyse la performance du secteur industriel : production, valeur ajoutée, emploi et perspectives.', tag: 'Publication' },
    { title: 'Atelier de renforcement des capacités statistiques', date: '10 février 2026', desc: 'Formation des cadres du ministère sur les nouvelles méthodologies de collecte et d\'analyse des données commerciales.', tag: 'Événement' },
    { title: 'Le Sénégal dans le commerce mondial : tendances 2025', date: '20 janvier 2026', desc: 'Analyse des parts de marché du Sénégal et de son positionnement dans les échanges régionaux et internationaux.', tag: 'Analyse' },
    { title: 'Partenariat CRADES-ANSD pour l\'amélioration des données', date: '5 janvier 2026', desc: 'Signature d\'une convention pour harmoniser les méthodologies et améliorer la qualité des statistiques commerciales.', tag: 'Partenariat' },
  ]

  const content = `
<!-- Hero -->
<section class="bg-brand-navy py-14 lg:py-18">
  <div class="max-w-7xl mx-auto px-4 sm:px-6">
    <nav class="text-xs text-gray-400 mb-4">
      <a href="/" class="hover:text-white">Accueil</a>
      <span class="mx-2">/</span>
      <span class="text-gray-300">Actualités</span>
    </nav>
    <h1 class="text-3xl lg:text-4xl font-bold text-white tracking-tight">Actualités</h1>
    <p class="mt-3 text-base text-gray-300 max-w-3xl">Les dernières nouvelles du CRADES et de l'économie sénégalaise.</p>
  </div>
</section>

<section class="py-12 bg-gray-50">
  <div class="max-w-6xl mx-auto px-4 sm:px-6">
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      ${news.map(n => `
      <div class="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
        <div class="aspect-[16/9] bg-gradient-to-br from-brand-frost to-brand-ice flex items-center justify-center">
          <i class="fas fa-newspaper text-3xl text-brand-blue/30"></i>
        </div>
        <div class="p-5">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-[10px] font-semibold uppercase tracking-wider text-brand-gold">${n.tag}</span>
            <span class="text-[10px] text-gray-300">•</span>
            <time class="text-[10px] text-gray-400">${n.date}</time>
          </div>
          <h3 class="text-sm font-semibold text-gray-800 line-clamp-2 group-hover:text-brand-blue transition-colors">${n.title}</h3>
          <p class="text-xs text-gray-400 mt-2 line-clamp-3">${n.desc}</p>
        </div>
      </div>`).join('')}
    </div>
  </div>
</section>
`

  return layout(content, { title: 'Actualités', path: '/actualites', lang })
}
