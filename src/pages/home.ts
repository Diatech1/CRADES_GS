import { layout } from '../components/layout'

export function homePage(): string {
  const lang = 'fr'

  const dashboards = [
    { title: 'Commerce extérieur', desc: 'Exportations, importations, balance commerciale et partenaires du Sénégal.', icon: 'fa-globe', color: 'brand-blue', href: '/commerce-exterieur' },
    { title: 'Commerce intérieur', desc: 'Prix à la consommation, inflation, IHPC et marchés intérieurs.', icon: 'fa-store', color: 'brand-gold', href: '/commerce-interieur' },
    { title: 'Industrie', desc: 'Production industrielle, IHPI, valeur ajoutée et emploi du secteur.', icon: 'fa-industry', color: 'brand-sky', href: '/industrie' },
    { title: 'PME / PMI', desc: 'Immatriculations, secteurs, taille, répartition géographique et obstacles.', icon: 'fa-building', color: 'brand-navy', href: '/pme-pmi' },
  ]

  const publications = [
    { title: 'Bulletin mensuel — Marchés des produits de base — Mai 2025', type: 'Bulletin mensuel', year: '2025', desc: 'Riz, blé, maïs, sucre, huiles végétales : prix internationaux, production mondiale, importations du Sénégal.', pdf: '/static/publications/bulletin-produits-base-mai-2025.pdf' },
    { title: 'Note de conjoncture du commerce extérieur — T4 2025', type: 'Note de conjoncture', year: '2025', desc: 'Analyse trimestrielle des échanges commerciaux du Sénégal avec le reste du monde.', pdf: '' },
    { title: 'Rapport annuel sur l\'industrie sénégalaise 2024', type: 'Rapport annuel', year: '2024', desc: 'Bilan complet du secteur industriel : production, valeur ajoutée, emploi et investissements.', pdf: '' },
  ]

  const content = `
<!-- Hero -->
<section class="relative overflow-hidden bg-brand-frost">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 py-16 lg:py-24">
    <div class="max-w-xl">
      <h1 class="font-display font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-brand-navy leading-tight">
        Centre de Recherche,<br>d'Analyse&nbsp;des&nbsp;Échanges et&nbsp;Statistiques
      </h1>
      <p class="text-gray-600 mt-5 text-sm leading-relaxed">
        Le CRADES produit et diffuse les statistiques, études et analyses stratégiques sur l'industrie et le commerce du Sénégal.
      </p>
      <div class="flex flex-wrap gap-4 mt-10">
        <a href="/commerce-exterieur" class="text-sm font-medium bg-brand-blue text-white px-5 py-2.5 rounded-lg hover:bg-brand-navy transition-colors shadow-sm">
          Explorer les tableaux de bord
        </a>
        <a href="/publications" class="text-sm font-medium bg-white text-brand-navy px-5 py-2.5 rounded-lg hover:bg-white/80 transition-colors border border-brand-ice shadow-sm">
          Publications
        </a>
      </div>
    </div>
  </div>
</section>

<!-- KPI Banner -->
<section class="bg-brand-navy">
  <div class="max-w-6xl mx-auto px-4 sm:px-6">
    <div class="grid grid-cols-2 lg:grid-cols-4 divide-x divide-white/10">
      <a href="/industrie" class="group py-6 px-4 sm:px-6 text-center hover:bg-white/5 transition-colors">
        <div class="flex items-baseline justify-center gap-1.5">
          <span class="text-2xl sm:text-3xl font-bold text-white tracking-tight">1 250</span>
          <span class="text-xs sm:text-sm text-brand-ice/70 font-medium">Mds FCFA</span>
        </div>
        <p class="text-[11px] sm:text-xs text-brand-ice/50 mt-1 tracking-wide">PIB Industriel</p>
      </a>
      <a href="/industrie" class="group py-6 px-4 sm:px-6 text-center hover:bg-white/5 transition-colors">
        <div class="flex items-baseline justify-center gap-1.5">
          <span class="text-2xl sm:text-3xl font-bold text-white tracking-tight">108</span>
          <span class="text-xs sm:text-sm text-brand-ice/70 font-medium">pts</span>
        </div>
        <p class="text-[11px] sm:text-xs text-brand-ice/50 mt-1 tracking-wide">Indice Prix Production</p>
      </a>
      <a href="/pme-pmi" class="group py-6 px-4 sm:px-6 text-center hover:bg-white/5 transition-colors">
        <div class="flex items-baseline justify-center gap-1.5">
          <span class="text-2xl sm:text-3xl font-bold text-white tracking-tight">580</span>
          <span class="text-xs sm:text-sm text-brand-ice/70 font-medium">/ mois</span>
        </div>
        <p class="text-[11px] sm:text-xs text-brand-ice/50 mt-1 tracking-wide">Créations PME</p>
      </a>
      <a href="/commerce-exterieur" class="group py-6 px-4 sm:px-6 text-center hover:bg-white/5 transition-colors">
        <div class="flex items-baseline justify-center gap-1.5">
          <span class="text-2xl sm:text-3xl font-bold text-white tracking-tight">-89</span>
          <span class="text-xs sm:text-sm text-brand-ice/70 font-medium">Mds FCFA</span>
        </div>
        <p class="text-[11px] sm:text-xs text-brand-ice/50 mt-1 tracking-wide">Balance Commerciale</p>
      </a>
    </div>
  </div>
</section>

<!-- Dashboards Grid -->
<section class="py-16 bg-white">
  <div class="max-w-6xl mx-auto px-4 sm:px-6">
    <div class="flex items-center justify-between mb-10">
      <h2 class="font-display text-xl text-gray-800">Tableaux de bord sectoriels</h2>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      ${dashboards.map(d => `
      <a href="${d.href}" class="group block bg-white rounded-xl border border-gray-100 p-6 hover:shadow-lg hover:border-brand-ice transition-all">
        <div class="w-11 h-11 rounded-lg bg-${d.color}/10 flex items-center justify-center mb-4">
          <i class="fas ${d.icon} text-${d.color}"></i>
        </div>
        <h3 class="text-sm font-semibold text-gray-800 group-hover:text-brand-blue transition-colors">${d.title}</h3>
        <p class="text-xs text-gray-400 mt-2 line-clamp-2">${d.desc}</p>
        <span class="inline-block mt-4 text-xs text-brand-blue font-medium group-hover:underline">Explorer &rarr;</span>
      </a>`).join('')}
    </div>
  </div>
</section>

<!-- Publications -->
<section class="py-16 bg-gray-50 border-t border-gray-100">
  <div class="max-w-6xl mx-auto px-4 sm:px-6">
    <div class="flex items-center justify-between mb-10">
      <h2 class="font-display text-xl text-gray-800">Dernières publications</h2>
      <a href="/publications" class="text-xs text-brand-blue font-medium hover:underline">Voir toutes &rarr;</a>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      ${publications.map(p => `
      <${p.pdf ? `a href="${p.pdf}" target="_blank"` : 'div'} class="group block bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow${p.pdf ? ' ring-2 ring-brand-blue/20' : ''}">
        <div class="aspect-[3/2] bg-gradient-to-br from-brand-frost to-brand-ice flex items-center justify-center relative">
          <i class="fas fa-file-pdf text-4xl text-brand-blue/30"></i>
          ${p.pdf ? '<span class="absolute top-3 right-3 bg-brand-blue text-white text-[9px] font-bold uppercase px-2 py-0.5 rounded">PDF</span>' : ''}
        </div>
        <div class="p-5">
          <span class="text-[10px] font-semibold uppercase tracking-wider text-brand-gold">${p.type}</span>
          <h3 class="text-sm font-semibold text-gray-800 mt-1 line-clamp-2 group-hover:text-brand-blue transition-colors">${p.title}</h3>
          <p class="text-xs text-gray-400 mt-2 line-clamp-2">${p.desc}</p>
          <div class="flex items-center justify-between mt-3 text-[11px] text-gray-300">
            <span>${p.year}</span>
            ${p.pdf ? '<span class="text-brand-blue font-medium group-hover:underline"><i class="fas fa-download mr-1"></i>Télécharger</span>' : '<span class="text-brand-blue group-hover:underline">Lire &rarr;</span>'}
          </div>
        </div>
      </${p.pdf ? 'a' : 'div'}>`).join('')}
    </div>
  </div>
</section>

<!-- About teaser -->
<section class="py-16 bg-brand-frost/50 border-t border-gray-100">
  <div class="max-w-6xl mx-auto px-4 sm:px-6">
    <div class="max-w-3xl mx-auto text-center">
      <h2 class="font-display text-xl text-gray-800 mb-4">À propos du CRADES</h2>
      <p class="text-sm text-gray-500 leading-relaxed">
        Créé par arrêté du Ministre du Commerce, le CRADES est une structure technique spécialisée dans la recherche,
        le traitement et l'analyse des statistiques et informations commerciales. Rattaché au cabinet du Ministre,
        il assure la veille commerciale, l'évaluation d'impact des accords commerciaux et le renforcement des capacités
        des acteurs publics et privés.
      </p>
      <a href="/a-propos" class="inline-block mt-6 text-sm text-brand-blue font-medium hover:underline">En savoir plus &rarr;</a>
    </div>
  </div>
</section>
`

  return layout(content, { title: 'Accueil', path: '/', lang })
}
