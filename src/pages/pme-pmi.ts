import { layout } from '../components/layout'
import { fetchPmePmiData } from '../utils/google-sheets-api'

export async function pmePmiPage(): Promise<string> {
  const data = await fetchPmePmiData()
  const { year, totalVA, employment, contribution, enterprises, sectors, years } = data as any

  // Format numbers
  const fmt = (n: number) => {
    if (Math.abs(n) >= 1000) return (n / 1000).toFixed(1).replace('.', ',') + ' Mds'
    return n.toLocaleString('fr-FR')
  }
  const fmtM = (n: number) => n.toLocaleString('fr-FR')

  // Calculate growth
  const vaGrowth = years.length >= 2 ? ((years[years.length - 1].va - years[years.length - 2].va) / years[years.length - 2].va * 100).toFixed(1) : '0'
  const empGrowth = years.length >= 2 ? ((years[years.length - 1].employment - years[years.length - 2].employment) / years[years.length - 2].employment * 100).toFixed(1) : '0'

  const content = `
<!-- Hero header -->
<section class="bg-brand-navy py-14 lg:py-18">
  <div class="max-w-6xl mx-auto px-4 sm:px-6">
    <nav class="text-xs text-gray-400 mb-4">
      <a href="/" class="hover:text-white">Accueil</a>
      <span class="mx-2 text-gray-600">/</span>
      <span class="text-gray-300">PME/PMI</span>
    </nav>
    <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
      <div>
        <h1 class="font-display text-2xl lg:text-3xl text-white">PME/PMI du Sénégal</h1>
        <p class="text-gray-400 mt-2 text-sm max-w-xl">
          Analyse des petites et moyennes entreprises, leur contribution économique et emplois générés. 
          Dernières données disponibles : <span class="text-brand-gold font-medium">${year}</span>.
        </p>
      </div>
      <div class="flex items-center gap-2 text-xs text-gray-500">
        <i class="fas fa-briefcase"></i>
        <span>Source : Données CRADES / Google Sheets</span>
      </div>
    </div>
  </div>
</section>

<!-- Key figures strip -->
<section class="bg-white border-b border-gray-100">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 py-6">
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-brand-frost rounded-lg p-4 text-center">
        <div class="text-2xl font-bold text-brand-blue">${fmt(totalVA)}</div>
        <div class="text-[11px] text-gray-500 mt-1">Valeur ajoutée (Mds USD)</div>
        <div class="text-[10px] text-gray-400">${year} <span class="text-emerald-500">↑ ${vaGrowth}%</span></div>
      </div>
      <div class="bg-brand-frost rounded-lg p-4 text-center">
        <div class="text-2xl font-bold text-brand-navy">${employment.toLocaleString('fr-FR')}</div>
        <div class="text-[11px] text-gray-500 mt-1">Emplois générés</div>
        <div class="text-[10px] text-gray-400">${year} <span class="text-emerald-500">↑ ${empGrowth}%</span></div>
      </div>
      <div class="bg-brand-frost rounded-lg p-4 text-center">
        <div class="text-2xl font-bold text-emerald-600">${contribution}%</div>
        <div class="text-[11px] text-gray-500 mt-1">Contribution au PIB</div>
        <div class="text-[10px] text-emerald-500">↑ En croissance</div>
      </div>
      <div class="bg-brand-frost rounded-lg p-4 text-center">
        <div class="text-2xl font-bold text-brand-gold">${enterprises.toLocaleString('fr-FR')}</div>
        <div class="text-[11px] text-gray-500 mt-1">Nombre d'entreprises</div>
        <div class="text-[10px] text-gray-400">PME et PMI</div>
      </div>
    </div>
  </div>
</section>

<!-- Charts section -->
<section class="py-10 bg-gray-50">
  <div class="max-w-6xl mx-auto px-4 sm:px-6">
    
    <!-- Row 1: Time series + Sector breakdown -->
    <div class="grid lg:grid-cols-2 gap-6 mb-6">
      <!-- VA evolution -->
      <div class="bg-white border border-gray-100 rounded-lg p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-semibold text-gray-800">Évolution de la valeur ajoutée (Mds USD)</h3>
          <span class="text-[10px] text-gray-400">${years[0]?.year || 2019}–${years[years.length - 1]?.year || 2023}</span>
        </div>
        <div class="bg-gray-50 rounded-md p-3">
          <canvas id="chart-va-evolution" height="200"></canvas>
        </div>
      </div>
      
      <!-- Employment evolution -->
      <div class="bg-white border border-gray-100 rounded-lg p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-semibold text-gray-800">Évolution de l'emploi</h3>
          <span class="text-[10px] text-gray-400">${years[0]?.year || 2019}–${years[years.length - 1]?.year || 2023}</span>
        </div>
        <div class="bg-gray-50 rounded-md p-3">
          <canvas id="chart-employment-evolution" height="200"></canvas>
        </div>
      </div>
    </div>

    <!-- Row 2: Sector breakdown -->
    <div class="grid lg:grid-cols-2 gap-6 mb-6">
      <!-- VA by sector -->
      <div class="bg-white border border-gray-100 rounded-lg p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-semibold text-gray-800">Valeur ajoutée par secteur</h3>
          <span class="text-[10px] text-gray-400">${year}</span>
        </div>
        <div class="bg-gray-50 rounded-md p-3">
          <canvas id="chart-sector-va" height="250"></canvas>
        </div>
      </div>
      
      <!-- Employment by sector -->
      <div class="bg-white border border-gray-100 rounded-lg p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-semibold text-gray-800">Emploi par secteur</h3>
          <span class="text-[10px] text-gray-400">${year}</span>
        </div>
        <div class="bg-gray-50 rounded-md p-3">
          <canvas id="chart-sector-employment" height="250"></canvas>
        </div>
      </div>
    </div>

    <!-- Row 3: Growth and contribution -->
    <div class="grid lg:grid-cols-2 gap-6">
      <!-- Growth rates -->
      <div class="bg-white border border-gray-100 rounded-lg p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-semibold text-gray-800">Taux de croissance par secteur (%)</h3>
          <span class="text-[10px] text-gray-400">${year}</span>
        </div>
        <div class="bg-gray-50 rounded-md p-3">
          <canvas id="chart-sector-growth" height="200"></canvas>
        </div>
      </div>
      
      <!-- Sector share pie -->
      <div class="bg-white border border-gray-100 rounded-lg p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-semibold text-gray-800">Répartition par secteur</h3>
          <span class="text-[10px] text-gray-400">${year}</span>
        </div>
        <div class="bg-gray-50 rounded-md p-3">
          <canvas id="chart-sector-share" height="200"></canvas>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Data tables section -->
<section class="py-10">
  <div class="max-w-6xl mx-auto px-4 sm:px-6">
    <h2 class="font-display text-xl text-gray-800 mb-6">Données détaillées par secteur</h2>
    
    <div class="bg-white border border-gray-100 rounded-lg overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-xs">
          <thead>
            <tr class="bg-gray-50 text-gray-500 text-left">
              <th class="px-4 py-2 font-medium">Secteur</th>
              <th class="px-4 py-2 font-medium text-right">Valeur ajoutée (Mds USD)</th>
              <th class="px-4 py-2 font-medium text-right">Emplois</th>
              <th class="px-4 py-2 font-medium text-right">Part (%)</th>
              <th class="px-4 py-2 font-medium text-right">Croissance (%)</th>
            </tr>
          </thead>
          <tbody>
            ${sectors.map((s: any, i: number) => `
            <tr class="border-t border-gray-50 hover:bg-gray-50/50">
              <td class="px-4 py-2 font-medium text-gray-800">${s.nameFr}</td>
              <td class="px-4 py-2 text-right text-brand-blue">${s.va.toFixed(1)}</td>
              <td class="px-4 py-2 text-right text-gray-600">${s.employment.toLocaleString('fr-FR')}</td>
              <td class="px-4 py-2 text-right">
                <span class="inline-flex items-center gap-1">
                  <span class="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden inline-block"><span class="h-full bg-brand-navy rounded-full block" style="width:${Math.min(s.share * 3, 100)}%"></span></span>
                  <span class="text-gray-500">${s.share}%</span>
                </span>
              </td>
              <td class="px-4 py-2 text-right ${s.growth >= 0 ? 'text-emerald-600' : 'text-red-500'}">${s.growth >= 0 ? '↑' : '↓'} ${Math.abs(s.growth)}%</td>
            </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Years table -->
    <div class="mt-6 bg-white border border-gray-100 rounded-lg overflow-hidden">
      <div class="bg-brand-frost px-4 py-3 border-b border-brand-ice/50">
        <h3 class="text-sm font-semibold text-gray-800"><i class="fas fa-calendar-alt text-brand-gold mr-1"></i> Évolution historique</h3>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-xs">
          <thead>
            <tr class="bg-gray-50 text-gray-500 text-left">
              <th class="px-4 py-2 font-medium">Année</th>
              <th class="px-4 py-2 font-medium text-right">Valeur ajoutée (Mds USD)</th>
              <th class="px-4 py-2 font-medium text-right">Emplois</th>
              <th class="px-4 py-2 font-medium text-right">Entreprises</th>
              <th class="px-4 py-2 font-medium text-right">Contribution PIB (%)</th>
            </tr>
          </thead>
          <tbody>
            ${years.map((y: any) => `
            <tr class="border-t border-gray-50 hover:bg-gray-50/50">
              <td class="px-4 py-2 font-medium text-gray-800">${y.year}</td>
              <td class="px-4 py-2 text-right text-brand-blue">${y.va.toFixed(1)}</td>
              <td class="px-4 py-2 text-right text-gray-600">${y.employment.toLocaleString('fr-FR')}</td>
              <td class="px-4 py-2 text-right text-gray-600">${y.enterprises.toLocaleString('fr-FR')}</td>
              <td class="px-4 py-2 text-right text-emerald-600">${y.contribution}%</td>
            </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  </div>
</section>

<!-- Source & API info -->
<section class="bg-brand-frost border-t border-brand-ice/50 py-8">
  <div class="max-w-6xl mx-auto px-4 sm:px-6">
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <p class="text-xs text-gray-500"><i class="fas fa-info-circle mr-1"></i> Source : <a href="https://docs.google.com/spreadsheets/d/e/2PACX-1vQeX4P7DvfCLKCJhZUtddRKdI6aLL-6REtHCcViM0any024weZO8r-OazmmJGgc6MbZlvROXzfxjo4T/pub?output=csv" target="_blank" class="text-brand-blue hover:underline">Google Sheets</a> — Données PME/PMI Sénégal</p>
        <p class="text-[10px] text-gray-400 mt-1">Les données sont extraites automatiquement depuis la feuille de calcul. Mis à jour automatiquement.</p>
      </div>
      <div class="flex items-center gap-3">
        <a href="/api/pme-pmi" target="_blank" class="text-[10px] bg-white border border-gray-200 px-3 py-1.5 rounded hover:border-gray-300 text-gray-500 transition-colors">
          <i class="fas fa-code mr-1"></i> API JSON
        </a>
      </div>
    </div>
  </div>
</section>

<!-- Chart.js scripts -->
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
document.addEventListener('DOMContentLoaded', () => {
  const fontFamily = "'Montserrat', sans-serif";
  const gridColor = '#f1f5f9';
  const blue = '#044bad';
  const navy = '#032d6b';
  const gold = '#b8943e';
  const green = '#059669';
  const red = '#dc2626';

  const yearsData = ${JSON.stringify(years)};
  const sectorsData = ${JSON.stringify(sectors)};

  // ─── 1. VA Evolution (Line) ────
  new Chart(document.getElementById('chart-va-evolution'), {
    type: 'line',
    data: {
      labels: yearsData.map(y => y.year),
      datasets: [{
        label: 'Valeur ajoutée',
        data: yearsData.map(y => y.va),
        borderColor: blue,
        backgroundColor: blue + '15',
        fill: true,
        tension: 0.3,
        pointRadius: 4,
        borderWidth: 2,
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => ctx.dataset.label + ': ' + ctx.parsed.y.toFixed(1) + ' Mds USD' } }
      },
      scales: {
        y: { beginAtZero: true, grid: { color: gridColor }, ticks: { font: { size: 10 }, callback: v => v.toFixed(1) } },
        x: { grid: { display: false }, ticks: { font: { size: 10 } } }
      }
    }
  });

  // ─── 2. Employment Evolution (Line) ────
  new Chart(document.getElementById('chart-employment-evolution'), {
    type: 'line',
    data: {
      labels: yearsData.map(y => y.year),
      datasets: [{
        label: 'Emplois',
        data: yearsData.map(y => y.employment),
        borderColor: navy,
        backgroundColor: navy + '15',
        fill: true,
        tension: 0.3,
        pointRadius: 4,
        borderWidth: 2,
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => ctx.dataset.label + ': ' + ctx.parsed.y.toLocaleString('fr-FR') } }
      },
      scales: {
        y: { beginAtZero: false, grid: { color: gridColor }, ticks: { font: { size: 10 }, callback: v => (v/1000).toFixed(0) + 'k' } },
        x: { grid: { display: false }, ticks: { font: { size: 10 } } }
      }
    }
  });

  // ─── 3. VA by Sector (Horizontal bar) ────
  new Chart(document.getElementById('chart-sector-va'), {
    type: 'bar',
    data: {
      labels: sectorsData.map(s => s.nameFr),
      datasets: [{
        label: 'Valeur ajoutée (Mds USD)',
        data: sectorsData.map(s => s.va),
        backgroundColor: blue + '80',
        borderColor: blue,
        borderWidth: 1,
        borderRadius: 3,
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => ctx.parsed.x.toFixed(1) + ' Mds USD' } }
      },
      scales: {
        x: { grid: { color: gridColor }, ticks: { font: { size: 10 }, callback: v => v.toFixed(1) } },
        y: { grid: { display: false }, ticks: { font: { size: 10 } } }
      }
    }
  });

  // ─── 4. Employment by Sector (Horizontal bar) ────
  new Chart(document.getElementById('chart-sector-employment'), {
    type: 'bar',
    data: {
      labels: sectorsData.map(s => s.nameFr),
      datasets: [{
        label: 'Emplois',
        data: sectorsData.map(s => s.employment),
        backgroundColor: navy + '80',
        borderColor: navy,
        borderWidth: 1,
        borderRadius: 3,
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => ctx.parsed.x.toLocaleString('fr-FR') + ' emplois' } }
      },
      x: { grid: { color: gridColor }, ticks: { font: { size: 10 }, callback: v => (v/1000).toFixed(0) + 'k' } },
      y: { grid: { display: false }, ticks: { font: { size: 10 } } }
    }
  });

  // ─── 5. Growth by Sector (Bar) ────
  const sectorColors = [blue, navy, gold, green, '#7c3aed', '#0d9488', '#ea580c', '#6366f1'];
  new Chart(document.getElementById('chart-sector-growth'), {
    type: 'bar',
    data: {
      labels: sectorsData.map(s => s.nameFr),
      datasets: [{
        label: 'Croissance (%)',
        data: sectorsData.map(s => s.growth),
        backgroundColor: sectorsData.map(s => (s.growth >= 0 ? green : red) + '80'),
        borderColor: sectorsData.map(s => s.growth >= 0 ? green : red),
        borderWidth: 1,
        borderRadius: 3,
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => (ctx.parsed.y >= 0 ? '+' : '') + ctx.parsed.y.toFixed(1) + '%' } }
      },
      scales: {
        y: { grid: { color: gridColor }, ticks: { font: { size: 10 }, callback: v => (v >= 0 ? '+' : '') + v + '%' } },
        x: { grid: { display: false }, ticks: { font: { size: 9 } } }
      }
    }
  });

  // ─── 6. Sector Share (Doughnut) ────
  new Chart(document.getElementById('chart-sector-share'), {
    type: 'doughnut',
    data: {
      labels: sectorsData.map(s => s.nameFr),
      datasets: [{
        data: sectorsData.map(s => s.share),
        backgroundColor: sectorsData.map((_, i) => sectorColors[i % sectorColors.length]),
        borderWidth: 1,
        borderColor: '#fff',
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'right', labels: { font: { size: 10 }, boxWidth: 12 } },
        tooltip: { callbacks: { label: ctx => ctx.label + ': ' + ctx.parsed + '%' } }
      }
    }
  });
});
</script>
`
  return layout(content, { 
    title: 'PME/PMI',
    description: 'Données et analyses sur les PME/PMI du Sénégal',
    path: '/pme-pmi' 
  })
}
