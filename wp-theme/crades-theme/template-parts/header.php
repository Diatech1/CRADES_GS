<?php
/**
 * CRADES Header â€” Exact replica of Hono frontend
 * Ministry bar + Sticky header + Mobile menu + Search modal
 */
$logo_crades = crades_img( 'logo-crades.png' );
$logo_mincom = crades_img( 'logo-mincom.png' );
?>
<!DOCTYPE html>
<html <?php language_attributes(); ?> class="scroll-smooth">
<head>
  <meta charset="<?php bloginfo( 'charset' ); ?>">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <?php wp_head(); ?>
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
    "alternateName": "Centre de Recherche, d'Analyse des Ã‰changes et Statistiques",
    "url": "https://crades.gouv.sn",
    "logo": "https://crades.gouv.sn/static/img/logo-crades.png",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Rue AimÃ© CÃ©saire, Plateau",
      "addressLocality": "Dakar",
      "addressCountry": "SN"
    }
  }
  </script>
</head>
<body <?php body_class( 'bg-white font-sans text-gray-700 antialiased' ); ?>>

<!-- Ministry top bar -->
<div class="bg-white border-b border-gray-100">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 py-1 flex justify-center">
    <img src="<?php echo esc_url( $logo_mincom ); ?>" alt="MINCOM" class="h-10 w-auto">
  </div>
</div>

<!-- Header -->
<header class="bg-white border-b border-gray-100 sticky top-0 z-50">
  <div class="max-w-6xl mx-auto px-4 sm:px-6">
    <div class="flex items-center justify-between h-20">
      <!-- Logo -->
      <a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="flex items-center gap-3">
        <img src="<?php echo esc_url( $logo_crades ); ?>" alt="CRADES" class="h-16 w-auto">
      </a>

      <!-- Desktop Nav -->
      <nav class="hidden lg:flex items-center gap-5 xl:gap-6 text-[13px] font-medium text-gray-500">
        <a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="hover:text-brand-blue transition-colors whitespace-nowrap">Accueil</a>
        <a href="<?php echo esc_url( home_url( '/a-propos/' ) ); ?>" class="hover:text-brand-blue transition-colors whitespace-nowrap">Ã€ propos</a>
        <a href="<?php echo esc_url( home_url( '/publications/' ) ); ?>" class="hover:text-brand-blue transition-colors whitespace-nowrap">Publications</a>
        <div class="relative group">
          <button class="hover:text-brand-blue transition-colors flex items-center gap-1 whitespace-nowrap" onclick="this.parentElement.querySelector('.dropdown-menu').classList.toggle('hidden')">
            <a href="<?php echo esc_url( home_url( '/tableaux-de-bord/' ) ); ?>" class="hover:text-brand-blue">Tableaux de bord</a>
            <i class="fas fa-chevron-down text-[8px] text-gray-400 group-hover:text-brand-blue transition-colors"></i>
          </button>
          <div class="dropdown-menu absolute top-full left-0 pt-2 hidden group-hover:block">
            <div class="bg-white border border-gray-100 rounded-lg shadow-lg py-2 min-w-[200px]">
              <a href="<?php echo esc_url( home_url( '/commerce-exterieur/' ) ); ?>" class="block px-4 py-2 text-[13px] text-gray-500 hover:text-brand-blue hover:bg-gray-50 transition-colors">Commerce extÃ©rieur</a>
            </div>
          </div>
        </div>
        <a href="<?php echo esc_url( home_url( '/actualites/' ) ); ?>" class="hover:text-brand-blue transition-colors whitespace-nowrap">ActualitÃ©s</a>
        <a href="<?php echo esc_url( home_url( '/contact/' ) ); ?>" class="hover:text-brand-blue transition-colors whitespace-nowrap">Contact</a>
      </nav>

      <!-- Right -->
      <div class="flex items-center gap-3">
        <div class="hidden sm:flex items-center gap-1 text-xs text-gray-400 border border-gray-200 rounded-full px-2 py-1">
          <a href="?lang=fr" class="text-brand-blue font-semibold">FR</a>
          <span class="text-gray-300">|</span>
          <a href="?lang=en" class="hover:text-gray-600">EN</a>
        </div>
        <button onclick="document.getElementById('searchModal').classList.toggle('hidden')" class="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-brand-blue transition-colors rounded-full hover:bg-gray-50">
          <i class="fas fa-search text-sm"></i>
        </button>
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
    <a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="flex items-center gap-2">
      <img src="<?php echo esc_url( $logo_crades ); ?>" alt="CRADES" class="h-20 w-auto">
    </a>
    <button onclick="document.getElementById('mobileMenu').classList.add('hidden')" class="w-8 h-8 flex items-center justify-center text-gray-400">
      <i class="fas fa-times"></i>
    </button>
  </div>
  <nav class="p-4 space-y-1">
    <a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="block px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 font-medium text-sm">Accueil</a>
    <a href="<?php echo esc_url( home_url( '/a-propos/' ) ); ?>" class="block px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 font-medium text-sm">Ã€ propos</a>
    <a href="<?php echo esc_url( home_url( '/publications/' ) ); ?>" class="block px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 font-medium text-sm">Publications</a>
    <a href="<?php echo esc_url( home_url( '/tableaux-de-bord/' ) ); ?>" class="block px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 font-medium text-sm">Tableaux de bord</a>
    <a href="<?php echo esc_url( home_url( '/commerce-exterieur/' ) ); ?>" class="block pl-8 pr-4 py-2 rounded-lg text-gray-400 hover:bg-gray-50 font-medium text-sm"><i class="fas fa-chevron-right text-[8px] mr-2"></i>Commerce extÃ©rieur</a>
    <a href="<?php echo esc_url( home_url( '/actualites/' ) ); ?>" class="block px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 font-medium text-sm">ActualitÃ©s</a>
    <a href="<?php echo esc_url( home_url( '/contact/' ) ); ?>" class="block px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 font-medium text-sm">Contact</a>
    <div class="pt-3 border-t border-gray-100 mt-3 flex gap-3 px-4 text-sm">
      <a href="?lang=fr" class="text-brand-blue font-semibold">FranÃ§ais</a>
      <a href="?lang=en" class="text-gray-400">English</a>
    </div>
  </nav>
</div>

<!-- Search Modal -->
<div id="searchModal" class="hidden fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm flex items-start justify-center pt-24">
  <div class="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
    <div class="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
      <i class="fas fa-search text-gray-300"></i>
      <input id="searchInput" type="text" placeholder="Rechercher..."
        class="flex-1 text-sm outline-none text-gray-700 placeholder:text-gray-300"
        onkeyup="handleSearch(this.value)" autofocus>
      <button onclick="document.getElementById('searchModal').classList.add('hidden')" class="text-gray-300 hover:text-gray-500">
        <i class="fas fa-times"></i>
      </button>
    </div>
    <div id="searchResults" class="max-h-72 overflow-y-auto"></div>
  </div>
</div>
<script>
document.getElementById('searchModal')?.addEventListener('click', function(e) {
  if (e.target === this) this.classList.add('hidden');
});
let searchTimeout;
function handleSearch(q) {
  clearTimeout(searchTimeout);
  const results = document.getElementById('searchResults');
  if (q.length < 2) { results.innerHTML = ''; return; }
  searchTimeout = setTimeout(async () => {
    try {
      const res = await fetch('<?php echo esc_url( rest_url( 'wp/v2/search' ) ); ?>?search=' + encodeURIComponent(q) + '&per_page=10');
      const data = await res.json();
      if (data?.length > 0) {
        results.innerHTML = data.map(r =>
          '<a href="' + r.url + '" class="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">' +
          '<div class="flex-1 min-w-0"><div class="text-sm font-medium text-gray-700 truncate">' + r.title + '</div>' +
          '<div class="text-xs text-gray-400 mt-0.5">' + (r.subtype || r.type || '') + '</div></div>' +
          '<i class="fas fa-chevron-right text-[10px] text-gray-300"></i></a>'
        ).join('');
      } else {
        results.innerHTML = '<p class="text-center text-gray-400 text-sm py-8">Aucun rÃ©sultat</p>';
      }
    } catch(e) { console.error(e); }
  }, 300);
}
</script>

<!-- Main -->
<main class="min-h-screen">
