import { layout } from '../components/layout'

export function publicationsPage(): string {
  const lang = 'fr'

  const publications = [
    { title: 'Bulletin mensuel — Marchés des produits de base — Mai 2025', type: 'Bulletin mensuel', year: '2025', desc: 'Riz, blé, maïs, sucre, huiles végétales : prix internationaux, production mondiale, importations du Sénégal.', pdf: '/static/publications/bulletin-produits-base-mai-2025.pdf' },
    { title: 'Note de conjoncture du commerce extérieur — T4 2025', type: 'Note de conjoncture', year: '2025', desc: 'Analyse trimestrielle des échanges commerciaux du Sénégal avec le reste du monde.', pdf: '' },
    { title: 'Rapport annuel sur l\'industrie sénégalaise 2024', type: 'Rapport annuel', year: '2024', desc: 'Bilan complet du secteur industriel : production, valeur ajoutée, emploi et investissements.', pdf: '' },
    { title: 'Bulletin statistique du commerce intérieur — S2 2024', type: 'Bulletin statistique', year: '2024', desc: 'Indices des prix à la consommation, inflation et évolution des marchés intérieurs.', pdf: '' },
    { title: 'Étude sur les PME/PMI au Sénégal — BANIN 2024', type: 'Étude', year: '2024', desc: 'Panorama des petites et moyennes entreprises : immatriculations, secteurs, taille, obstacles.', pdf: '' },
    { title: 'Annuaire statistique du commerce extérieur 2023', type: 'Annuaire', year: '2023', desc: 'Données détaillées sur les importations et exportations par produit et par partenaire.', pdf: '' },
    { title: 'Note d\'analyse — Impact des réformes douanières', type: 'Note d\'analyse', year: '2023', desc: 'Évaluation de l\'impact des réformes sur les flux commerciaux et les recettes douanières.', pdf: '' },
  ]

  const content = `
<!-- Hero -->
<section class="bg-brand-navy py-14 lg:py-18">
  <div class="max-w-7xl mx-auto px-4 sm:px-6">
    <nav class="text-xs text-gray-400 mb-4">
      <a href="/" class="hover:text-white">Accueil</a>
      <span class="mx-2">/</span>
      <span class="text-gray-300">Publications</span>
    </nav>
    <h1 class="text-3xl lg:text-4xl font-bold text-white tracking-tight">Publications</h1>
    <p class="mt-3 text-base text-gray-300 max-w-3xl">Rapports, notes de conjoncture, bulletins statistiques et études du CRADES.</p>
  </div>
</section>

<section class="py-12 bg-gray-50">
  <div class="max-w-6xl mx-auto px-4 sm:px-6">

    <!-- Filter bar -->
    <div class="flex flex-wrap gap-3 mb-8">
      <span class="text-xs font-medium bg-brand-blue text-white px-3 py-1.5 rounded-full">Toutes</span>
      <span class="text-xs font-medium bg-white text-gray-500 px-3 py-1.5 rounded-full border border-gray-200 hover:border-brand-blue hover:text-brand-blue cursor-pointer transition-colors">Bulletins mensuels</span>
      <span class="text-xs font-medium bg-white text-gray-500 px-3 py-1.5 rounded-full border border-gray-200 hover:border-brand-blue hover:text-brand-blue cursor-pointer transition-colors">Notes de conjoncture</span>
      <span class="text-xs font-medium bg-white text-gray-500 px-3 py-1.5 rounded-full border border-gray-200 hover:border-brand-blue hover:text-brand-blue cursor-pointer transition-colors">Rapports annuels</span>
      <span class="text-xs font-medium bg-white text-gray-500 px-3 py-1.5 rounded-full border border-gray-200 hover:border-brand-blue hover:text-brand-blue cursor-pointer transition-colors">Études</span>
    </div>

    <!-- Publications grid -->
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
            ${p.pdf ? '<span class="text-brand-blue font-medium group-hover:underline"><i class="fas fa-download mr-1"></i>Télécharger</span>' : '<span class="text-gray-300 italic">Bientôt disponible</span>'}
          </div>
        </div>
      </${p.pdf ? 'a' : 'div'}>`).join('')}
    </div>
  </div>
</section>
`

  return layout(content, { title: 'Publications', path: '/publications', lang })
}
