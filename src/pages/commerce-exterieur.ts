import { layout } from '../components/layout'
import { getTradeDashboardData } from '../utils/wits-api'

export async function commerceExterieurPage(): Promise<string> {
  const data = await getTradeDashboardData()
  const { overview, timeSeries, sectors, topExportPartners, topImportPartners, latestYear, latestReleaseYear } = data as any

  // Format numbers
  const fmt = (n: number) => {
    if (Math.abs(n) >= 1000) return (n / 1000).toFixed(1).replace('.', ',') + ' Mds'
    return n.toLocaleString('fr-FR')
  }
  const fmtM = (n: number) => n.toLocaleString('fr-FR')

  // Overview cards
  const totalExports = overview ? Math.round(overview.totalExports / 1000) : 0
  const totalImports = overview ? Math.round(overview.totalImports / 1000) : 0
  const tradeBalance = overview ? Math.round(overview.tradeBalance / 1000) : 0
  const tradeVolume = totalExports + totalImports

  const content = `
<!-- Hero header -->
<section class="bg-brand-navy py-14 lg:py-18">
  <div class="max-w-6xl mx-auto px-4 sm:px-6">
    <nav class="text-xs text-gray-400 mb-4">
      <a href="/" class="hover:text-white">Accueil</a>
      <span class="mx-2 text-gray-600">/</span>
      <span class="text-gray-300">Commerce extérieur</span>
    </nav>
    <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
      <div>
        <h1 class="font-display text-2xl lg:text-3xl text-white">Commerce extérieur du Sénégal</h1>
        <p class="text-gray-400 mt-2 text-sm max-w-xl">
          Données d'importation et d'exportation issues de la base WITS (Banque Mondiale). 
          Dernières données disponibles : <span class="text-brand-gold font-medium">${latestYear}</span>.
        </p>
      </div>
      <div class="flex items-center gap-2 text-xs text-gray-500">
        <i class="fas fa-database"></i>
        <span>Source : WITS / Banque Mondiale</span>
      </div>
    </div>
  </div>
</section>

<!-- Key figures strip -->
<section class="bg-white border-b border-gray-100">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 py-6">
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-brand-frost rounded-lg p-4 text-center">
        <div class="text-2xl font-bold text-brand-blue">${fmt(totalExports)}</div>
        <div class="text-[11px] text-gray-500 mt-1">Exportations (M USD)</div>
        <div class="text-[10px] text-gray-400">${latestYear}</div>
      </div>
      <div class="bg-brand-frost rounded-lg p-4 text-center">
        <div class="text-2xl font-bold text-brand-navy">${fmt(totalImports)}</div>
        <div class="text-[11px] text-gray-500 mt-1">Importations (M USD)</div>
        <div class="text-[10px] text-gray-400">${latestYear}</div>
      </div>
      <div class="bg-brand-frost rounded-lg p-4 text-center">
        <div class="text-2xl font-bold ${tradeBalance >= 0 ? 'text-emerald-600' : 'text-red-600'}">${fmt(tradeBalance)}</div>
        <div class="text-[11px] text-gray-500 mt-1">Balance commerciale (M USD)</div>
        <div class="text-[10px] ${tradeBalance >= 0 ? 'text-emerald-500' : 'text-red-400'}">${tradeBalance >= 0 ? '↑ Excédentaire' : '↓ Déficitaire'}</div>
      </div>
      <div class="bg-brand-frost rounded-lg p-4 text-center">
        <div class="text-2xl font-bold text-brand-gold">${fmt(tradeVolume)}</div>
        <div class="text-[11px] text-gray-500 mt-1">Volume commercial (M USD)</div>
        <div class="text-[10px] text-gray-400">Export + Import</div>
      </div>
    </div>
  </div>
</section>

<!-- Charts section -->
<section class="py-10 bg-gray-50">
  <div class="max-w-6xl mx-auto px-4 sm:px-6">
    
    <!-- Row 1: Time series + Balance -->
    <div class="grid lg:grid-cols-2 gap-6 mb-6">
      <!-- Trade evolution -->
      <div class="bg-white border border-gray-100 rounded-lg p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-semibold text-gray-800">Évolution du commerce (M USD)</h3>
          <span class="text-[10px] text-gray-400">${timeSeries.years[0]}–${timeSeries.years[timeSeries.years.length - 1]}</span>
        </div>
        <div class="bg-gray-50 rounded-md p-3">
          <canvas id="chart-trade-evolution" height="200"></canvas>
        </div>
      </div>
      
      <!-- Trade balance -->
      <div class="bg-white border border-gray-100 rounded-lg p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-semibold text-gray-800">Balance commerciale (M USD)</h3>
          <span class="text-[10px] text-gray-400">${timeSeries.years[0]}–${timeSeries.years[timeSeries.years.length - 1]}</span>
        </div>
        <div class="bg-gray-50 rounded-md p-3">
          <canvas id="chart-trade-balance" height="200"></canvas>
        </div>
      </div>
    </div>

    <!-- Row 2: Top partners -->
    <div class="grid lg:grid-cols-2 gap-6 mb-6">
      <!-- Top export partners -->
      <div class="bg-white border border-gray-100 rounded-lg p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-semibold text-gray-800">Top 10 destinations d'exportation</h3>
          <span class="text-[10px] text-gray-400">${latestYear}</span>
        </div>
        <div class="bg-gray-50 rounded-md p-3">
          <canvas id="chart-export-partners" height="250"></canvas>
        </div>
      </div>
      
      <!-- Top import partners -->
      <div class="bg-white border border-gray-100 rounded-lg p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-semibold text-gray-800">Top 10 fournisseurs (importations)</h3>
          <span class="text-[10px] text-gray-400">${latestYear}</span>
        </div>
        <div class="bg-gray-50 rounded-md p-3">
          <canvas id="chart-import-partners" height="250"></canvas>
        </div>
      </div>
    </div>

    <!-- Row 3: Sectors -->
    <div class="grid lg:grid-cols-2 gap-6">
      <!-- Export by sector -->
      <div class="bg-white border border-gray-100 rounded-lg p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-semibold text-gray-800">Exportations par secteur (M USD)</h3>
          <span class="text-[10px] text-gray-400">${latestYear}</span>
        </div>
        <div class="bg-gray-50 rounded-md p-3">
          <canvas id="chart-export-sectors" height="300"></canvas>
        </div>
      </div>
      
      <!-- Import by sector -->
      <div class="bg-white border border-gray-100 rounded-lg p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-semibold text-gray-800">Importations par secteur (M USD)</h3>
          <span class="text-[10px] text-gray-400">${latestYear}</span>
        </div>
        <div class="bg-gray-50 rounded-md p-3">
          <canvas id="chart-import-sectors" height="300"></canvas>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Data tables section -->
<section class="py-10">
  <div class="max-w-6xl mx-auto px-4 sm:px-6">
    <h2 class="font-display text-xl text-gray-800 mb-6">Données détaillées</h2>
    
    <div class="grid lg:grid-cols-2 gap-6">
      <!-- Export partners table -->
      <div class="bg-white border border-gray-100 rounded-lg overflow-hidden">
        <div class="bg-brand-frost px-4 py-3 border-b border-brand-ice/50">
          <h3 class="text-sm font-semibold text-gray-800"><i class="fas fa-arrow-up text-emerald-500 mr-1"></i> Principales destinations (${latestYear})</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-xs">
            <thead>
              <tr class="bg-gray-50 text-gray-500 text-left">
                <th class="px-4 py-2 font-medium">#</th>
                <th class="px-4 py-2 font-medium">Pays</th>
                <th class="px-4 py-2 font-medium text-right">Valeur (M USD)</th>
                <th class="px-4 py-2 font-medium text-right">Part (%)</th>
              </tr>
            </thead>
            <tbody>
              ${topExportPartners.map((p, i) => `
              <tr class="border-t border-gray-50 hover:bg-gray-50/50">
                <td class="px-4 py-2 text-gray-400">${i + 1}</td>
                <td class="px-4 py-2 font-medium text-gray-800">${p.name}</td>
                <td class="px-4 py-2 text-right text-gray-600">${fmtM(p.value)}</td>
                <td class="px-4 py-2 text-right">
                  <span class="inline-flex items-center gap-1">
                    <span class="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden inline-block"><span class="h-full bg-brand-blue rounded-full block" style="width:${Math.min(p.share * 2, 100)}%"></span></span>
                    <span class="text-gray-500">${p.share}%</span>
                  </span>
                </td>
              </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Import partners table -->
      <div class="bg-white border border-gray-100 rounded-lg overflow-hidden">
        <div class="bg-brand-frost px-4 py-3 border-b border-brand-ice/50">
          <h3 class="text-sm font-semibold text-gray-800"><i class="fas fa-arrow-down text-red-400 mr-1"></i> Principaux fournisseurs (${latestYear})</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-xs">
            <thead>
              <tr class="bg-gray-50 text-gray-500 text-left">
                <th class="px-4 py-2 font-medium">#</th>
                <th class="px-4 py-2 font-medium">Pays</th>
                <th class="px-4 py-2 font-medium text-right">Valeur (M USD)</th>
                <th class="px-4 py-2 font-medium text-right">Part (%)</th>
              </tr>
            </thead>
            <tbody>
              ${topImportPartners.map((p, i) => `
              <tr class="border-t border-gray-50 hover:bg-gray-50/50">
                <td class="px-4 py-2 text-gray-400">${i + 1}</td>
                <td class="px-4 py-2 font-medium text-gray-800">${p.name}</td>
                <td class="px-4 py-2 text-right text-gray-600">${fmtM(p.value)}</td>
                <td class="px-4 py-2 text-right">
                  <span class="inline-flex items-center gap-1">
                    <span class="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden inline-block"><span class="h-full bg-brand-navy rounded-full block" style="width:${Math.min(p.share * 2, 100)}%"></span></span>
                    <span class="text-gray-500">${p.share}%</span>
                  </span>
                </td>
              </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Sectors table -->
    <div class="mt-6 bg-white border border-gray-100 rounded-lg overflow-hidden">
      <div class="bg-brand-frost px-4 py-3 border-b border-brand-ice/50">
        <h3 class="text-sm font-semibold text-gray-800"><i class="fas fa-boxes-stacked text-brand-gold mr-1"></i> Commerce par catégorie de produits (${latestYear})</h3>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-xs">
          <thead>
            <tr class="bg-gray-50 text-gray-500 text-left">
              <th class="px-4 py-2 font-medium">Secteur</th>
              <th class="px-4 py-2 font-medium text-right">Exports (M USD)</th>
              <th class="px-4 py-2 font-medium text-right">Imports (M USD)</th>
              <th class="px-4 py-2 font-medium text-right">Balance (M USD)</th>
              <th class="px-4 py-2 font-medium text-right">Volume total</th>
            </tr>
          </thead>
          <tbody>
            ${sectors.map(s => {
              const bal = s.exports - s.imports
              return `
              <tr class="border-t border-gray-50 hover:bg-gray-50/50">
                <td class="px-4 py-2 font-medium text-gray-800">${s.nameFr}</td>
                <td class="px-4 py-2 text-right text-emerald-600">${fmtM(s.exports)}</td>
                <td class="px-4 py-2 text-right text-red-500">${fmtM(s.imports)}</td>
                <td class="px-4 py-2 text-right ${bal >= 0 ? 'text-emerald-600' : 'text-red-500'}">${bal >= 0 ? '+' : ''}${fmtM(bal)}</td>
                <td class="px-4 py-2 text-right text-gray-600">${fmtM(s.exports + s.imports)}</td>
              </tr>`
            }).join('')}
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
        <p class="text-xs text-gray-500"><i class="fas fa-info-circle mr-1"></i> Source : <a href="https://wits.worldbank.org" target="_blank" class="text-brand-blue hover:underline">WITS</a> — World Integrated Trade Solution (Banque Mondiale)</p>
        <p class="text-[10px] text-gray-400 mt-1">Les valeurs sont en milliers de dollars US (USD). Données mises à jour annuellement.</p>
      </div>
      <div class="flex items-center gap-3">
        <a href="/api/trade/overview" target="_blank" class="text-[10px] bg-white border border-gray-200 px-3 py-1.5 rounded hover:border-gray-300 text-gray-500 transition-colors">
          <i class="fas fa-code mr-1"></i> API JSON
        </a>
        <a href="/api/trade/dashboard" target="_blank" class="text-[10px] bg-white border border-gray-200 px-3 py-1.5 rounded hover:border-gray-300 text-gray-500 transition-colors">
          <i class="fas fa-database mr-1"></i> Toutes les données
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
  const lightBlue = '#3a7fd4';
  const red = '#dc2626';
  const green = '#059669';

  // ─── 1. Trade Evolution (Line) ────
  const tsData = ${JSON.stringify(timeSeries)};
  new Chart(document.getElementById('chart-trade-evolution'), {
    type: 'line',
    data: {
      labels: tsData.years,
      datasets: [
        {
          label: 'Exportations',
          data: tsData.exports,
          borderColor: blue,
          backgroundColor: blue + '15',
          fill: true,
          tension: 0.3,
          pointRadius: 3,
          borderWidth: 2,
        },
        {
          label: 'Importations',
          data: tsData.imports,
          borderColor: navy,
          backgroundColor: navy + '10',
          fill: true,
          tension: 0.3,
          pointRadius: 3,
          borderWidth: 2,
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom', labels: { font: { size: 10, family: fontFamily }, boxWidth: 12 } },
        tooltip: { callbacks: { label: ctx => ctx.dataset.label + ': ' + ctx.parsed.y.toLocaleString('fr-FR') + ' M USD' } }
      },
      scales: {
        y: { beginAtZero: true, grid: { color: gridColor }, ticks: { font: { size: 10 }, callback: v => v.toLocaleString('fr-FR') } },
        x: { grid: { display: false }, ticks: { font: { size: 10 } } }
      }
    }
  });

  // ─── 2. Trade Balance (Bar) ────
  new Chart(document.getElementById('chart-trade-balance'), {
    type: 'bar',
    data: {
      labels: tsData.years,
      datasets: [{
        label: 'Balance commerciale',
        data: tsData.balance,
        backgroundColor: tsData.balance.map(v => v >= 0 ? green + '80' : red + '80'),
        borderColor: tsData.balance.map(v => v >= 0 ? green : red),
        borderWidth: 1,
        borderRadius: 3,
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => 'Balance: ' + ctx.parsed.y.toLocaleString('fr-FR') + ' M USD' } }
      },
      scales: {
        y: { grid: { color: gridColor }, ticks: { font: { size: 10 }, callback: v => v.toLocaleString('fr-FR') } },
        x: { grid: { display: false }, ticks: { font: { size: 10 } } }
      }
    }
  });

  // ─── 3. Export Partners (Horizontal bar) ────
  const expPartners = ${JSON.stringify(topExportPartners)};
  new Chart(document.getElementById('chart-export-partners'), {
    type: 'bar',
    data: {
      labels: expPartners.map(p => p.name),
      datasets: [{
        label: 'Exportations (M USD)',
        data: expPartners.map(p => p.value),
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
        tooltip: { callbacks: { label: ctx => ctx.parsed.x.toLocaleString('fr-FR') + ' M USD (' + expPartners[ctx.dataIndex].share + '%)' } }
      },
      scales: {
        x: { grid: { color: gridColor }, ticks: { font: { size: 10 }, callback: v => v.toLocaleString('fr-FR') } },
        y: { grid: { display: false }, ticks: { font: { size: 10 } } }
      }
    }
  });

  // ─── 4. Import Partners (Horizontal bar) ────
  const impPartners = ${JSON.stringify(topImportPartners)};
  new Chart(document.getElementById('chart-import-partners'), {
    type: 'bar',
    data: {
      labels: impPartners.map(p => p.name),
      datasets: [{
        label: 'Importations (M USD)',
        data: impPartners.map(p => p.value),
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
        tooltip: { callbacks: { label: ctx => ctx.parsed.x.toLocaleString('fr-FR') + ' M USD (' + impPartners[ctx.dataIndex].share + '%)' } }
      },
      scales: {
        x: { grid: { color: gridColor }, ticks: { font: { size: 10 }, callback: v => v.toLocaleString('fr-FR') } },
        y: { grid: { display: false }, ticks: { font: { size: 10 } } }
      }
    }
  });

  // ─── 5. Export Sectors (Horizontal bar) ────
  const sectors = ${JSON.stringify(sectors)};
  const sectorColors = [blue, navy, gold, lightBlue, '#7c3aed', '#0d9488', '#ea580c', '#6366f1', '#84cc16', '#f43f5e', '#06b6d4', '#a855f7', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];
  
  new Chart(document.getElementById('chart-export-sectors'), {
    type: 'bar',
    data: {
      labels: sectors.map(s => s.nameFr),
      datasets: [{
        label: 'Exportations (M USD)',
        data: sectors.map(s => s.exports),
        backgroundColor: sectors.map((_, i) => sectorColors[i % sectorColors.length] + '70'),
        borderColor: sectors.map((_, i) => sectorColors[i % sectorColors.length]),
        borderWidth: 1,
        borderRadius: 2,
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: gridColor }, ticks: { font: { size: 9 }, callback: v => v.toLocaleString('fr-FR') } },
        y: { grid: { display: false }, ticks: { font: { size: 9 } } }
      }
    }
  });

  // ─── 6. Import Sectors (Horizontal bar) ────
  new Chart(document.getElementById('chart-import-sectors'), {
    type: 'bar',
    data: {
      labels: sectors.map(s => s.nameFr),
      datasets: [{
        label: 'Importations (M USD)',
        data: sectors.map(s => s.imports),
        backgroundColor: sectors.map((_, i) => sectorColors[i % sectorColors.length] + '70'),
        borderColor: sectors.map((_, i) => sectorColors[i % sectorColors.length]),
        borderWidth: 1,
        borderRadius: 2,
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: gridColor }, ticks: { font: { size: 9 }, callback: v => v.toLocaleString('fr-FR') } },
        y: { grid: { display: false }, ticks: { font: { size: 9 } } }
      }
    }
  });
});
</script>
`

  return layout(content, {
    title: 'Commerce extérieur',
    description: 'Tableau de bord du commerce extérieur du Sénégal — données WITS (Banque Mondiale)',
    path: '/commerce-exterieur',
  })
}
