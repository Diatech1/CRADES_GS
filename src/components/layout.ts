// CRADES Layout — Clean institutional design (dashboards only)
const t = (fr: string, en: string, lang: string) => lang === 'en' ? en : fr

export function layout(content: string, options: { title?: string; description?: string; lang?: string; path?: string } = {}) {
  const lang = options.lang || 'fr'
  const title = options.title 
    ? `${options.title} | CRADES` 
    : 'CRADES - Centre de Recherche, d\'Analyse des Échanges et Statistiques'
  const description = options.description || 
    'Institution rattachée au Ministère de l\'Industrie et du Commerce du Sénégal.'
  const path = options.path || '/'

  return `<!DOCTYPE html>
<html lang="${lang}" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <meta name="robots" content="index, follow">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="${lang === 'en' ? 'en_US' : 'fr_FR'}">
  <link rel="canonical" href="https://crades.gouv.sn${path}">
  <link rel="alternate" hreflang="fr" href="https://crades.gouv.sn${path}">
  <link rel="alternate" hreflang="en" href="https://crades.gouv.sn${path}?lang=en">
  <link rel="icon" type="image/png" href="/static/img/logo-crades.png">
  <link rel="shortcut icon" href="/static/favicon.ico">
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.5.0/css/all.min.css" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            brand: {
              navy: '#032d6b',
              blue: '#044bad',
              sky: '#3a7fd4',
              ice: '#c7ddf5',
              frost: '#eef4fb',
              gold: '#b8943e',
              'gold-light': '#d4b262',
            }
          },
          fontFamily: {
            sans: ['Montserrat', 'system-ui', 'sans-serif'],
            display: ['Montserrat', 'system-ui', 'sans-serif'],
          }
        }
      }
    }
  </script>
  <style>
    .fade-up { animation: fadeUp .5s ease-out both; }
    @keyframes fadeUp { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
    ::selection { background: #044bad; color: #fff; }
  </style>
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "GovernmentOrganization",
    "name": "CRADES",
    "alternateName": "Centre de Recherche, d'Analyse des Échanges et Statistiques",
    "url": "https://crades.gouv.sn",
    "logo": "https://crades.gouv.sn/static/img/logo-crades.png",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Rue Aimé Césaire, Plateau",
      "addressLocality": "Dakar",
      "addressCountry": "SN"
    }
  }
  </script>
</head>
<body class="bg-white font-sans text-gray-700 antialiased">

<!-- Ministry top bar -->
<div class="bg-white border-b border-gray-100">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 py-2 flex justify-center">
    <img src="/static/img/logo-mincom.png" alt="MINCOM" class="w-auto" style="height:65px">
  </div>
</div>

<!-- Header -->
<header class="bg-white border-b border-gray-100 sticky top-0 z-50">
  <div class="max-w-6xl mx-auto px-4 sm:px-6">
    <div class="flex items-center justify-between h-20">
      <!-- Logo -->
      <a href="/" class="flex items-center gap-3">
        <img src="/static/img/logo-crades.png" alt="CRADES" class="h-16 w-auto">
      </a>

      <!-- Desktop Nav -->
      <nav class="hidden lg:flex items-center gap-5 xl:gap-6 text-[13px] font-medium text-gray-500">
        <a href="/" class="hover:text-brand-blue transition-colors whitespace-nowrap ${path === '/' ? 'text-brand-blue' : ''}">${t('Accueil', 'Home', lang)}</a>
        <a href="/a-propos" class="hover:text-brand-blue transition-colors whitespace-nowrap ${path === '/a-propos' ? 'text-brand-blue' : ''}">${t('À propos', 'About', lang)}</a>
        <a href="/publications" class="hover:text-brand-blue transition-colors whitespace-nowrap ${path === '/publications' ? 'text-brand-blue' : ''}">${t('Publications', 'Publications', lang)}</a>
        <div class="relative group">
          <button class="hover:text-brand-blue transition-colors flex items-center gap-1 whitespace-nowrap">
            <span class="${['/commerce-exterieur','/commerce-interieur','/industrie','/pme-pmi'].includes(path) ? 'text-brand-blue' : ''}">${t('Tableaux de bord', 'Dashboards', lang)}</span>
            <i class="fas fa-chevron-down text-[8px] text-gray-400 group-hover:text-brand-blue transition-colors"></i>
          </button>
          <div class="absolute top-full left-0 pt-2 hidden group-hover:block">
            <div class="bg-white border border-gray-100 rounded-lg shadow-lg py-2 min-w-[220px]">
              <a href="/commerce-exterieur" class="block px-4 py-2 text-[13px] text-gray-500 hover:text-brand-blue hover:bg-gray-50 transition-colors ${path === '/commerce-exterieur' ? 'text-brand-blue font-semibold' : ''}">${t('Commerce extérieur', 'Foreign Trade', lang)}</a>
              <a href="/commerce-interieur" class="block px-4 py-2 text-[13px] text-gray-500 hover:text-brand-blue hover:bg-gray-50 transition-colors ${path === '/commerce-interieur' ? 'text-brand-blue font-semibold' : ''}">${t('Commerce intérieur', 'Domestic Trade', lang)}</a>
              <a href="/industrie" class="block px-4 py-2 text-[13px] text-gray-500 hover:text-brand-blue hover:bg-gray-50 transition-colors ${path === '/industrie' ? 'text-brand-blue font-semibold' : ''}">${t('Industrie', 'Industry', lang)}</a>
              <a href="/pme-pmi" class="block px-4 py-2 text-[13px] text-gray-500 hover:text-brand-blue hover:bg-gray-50 transition-colors ${path === '/pme-pmi' ? 'text-brand-blue font-semibold' : ''}">${t('PME/PMI', 'SMEs/SMBs', lang)}</a>
            </div>
          </div>
        </div>
        <a href="/actualites" class="hover:text-brand-blue transition-colors whitespace-nowrap ${path === '/actualites' ? 'text-brand-blue' : ''}">${t('Actualités', 'News', lang)}</a>
        <a href="/contact" class="hover:text-brand-blue transition-colors whitespace-nowrap ${path === '/contact' ? 'text-brand-blue' : ''}">Contact</a>
      </nav>

      <!-- Right -->
      <div class="flex items-center gap-3">
        <div class="hidden sm:flex items-center gap-1 text-xs text-gray-400 border border-gray-200 rounded-full px-2 py-1">
          <a href="${path}${path.includes('?') ? '&' : '?'}lang=fr" class="${lang === 'fr' ? 'text-brand-blue font-semibold' : 'hover:text-gray-600'}">FR</a>
          <span class="text-gray-300">|</span>
          <a href="${path}${path.includes('?') ? '&' : '?'}lang=en" class="${lang === 'en' ? 'text-brand-blue font-semibold' : 'hover:text-gray-600'}">EN</a>
        </div>
        <button onclick="document.getElementById('mobileMenu').classList.toggle('hidden')" class="lg:hidden w-8 h-8 flex items-center justify-center text-gray-500">
          <i class="fas fa-bars"></i>
        </button>
      </div>
    </div>
  </div>
</header>

<!-- Mobile Menu -->
<div id="mobileMenu" class="hidden fixed inset-0 z-[60] bg-white lg:hidden">
  <div class="flex items-center justify-between p-4 border-b border-gray-100">
    <a href="/" class="flex items-center gap-2">
      <img src="/static/img/logo-crades.png" alt="CRADES" class="h-20 w-auto">
    </a>
    <button onclick="document.getElementById('mobileMenu').classList.add('hidden')" class="w-8 h-8 flex items-center justify-center text-gray-400">
      <i class="fas fa-times"></i>
    </button>
  </div>
  <nav class="p-4 space-y-1">
    <a href="/" class="block px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 font-medium text-sm">${t('Accueil', 'Home', lang)}</a>
    <a href="/a-propos" class="block px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 font-medium text-sm">${t('À propos', 'About', lang)}</a>
    <a href="/publications" class="block px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 font-medium text-sm">${t('Publications', 'Publications', lang)}</a>
    <div class="block px-4 py-3 rounded-lg text-gray-600 font-medium text-sm">${t('Tableaux de bord', 'Dashboards', lang)}</div>
    <a href="/commerce-exterieur" class="block pl-8 pr-4 py-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 font-medium text-sm"><i class="fas fa-chevron-right text-[8px] mr-2"></i>${t('Commerce extérieur', 'Foreign Trade', lang)}</a>
    <a href="/commerce-interieur" class="block pl-8 pr-4 py-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 font-medium text-sm"><i class="fas fa-chevron-right text-[8px] mr-2"></i>${t('Commerce intérieur', 'Domestic Trade', lang)}</a>
    <a href="/industrie" class="block pl-8 pr-4 py-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 font-medium text-sm"><i class="fas fa-chevron-right text-[8px] mr-2"></i>${t('Industrie', 'Industry', lang)}</a>
    <a href="/pme-pmi" class="block pl-8 pr-4 py-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 font-medium text-sm"><i class="fas fa-chevron-right text-[8px] mr-2"></i>${t('PME/PMI', 'SMEs/SMBs', lang)}</a>
    <a href="/actualites" class="block px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 font-medium text-sm">${t('Actualités', 'News', lang)}</a>
    <a href="/contact" class="block px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 font-medium text-sm">Contact</a>
    <div class="pt-3 border-t border-gray-100 mt-3 flex gap-3 px-4 text-sm">
      <a href="${path}?lang=fr" class="${lang === 'fr' ? 'text-brand-blue font-semibold' : 'text-gray-400'}">Français</a>
      <a href="${path}?lang=en" class="${lang === 'en' ? 'text-brand-blue font-semibold' : 'text-gray-400'}">English</a>
    </div>
  </nav>
</div>

<!-- Main -->
<main class="min-h-screen">
${content}
</main>

<!-- Footer -->
<footer class="border-t border-gray-100 mt-20">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 py-12">
    <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
      <div class="col-span-2 md:col-span-1">
        <div class="flex items-center gap-2 mb-3">
          <img src="/static/img/logo-crades.png" alt="CRADES" class="h-20 w-auto">
        </div>
        <p class="text-xs text-gray-400 leading-relaxed">${t('Centre de Recherche, d\'Analyse des Échanges et Statistiques', 'Research, Trade Analysis and Statistics Centre', lang)}</p>
      </div>
      <div>
        <h4 class="text-xs font-semibold text-gray-800 uppercase tracking-wider mb-3">${t('Navigation', 'Navigation', lang)}</h4>
        <ul class="space-y-2 text-xs text-gray-400">
          <li><a href="/a-propos" class="hover:text-gray-600">${t('À propos', 'About', lang)}</a></li>
          <li><a href="/publications" class="hover:text-gray-600">${t('Publications', 'Publications', lang)}</a></li>
          <li><a href="/actualites" class="hover:text-gray-600">${t('Actualités', 'News', lang)}</a></li>
        </ul>
      </div>
      <div>
        <h4 class="text-xs font-semibold text-gray-800 uppercase tracking-wider mb-3">${t('Tableaux de bord', 'Dashboards', lang)}</h4>
        <ul class="space-y-2 text-xs text-gray-400">
          <li><a href="/commerce-exterieur" class="hover:text-gray-600">${t('Commerce extérieur', 'Foreign Trade', lang)}</a></li>
          <li><a href="/commerce-interieur" class="hover:text-gray-600">${t('Commerce intérieur', 'Domestic Trade', lang)}</a></li>
          <li><a href="/industrie" class="hover:text-gray-600">${t('Industrie', 'Industry', lang)}</a></li>
          <li><a href="/pme-pmi" class="hover:text-gray-600">${t('PME/PMI', 'SMEs/SMBs', lang)}</a></li>
        </ul>
      </div>
      <div>
        <h4 class="text-xs font-semibold text-gray-800 uppercase tracking-wider mb-3">Contact</h4>
        <div class="space-y-2 text-xs text-gray-400">
          <p>Rue Aimé Césaire, Plateau<br>Dakar, Sénégal</p>
          <p>+221 33 889 12 34</p>
          <p>contact@crades.gouv.sn</p>
        </div>
      </div>
    </div>
  </div>
  <div class="border-t border-gray-50">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-300">
      <p>&copy; ${new Date().getFullYear()} CRADES — ${t('Tous droits réservés', 'All rights reserved', lang)}</p>
      <p>${t('République du Sénégal', 'Republic of Senegal', lang)}</p>
    </div>
  </div>
</footer>
</body>
</html>`
}
