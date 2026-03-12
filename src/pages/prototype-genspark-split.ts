import prototypeHtml from '../data/prototype-genspark/index.html?raw'

type GensparkTab = 'commerce-exterieur' | 'commerce-interieur' | 'industrie' | 'pme'

const TAB_ROUTES: Record<GensparkTab, string> = {
  'commerce-exterieur': '/commerce-exterieur',
  'commerce-interieur': '/commerce-interieur',
  industrie: '/industrie',
  pme: '/pme-pmi',
}

const TAB_TITLES: Record<GensparkTab, string> = {
  'commerce-exterieur': 'Commerce Exterieur | CRADES',
  'commerce-interieur': 'Commerce Interieur | CRADES',
  industrie: 'Industrie | CRADES',
  pme: 'PME-PMI | CRADES',
}

export async function prototypeGensparkSplitPage(tab: GensparkTab): Promise<string> {
  let html = prototypeHtml

  const targetTitle = TAB_TITLES[tab]
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${targetTitle}</title>`)

  const enhanceScript = `
<script>
document.addEventListener('DOMContentLoaded', function() {
  const routeMap = {
    'commerce-exterieur': '/commerce-exterieur',
    'commerce-interieur': '/commerce-interieur',
    'industrie': '/industrie',
    'pme': '/pme-pmi'
  };
  const activeTab = '${tab}';

  if (typeof switchTab === 'function') {
    switchTab(activeTab);
  }

  document.querySelectorAll('.tab-btn').forEach(function(btn) {
    var tab = btn.getAttribute('data-tab');
    var route = routeMap[tab];
    if (!route) return;
    btn.onclick = function() { window.location.href = route; };
  });
});
</script>
`

  html = html.replace('</body>', `${enhanceScript}\n</body>`)
  return html
}

export const gensparkTabRoutes = TAB_ROUTES
