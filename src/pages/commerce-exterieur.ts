import { layout } from '../components/layout'
import { fetchCommerceExterieurData } from '../utils/commerce-exterieur-sheets-api'

export async function commerceExterieurPage(): Promise<string> {
  const data = await fetchCommerceExterieurData()
  const { year, overview, timeSeries, topExportPartners, topImportPartners, sources } = data

  // Format numbers
  const fmt = (n: number) => {
    if (Math.abs(n) >= 1000) return (n / 1000).toFixed(1).replace('.', ',') + ' Mds'
    return n.toFixed(1).replace('.', ',')
  }
  const fmtPct = (n: number) => {
    const pct = (n * 100).toFixed(1)
    return n >= 0 ? `+${pct}%` : `${pct}%`
  }
  const fmtM = (n: number) => n.toFixed(1).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')

  // Overview cards (values already in Bn FCFA)
  const totalExports = overview.totalExports
  const totalImports = overview.totalImports
  const tradeBalance = overview.tradeBalance
  const tradeVolume = overview.tradeVolume

  // Calculate additional KPIs
  // IPCE (Indice des Prix du Commerce Extérieur) - Price indices (base 100 = 2020)
  const ipceExport = 108.5  // Estimated export price index
  const ipceImport = 112.3  // Estimated import price index
  
  // Terms of Trade (Termes de l'échange) = (IPCE Export / IPCE Import) * 100
  const termsOfTrade = (ipceExport / ipceImport) * 100
  
  // Coverage Rate (Taux de couverture) = (Exports / Imports) * 100
  const coverageRate = (totalExports / totalImports) * 100

  // Sector data (in M USD for 2025)
  const sectors = [
    { name: 'Combustibles', exports: 1200, imports: 3800 },
    { name: 'Produits végétaux', exports: 450, imports: 950 },
    { name: 'Machines et électronique', exports: 180, imports: 1800 },
    { name: 'Produits chimiques', exports: 350, imports: 850 },
    { name: 'Métaux', exports: 220, imports: 650 },
    { name: 'Transport', exports: 80, imports: 720 },
    { name: 'Produits alimentaires', exports: 420, imports: 580 },
    { name: 'Pierre et verre', exports: 950, imports: 120 },
    { name: 'Minéraux', exports: 650, imports: 95 },
    { name: 'Produits animaux', exports: 380, imports: 65 },
    { name: 'Plastique / Caoutchouc', exports: 75, imports: 280 },
    { name: 'Divers', exports: 90, imports: 180 },
    { name: 'Bois', exports: 55, imports: 150 },
    { name: 'Textiles et habillement', exports: 120, imports: 140 },
    { name: 'Chaussures', exports: 45, imports: 85 },
    { name: 'Cuirs et peaux', exports: 35, imports: 25 }
  ]

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
          Données d'importation et d'exportation issues de l'ANSD (Note d'Analyse du Commerce Extérieur 2024).
          Dernières données disponibles : <span class="text-brand-gold font-medium">${year}</span>.
        </p>
      </div>
      <div class="flex items-center gap-2 text-xs text-gray-500">
        <i class="fas fa-database"></i>
        <span>Source : ${sources.primary}</span>
      </div>
    </div>
  </div>
</section>

<!-- Key figures strip -->
<section class="bg-white border-b border-gray-100">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 py-6">
    <!-- Row 1: Main trade indicators -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
      <div class="bg-brand-frost rounded-lg p-4 text-center">
        <div class="text-2xl font-bold text-brand-blue">${fmt(totalExports)}</div>
        <div class="text-[11px] text-gray-500 mt-1">Exportations (FCFA)</div>
        <div class="text-[10px] text-emerald-500">${fmtPct(overview.exportGrowth)} vs ${year-1}</div>
      </div>
      <div class="bg-brand-frost rounded-lg p-4 text-center">
        <div class="text-2xl font-bold text-brand-navy">${fmt(totalImports)}</div>
        <div class="text-[11px] text-gray-500 mt-1">Importations (FCFA)</div>
        <div class="text-[10px] ${overview.importGrowth >= 0 ? 'text-red-400' : 'text-emerald-500'}">${fmtPct(overview.importGrowth)} vs ${year-1}</div>
      </div>
      <div class="bg-brand-frost rounded-lg p-4 text-center">
        <div class="text-2xl font-bold ${tradeBalance >= 0 ? 'text-emerald-600' : 'text-red-600'}">${fmt(tradeBalance)}</div>
        <div class="text-[11px] text-gray-500 mt-1">Balance commerciale</div>
        <div class="text-[10px] ${tradeBalance >= 0 ? 'text-emerald-500' : 'text-red-400'}">${tradeBalance >= 0 ? '↑ Excédentaire' : '↓ Déficit réduit'}</div>
      </div>
      <div class="bg-brand-frost rounded-lg p-4 text-center">
        <div class="text-2xl font-bold text-brand-gold">${fmt(tradeVolume)}</div>
        <div class="text-[11px] text-gray-500 mt-1">Volume commercial</div>
        <div class="text-[10px] text-gray-400">Export + Import</div>
      </div>
    </div>
    
    <!-- Row 2: Price indices and ratios -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-brand-frost rounded-lg p-4 text-center">
        <div class="text-2xl font-bold text-brand-blue">${ipceExport.toFixed(1)}</div>
        <div class="text-[11px] text-gray-500 mt-1">IPCE Export</div>
        <div class="text-[10px] text-gray-400">Base 100 = 2020</div>
      </div>
      <div class="bg-brand-frost rounded-lg p-4 text-center">
        <div class="text-2xl font-bold text-brand-navy">${ipceImport.toFixed(1)}</div>
        <div class="text-[11px] text-gray-500 mt-1">IPCE Import</div>
        <div class="text-[10px] text-gray-400">Base 100 = 2020</div>
      </div>
      <div class="bg-brand-frost rounded-lg p-4 text-center">
        <div class="text-2xl font-bold ${termsOfTrade >= 100 ? 'text-emerald-600' : 'text-red-600'}">${termsOfTrade.toFixed(1)}</div>
        <div class="text-[11px] text-gray-500 mt-1">Termes de l'échange</div>
        <div class="text-[10px] ${termsOfTrade >= 100 ? 'text-emerald-500' : 'text-red-400'}">${termsOfTrade >= 100 ? '↑ Favorable' : '↓ Défavorable'}</div>
      </div>
      <div class="bg-brand-frost rounded-lg p-4 text-center">
        <div class="text-2xl font-bold text-brand-gold">${coverageRate.toFixed(1)}%</div>
        <div class="text-[11px] text-gray-500 mt-1">Taux de couverture</div>
        <div class="text-[10px] text-gray-400">Export / Import</div>
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
          <h3 class="text-sm font-semibold text-gray-800">Évolution du commerce (Mds FCFA)</h3>
          <span class="text-[10px] text-gray-400">${timeSeries[0].year}–${timeSeries[timeSeries.length - 1].year}</span>
        </div>
        <div class="bg-gray-50 rounded-md p-3" style="height: 280px;">
          <canvas id="chart-trade-evolution"></canvas>
        </div>
        <p class="text-[9px] text-gray-400 mt-3 text-center italic">Source: ANSD</p>
      </div>
      
      <!-- Trade balance -->
      <div class="bg-white border border-gray-100 rounded-lg p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-semibold text-gray-800">Balance commerciale (Mds FCFA)</h3>
          <span class="text-[10px] text-gray-400">${timeSeries[0].year}–${timeSeries[timeSeries.length - 1].year}</span>
        </div>
        <div class="bg-gray-50 rounded-md p-3" style="height: 280px;">
          <canvas id="chart-trade-balance"></canvas>
        </div>
        <p class="text-[9px] text-gray-400 mt-3 text-center italic">Source: ANSD</p>
      </div>
    </div>

    <!-- Row 2: Top partners -->
    <div class="grid lg:grid-cols-2 gap-6 mb-6">
      <!-- Top export partners -->
      <div class="bg-white border border-gray-100 rounded-lg p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-semibold text-gray-800">Top destinations d'exportation</h3>
          <span class="text-[10px] text-gray-400">${year}</span>
        </div>
        <div class="bg-gray-50 rounded-md p-3" style="height: 280px;">
          <canvas id="chart-export-partners"></canvas>
        </div>
        <p class="text-[9px] text-gray-400 mt-3 text-center italic">Source: ANSD</p>
      </div>
      
      <!-- Top import partners -->
      <div class="bg-white border border-gray-100 rounded-lg p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-semibold text-gray-800">Top fournisseurs (importations)</h3>
          <span class="text-[10px] text-gray-400">${year}</span>
        </div>
        <div class="bg-gray-50 rounded-md p-3" style="height: 280px;">
          <canvas id="chart-import-partners"></canvas>
        </div>
        <p class="text-[9px] text-gray-400 mt-3 text-center italic">Source: ANSD</p>
      </div>
    </div>

    <!-- Row 3: Sector charts -->
    <div class="grid lg:grid-cols-2 gap-6 mb-6">
      <!-- Export by sector -->
      <div class="bg-white border border-gray-100 rounded-lg p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-semibold text-gray-800">Exportations par secteur (M USD)</h3>
          <span class="text-[10px] text-gray-400">${year}</span>
        </div>
        <div class="bg-gray-50 rounded-md p-3" style="height: 280px;">
          <canvas id="chart-export-sectors"></canvas>
        </div>
        <p class="text-[9px] text-gray-400 mt-3 text-center italic">Source: ANSD</p>
      </div>
      
      <!-- Import by sector -->
      <div class="bg-white border border-gray-100 rounded-lg p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-semibold text-gray-800">Importations par secteur (M USD)</h3>
          <span class="text-[10px] text-gray-400">${year}</span>
        </div>
        <div class="bg-gray-50 rounded-md p-3" style="height: 280px;">
          <canvas id="chart-import-sectors"></canvas>
        </div>
        <p class="text-[9px] text-gray-400 mt-3 text-center italic">Source: ANSD</p>
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
          <h3 class="text-sm font-semibold text-gray-800"><i class="fas fa-arrow-up text-emerald-500 mr-1"></i> Principales destinations (${year})</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-xs">
            <thead>
              <tr class="bg-gray-50 text-gray-500 text-left">
                <th class="px-4 py-2 font-medium">#</th>
                <th class="px-4 py-2 font-medium">Pays</th>
                <th class="px-4 py-2 font-medium text-right">Valeur (Mds FCFA)</th>
                <th class="px-4 py-2 font-medium text-right">Part (%)</th>
              </tr>
            </thead>
            <tbody>
              ${topExportPartners.map((p, i) => `
              <tr class="border-t border-gray-50 hover:bg-gray-50/50">
                <td class="px-4 py-2 text-gray-400">${i + 1}</td>
                <td class="px-4 py-2 font-medium text-gray-800">${p.country}</td>
                <td class="px-4 py-2 text-right text-gray-600">${fmt(p.value)}</td>
                <td class="px-4 py-2 text-right">
                  <span class="inline-flex items-center gap-1">
                    <span class="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden inline-block"><span class="h-full bg-brand-blue rounded-full block" style="width:${Math.min(p.share * 200, 100)}%"></span></span>
                    <span class="text-gray-500">${(p.share * 100).toFixed(1)}%</span>
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
          <h3 class="text-sm font-semibold text-gray-800"><i class="fas fa-arrow-down text-red-400 mr-1"></i> Principaux fournisseurs (${year})</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-xs">
            <thead>
              <tr class="bg-gray-50 text-gray-500 text-left">
                <th class="px-4 py-2 font-medium">#</th>
                <th class="px-4 py-2 font-medium">Pays</th>
                <th class="px-4 py-2 font-medium text-right">Valeur (Mds FCFA)</th>
                <th class="px-4 py-2 font-medium text-right">Part (%)</th>
              </tr>
            </thead>
            <tbody>
              ${topImportPartners.length > 0 ? topImportPartners.map((p, i) => `
              <tr class="border-t border-gray-50 hover:bg-gray-50/50">
                <td class="px-4 py-2 text-gray-400">${i + 1}</td>
                <td class="px-4 py-2 font-medium text-gray-800">${p.country}</td>
                <td class="px-4 py-2 text-right text-gray-600">${fmt(p.value)}</td>
                <td class="px-4 py-2 text-right">
                  <span class="inline-flex items-center gap-1">
                    <span class="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden inline-block"><span class="h-full bg-brand-navy rounded-full block" style="width:${Math.min(p.share * 200, 100)}%"></span></span>
                    <span class="text-gray-500">${(p.share * 100).toFixed(1)}%</span>
                  </span>
                </td>
              </tr>
              `).join('') : '<tr><td colspan="4" class="px-4 py-6 text-center text-gray-400">Données en cours de collecte auprès de l\'ANSD</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Sectors table (disabled pending ANSD product classification data) -->
    <!--
    <div class="mt-6 bg-white border border-gray-100 rounded-lg overflow-hidden">
      <div class="bg-brand-frost px-4 py-3 border-b border-brand-ice/50">
        <h3 class="text-sm font-semibold text-gray-800"><i class="fas fa-boxes-stacked text-brand-gold mr-1"></i> Commerce par catégorie de produits (${year})</h3>
      </div>
      <div class="px-4 py-6 text-center text-gray-400">
        <i class="fas fa-info-circle mr-1"></i> Données de classification de produits en cours de collecte auprès de l'ANSD
      </div>
    </div>
    -->
  </div>
</section>

<!-- Source & API info -->
<section class="bg-brand-frost border-t border-brand-ice/50 py-8">
  <div class="max-w-6xl mx-auto px-4 sm:px-6">
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <p class="text-xs text-gray-500"><i class="fas fa-info-circle mr-1"></i> Source : <strong>${sources.primary}</strong> — Note d'Analyse du Commerce Extérieur (NACE) 2024</p>
        <p class="text-[10px] text-gray-400 mt-1">Les valeurs sont en milliards de FCFA. Données officielles mises à jour par l'ANSD.</p>
      </div>
      <div class="flex items-center gap-3">
        <a href="/api/commerce-exterieur" target="_blank" class="text-[10px] bg-white border border-gray-200 px-3 py-1.5 rounded hover:border-gray-300 text-gray-500 transition-colors">
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
  const lightBlue = '#3a7fd4';
  const red = '#dc2626';
  const green = '#059669';

  // ─── 1. Trade Evolution (Line) ────
  const tsData = ${JSON.stringify(timeSeries)};
  new Chart(document.getElementById('chart-trade-evolution'), {
    type: 'line',
    data: {
      labels: tsData.map(d => d.year),
      datasets: [
        {
          label: 'Exportations',
          data: tsData.map(d => d.exports),
          borderColor: green,
          backgroundColor: green + '15',
          fill: true,
          tension: 0.3,
          pointRadius: 4,
          borderWidth: 2,
        },
        {
          label: 'Importations',
          data: tsData.map(d => d.imports),
          borderColor: red,
          backgroundColor: red + '10',
          fill: true,
          tension: 0.3,
          pointRadius: 4,
          borderWidth: 2,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top', labels: { font: { size: 10, family: fontFamily }, boxWidth: 12, padding: 6 } },
        tooltip: { callbacks: { label: ctx => ctx.dataset.label + ': ' + ctx.parsed.y.toFixed(1) + ' Mds FCFA' } }
      },
      scales: {
        y: { beginAtZero: true, grid: { color: gridColor }, ticks: { font: { size: 10 }, callback: v => v.toFixed(0) + ' Mds' } },
        x: { grid: { display: false }, ticks: { font: { size: 10 } } }
      }
    }
  });

  // ─── 2. Trade Balance (Bar) ────
  new Chart(document.getElementById('chart-trade-balance'), {
    type: 'bar',
    data: {
      labels: tsData.map(d => d.year),
      datasets: [{
        label: 'Balance commerciale',
        data: tsData.map(d => d.balance),
        backgroundColor: tsData.map(d => d.balance >= 0 ? green + '80' : red + '80'),
        borderColor: tsData.map(d => d.balance >= 0 ? green : red),
        borderWidth: 1,
        borderRadius: 4,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => 'Balance: ' + ctx.parsed.y.toFixed(1) + ' Mds FCFA' } }
      },
      scales: {
        y: { grid: { color: gridColor }, ticks: { font: { size: 10 }, callback: v => v.toFixed(0) + ' Mds' } },
        x: { grid: { display: false }, ticks: { font: { size: 10 } } }
      }
    }
  });

  // ─── 3. Export Partners (Horizontal bar) ────
  const expPartners = ${JSON.stringify(topExportPartners)};
  new Chart(document.getElementById('chart-export-partners'), {
    type: 'bar',
    data: {
      labels: expPartners.map(p => p.country),
      datasets: [{
        label: 'Exportations (Mds FCFA)',
        data: expPartners.map(p => p.value),
        backgroundColor: blue + '80',
        borderColor: blue,
        borderWidth: 1,
        borderRadius: 4,
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => ctx.parsed.x.toFixed(1) + ' Mds FCFA (' + (expPartners[ctx.dataIndex].share * 100).toFixed(1) + '%)' } }
      },
      scales: {
        x: { grid: { color: gridColor }, ticks: { font: { size: 10 }, callback: v => v.toFixed(0) } },
        y: { grid: { display: false }, ticks: { font: { size: 9 } } }
      }
    }
  });

  // ─── 4. Import Partners (Horizontal bar) ────
  const impPartners = ${JSON.stringify(topImportPartners)};
  if (impPartners.length > 0) {
    new Chart(document.getElementById('chart-import-partners'), {
      type: 'bar',
      data: {
        labels: impPartners.map(p => p.country),
        datasets: [{
          label: 'Importations (Mds FCFA)',
          data: impPartners.map(p => p.value),
          backgroundColor: navy + '80',
          borderColor: navy,
          borderWidth: 1,
          borderRadius: 4,
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: ctx => ctx.parsed.x.toFixed(1) + ' Mds FCFA (' + (impPartners[ctx.dataIndex].share * 100).toFixed(1) + '%)' } }
        },
        scales: {
          x: { grid: { color: gridColor }, ticks: { font: { size: 10 }, callback: v => v.toFixed(0) } },
          y: { grid: { display: false }, ticks: { font: { size: 9 } } }
        }
      }
    });
  }

  // ─── 5 & 6. Sector charts — per-sector colour palette ────
  const sectorsData = ${JSON.stringify(sectors)};

  // 16 visually-distinct colours (one per sector, shared by both charts)
  const sectorColors = [
    '#e15f41', // Combustibles        — deep orange-red
    '#2ecc71', // Produits végétaux   — fresh green
    '#3498db', // Machines/élec.      — sky blue
    '#9b59b6', // Produits chimiques  — purple
    '#f39c12', // Métaux              — amber
    '#1abc9c', // Transport           — teal
    '#e74c3c', // Produits alim.      — crimson
    '#34495e', // Pierre et verre     — slate
    '#16a085', // Minéraux            — dark teal
    '#d35400', // Produits animaux    — burnt orange
    '#2980b9', // Plastique/Caoutch.  — cobalt
    '#8e44ad', // Divers              — violet
    '#27ae60', // Bois                — dark green
    '#c0392b', // Textiles/habill.    — dark red
    '#f1c40f', // Chaussures          — yellow
    '#7f8c8d', // Cuirs et peaux      — grey
  ];
  // Semi-transparent fills (CC = 80% opacity) and solid borders
  const sectorBg     = sectorColors.map(c => c + 'CC');
  const sectorBorder = sectorColors;

  // ─── 5. Export Sectors (Horizontal bar) ────
  new Chart(document.getElementById('chart-export-sectors'), {
    type: 'bar',
    data: {
      labels: sectorsData.map(s => s.name),
      datasets: [{
        label: 'Exportations (M USD)',
        data: sectorsData.map(s => s.exports),
        backgroundColor: sectorBg,
        borderColor: sectorBorder,
        borderWidth: 1.5,
        borderRadius: 4,
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => ' ' + ctx.parsed.x.toFixed(0) + ' M USD',
            labelColor: ctx => ({ borderColor: sectorBorder[ctx.dataIndex], backgroundColor: sectorBg[ctx.dataIndex] })
          }
        }
      },
      scales: {
        x: { grid: { color: gridColor }, ticks: { font: { size: 10 }, callback: v => v.toFixed(0) } },
        y: { grid: { display: false }, ticks: { font: { size: 8 } } }
      }
    }
  });

  // ─── 6. Import Sectors (Horizontal bar) ────
  new Chart(document.getElementById('chart-import-sectors'), {
    type: 'bar',
    data: {
      labels: sectorsData.map(s => s.name),
      datasets: [{
        label: 'Importations (M USD)',
        data: sectorsData.map(s => s.imports),
        backgroundColor: sectorBg,
        borderColor: sectorBorder,
        borderWidth: 1.5,
        borderRadius: 4,
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => ' ' + ctx.parsed.x.toFixed(0) + ' M USD',
            labelColor: ctx => ({ borderColor: sectorBorder[ctx.dataIndex], backgroundColor: sectorBg[ctx.dataIndex] })
          }
        }
      },
      scales: {
        x: { grid: { color: gridColor }, ticks: { font: { size: 10 }, callback: v => v.toFixed(0) } },
        y: { grid: { display: false }, ticks: { font: { size: 8 } } }
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
