import { layout } from '../components/layout'

export async function dash2Page(): Promise<string> {
  const kpis = [
    { label: 'Exportations 2025', value: '5 935,2', unit: 'Mds FCFA', trend: '+51,8%', color: 'text-brand-blue' },
    { label: 'Importations 2025', value: '7 279,1', unit: 'Mds FCFA', trend: '+1,6%', color: 'text-brand-navy' },
    { label: 'Balance commerciale', value: '-1 343,9', unit: 'Mds FCFA', trend: 'amelioration', color: 'text-emerald-600' },
    { label: 'Echanges totaux', value: '13 214,3', unit: 'Mds FCFA', trend: '+19,36%', color: 'text-brand-gold' },
  ]

  const content = `
<section class="bg-brand-navy py-14 lg:py-18">
  <div class="max-w-6xl mx-auto px-4 sm:px-6">
    <nav class="text-xs text-gray-400 mb-4">
      <a href="/" class="hover:text-white">Accueil</a>
      <span class="mx-2 text-gray-600">/</span>
      <span class="text-gray-300">Dash2</span>
    </nav>
    <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
      <div>
        <h1 class="font-display text-2xl lg:text-3xl text-white">Dash2 - Prototype Genspark</h1>
        <p class="text-gray-400 mt-2 text-sm max-w-xl">
          Tableau de bord v2 inspire du prototype Genspark avec style institutionnel CRADES.
        </p>
      </div>
      <div class="flex items-center gap-2 text-xs text-gray-500">
        <i class="fas fa-chart-line"></i>
        <span>Reference visuelle : Commerce exterieur</span>
      </div>
    </div>
  </div>
</section>

<section class="bg-white border-b border-gray-100">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 py-6">
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      ${kpis.map(k => `
      <div class="bg-brand-frost rounded-lg p-4 text-center">
        <div class="text-2xl font-bold ${k.color}">${k.value}</div>
        <div class="text-[11px] text-gray-500 mt-1">${k.label}</div>
        <div class="text-[10px] text-gray-400">${k.unit} | ${k.trend}</div>
      </div>
      `).join('')}
    </div>
  </div>
</section>

<section class="py-10 bg-gray-50">
  <div class="max-w-6xl mx-auto px-4 sm:px-6">
    <div class="grid lg:grid-cols-2 gap-6 mb-6">
      <div class="bg-white border border-gray-100 rounded-lg p-5">
        <h3 class="text-sm font-semibold text-gray-800 mb-4">Evolution commerce exterieur (2020-2025)</h3>
        <div class="bg-gray-50 rounded-md p-3"><canvas id="dash2-evolution" height="220"></canvas></div>
      </div>
      <div class="bg-white border border-gray-100 rounded-lg p-5">
        <h3 class="text-sm font-semibold text-gray-800 mb-4">Balance commerciale (2020-2025)</h3>
        <div class="bg-gray-50 rounded-md p-3"><canvas id="dash2-balance" height="220"></canvas></div>
      </div>
    </div>

    <div class="grid lg:grid-cols-2 gap-6 mb-6">
      <div class="bg-white border border-gray-100 rounded-lg p-5">
        <h3 class="text-sm font-semibold text-gray-800 mb-4">Top destinations export (Dec 2025)</h3>
        <div class="bg-gray-50 rounded-md p-3"><canvas id="dash2-destinations" height="250"></canvas></div>
      </div>
      <div class="bg-white border border-gray-100 rounded-lg p-5">
        <h3 class="text-sm font-semibold text-gray-800 mb-4">Top fournisseurs import (Dec 2025)</h3>
        <div class="bg-gray-50 rounded-md p-3"><canvas id="dash2-fournisseurs" height="250"></canvas></div>
      </div>
    </div>

    <div class="bg-white border border-gray-100 rounded-lg overflow-hidden">
      <div class="bg-brand-frost px-4 py-3 border-b border-brand-ice/50">
        <h3 class="text-sm font-semibold text-gray-800">Principaux produits echanges</h3>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-xs">
          <thead>
            <tr class="bg-gray-50 text-gray-500 text-left">
              <th class="px-4 py-2 font-medium">Produit</th>
              <th class="px-4 py-2 font-medium text-right">Export (Mds FCFA)</th>
              <th class="px-4 py-2 font-medium text-right">Import (Mds FCFA)</th>
              <th class="px-4 py-2 font-medium text-right">Variation</th>
            </tr>
          </thead>
          <tbody>
            <tr class="border-t border-gray-50"><td class="px-4 py-2 font-medium text-gray-800">Or non monetaire</td><td class="px-4 py-2 text-right text-emerald-600">206,8</td><td class="px-4 py-2 text-right text-gray-400">-</td><td class="px-4 py-2 text-right text-emerald-600">+115,7%</td></tr>
            <tr class="border-t border-gray-50"><td class="px-4 py-2 font-medium text-gray-800">Huiles brutes de petrole</td><td class="px-4 py-2 text-right text-emerald-600">106,3</td><td class="px-4 py-2 text-right text-gray-400">-</td><td class="px-4 py-2 text-right text-emerald-600">+133,6%</td></tr>
            <tr class="border-t border-gray-50"><td class="px-4 py-2 font-medium text-gray-800">Produits petroliers raffines</td><td class="px-4 py-2 text-right text-emerald-600">90,4</td><td class="px-4 py-2 text-right text-red-500">105,5</td><td class="px-4 py-2 text-right text-emerald-600">+81,9%</td></tr>
            <tr class="border-t border-gray-50"><td class="px-4 py-2 font-medium text-gray-800">Produits pharmaceutiques</td><td class="px-4 py-2 text-right text-gray-400">-</td><td class="px-4 py-2 text-right text-red-500">17,6</td><td class="px-4 py-2 text-right text-red-500">-26,4%</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</section>

<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
document.addEventListener('DOMContentLoaded', () => {
  const blue = '#044bad';
  const navy = '#032d6b';
  const gold = '#b8943e';
  const sky = '#3a7fd4';
  const success = '#059669';
  const grid = '#f1f5f9';

  new Chart(document.getElementById('dash2-evolution'), {
    type: 'line',
    data: {
      labels: ['2020','2021','2022','2023','2024','2025'],
      datasets: [
        { label: 'Exports', data: [2600, 3100, 3700, 4200, 3910, 5935], borderColor: blue, backgroundColor: blue + '15', fill: true, tension: 0.3 },
        { label: 'Imports', data: [4200, 5100, 5600, 6200, 7164, 7279], borderColor: navy, backgroundColor: navy + '08', fill: false, tension: 0.3 }
      ]
    },
    options: { responsive: true, scales: { y: { grid: { color: grid } }, x: { grid: { display: false } } } }
  });

  new Chart(document.getElementById('dash2-balance'), {
    type: 'bar',
    data: { labels: ['2020','2021','2022','2023','2024','2025'], datasets: [{ label: 'Balance', data: [-1600,-2000,-1900,-2000,-3254,-1344], backgroundColor: [gold,gold,gold,gold,navy,success] }] },
    options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { grid: { color: grid } }, x: { grid: { display: false } } } }
  });

  new Chart(document.getElementById('dash2-destinations'), {
    type: 'bar',
    data: { labels: ['Mali','Suisse','Inde','Cote d\\'Ivoire','Chine'], datasets: [{ data: [621,420,381,350,302], backgroundColor: [blue,sky,navy,gold,success] }] },
    options: { indexAxis: 'y', responsive: true, plugins: { legend: { display: false } }, scales: { x: { grid: { color: grid } }, y: { grid: { display: false } } } }
  });

  new Chart(document.getElementById('dash2-fournisseurs'), {
    type: 'bar',
    data: { labels: ['Chine','France','Belgique','Inde','Russie'], datasets: [{ data: [1294,807,505,470,431], backgroundColor: [navy,blue,sky,gold,success] }] },
    options: { indexAxis: 'y', responsive: true, plugins: { legend: { display: false } }, scales: { x: { grid: { color: grid } }, y: { grid: { display: false } } } }
  });
});
</script>
`

  return layout(content, {
    title: 'Dash2',
    description: 'Dashboard Dash2 inspire du prototype Genspark avec style CRADES.',
    path: '/dash2',
  })
}
