import { layout } from '../components/layout'
import { fetchCommerceInterieurData } from '../utils/commerce-interieur-sheets-api'

export async function commerceInterieurPage(): Promise<string> {
  const data = await fetchCommerceInterieurData()
  const { year, indicators, ihpcSeries, ihpcDesagrege, icaiSeries, icaiBreakdown, inflationData, emploiCommerce, denreesDeBase, denreesDeBaseSeries } = data

  // Keep last 11 rows → 10 periods of month-on-month variation
  const ihpcDesagregeRecent = ihpcDesagrege.slice(-11)

  // Extract KPI indicators
  const ihpcIndicator = indicators.find(i => i.name.includes('IHPC Global Fév') || i.name.includes('IHPC Global Jan'))
  const icaiIndicator = indicators.find(i => i.name.includes('Opinion tertiaire'))
  const emploiIndicator = emploiCommerce ? {
    name: emploiCommerce.label,
    formatted: emploiCommerce.value !== null ? emploiCommerce.value.toLocaleString('fr-FR') : 'n/a',
    note: emploiCommerce.year,
  } : indicators.find(i => i.name.includes('Emploi commerce') && !i.formatted?.includes('#ERROR'))
  const commercePibIndicator = indicators.find(i => i.name.includes('Commerce/PIB'))

  const content = `
<section class="bg-brand-navy py-14 lg:py-18">
  <div class="max-w-6xl mx-auto px-4 sm:px-6">
    <nav class="text-xs text-gray-400 mb-4">
      <a href="/" class="hover:text-white">Accueil</a>
      <span class="mx-2 text-gray-600">/</span>
      <span class="text-gray-300">Commerce intérieur</span>
    </nav>
    <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
      <div>
        <h1 class="font-display text-2xl lg:text-3xl text-white">Commerce Intérieur du Sénégal</h1>
        <p class="text-gray-400 mt-2 text-sm max-w-xl">
          Indices des prix (IHPC), indicateur conjoncturel d'activité (ICAI) et dynamique du commerce intérieur.
          Mise à jour : <span class="text-brand-gold font-medium">Mars ${year}</span>.
        </p>
      </div>
      <div class="flex items-center gap-2 text-xs text-gray-500">
        <i class="fas fa-chart-line"></i>
        <span>Sources : ANSD / DPEE</span>
      </div>
    </div>
  </div>
</section>

<section class="bg-white border-b border-gray-100">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 py-6">
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- KPI 1: IHPC Global -->
      <div class="bg-brand-frost rounded-lg p-4 text-center">
        <div class="text-lg md:text-xl font-bold text-brand-blue">${ihpcIndicator?.formatted || 'n/a'}</div>
        <div class="text-[11px] text-gray-500 mt-1">IHPC Global</div>
        <div class="text-[10px] text-gray-400">${ihpcIndicator?.note || 'Base 100=2023'}</div>
        <div class="text-[9px] text-gray-400 mt-2 italic">ANSD</div>
      </div>
      
      <!-- KPI 2: ICAI Global -->
      <div class="bg-brand-frost rounded-lg p-4 text-center">
        <div class="text-lg md:text-xl font-bold text-brand-navy">${icaiIndicator?.formatted || 'n/a'}</div>
        <div class="text-[11px] text-gray-500 mt-1">ICAI Global</div>
        <div class="text-[10px] text-gray-400">${icaiIndicator?.note || 'Opinion tertiaire'}</div>
        <div class="text-[9px] text-gray-400 mt-2 italic">ANSD/DPEE</div>
      </div>
      
      <!-- KPI 3: Emploi -->
      <div class="bg-brand-frost rounded-lg p-4 text-center">
        <div class="text-lg md:text-xl font-bold text-emerald-600">${emploiIndicator?.formatted || 'n/a'}</div>
        <div class="text-[11px] text-gray-500 mt-1">Emploi Commerce</div>
        <div class="text-[10px] text-gray-400">${emploiIndicator?.note || 'Secteur moderne'}</div>
        <div class="text-[9px] text-gray-400 mt-2 italic">ANSD</div>
      </div>
      
      <!-- KPI 4: Commerce/PIB -->
      <div class="bg-brand-frost rounded-lg p-4 text-center">
        <div class="text-lg md:text-xl font-bold text-brand-gold">${commercePibIndicator?.formatted || 'n/a'}</div>
        <div class="text-[11px] text-gray-500 mt-1">Commerce/PIB</div>
        <div class="text-[10px] text-gray-400">Trade % of GDP</div>
        <div class="text-[9px] text-gray-400 mt-2 italic">World Bank</div>
      </div>
    </div>
  </div>
</section>

<section class="py-10 bg-gray-50">
  <div class="max-w-6xl mx-auto px-4 sm:px-6">
    <!-- Row 1: IHPC Désagrégé + Inflation vs UEMOA (2-col) -->

    <div class="grid lg:grid-cols-2 gap-6 mb-6">
      <!-- IHPC Désagrégé (var. mensuelle) -->
      <div class="bg-white border border-gray-100 rounded-lg p-5">
        <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div>
            <h3 class="text-sm font-semibold text-gray-800">IHPC désagrégé — variations mensuelles (%)</h3>
            <p class="text-[10px] text-gray-500 mt-0.5">10 dernières périodes · cliquer pour masquer/afficher</p>
          </div>
          <span class="text-[10px] text-gray-400">${ihpcDesagregeRecent.length > 1 ? ihpcDesagregeRecent[1].date + ' – ' + ihpcDesagregeRecent[ihpcDesagregeRecent.length - 1].date : ''}</span>
        </div>
        <div class="bg-gray-50 rounded-md p-3" style="height: 280px;">
          <canvas id="chart-ihpc-desagrege"></canvas>
        </div>
        <p class="text-[9px] text-gray-400 mt-2 text-center italic">Source: ANSD — IHPC COICOP. Var. = (Indice[t] / Indice[t-1] − 1) × 100</p>
      </div>

      <!-- Inflation vs UEMOA Threshold -->
      <div class="bg-white border border-gray-100 rounded-lg p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-semibold text-gray-800">Inflation Annuelle vs Seuil UEMOA (3%)</h3>
          <span class="text-[10px] text-gray-400">2020-2025 (années complètes)</span>
        </div>
        <div class="bg-gray-50 rounded-md p-3" style="height: 280px;">
          <canvas id="chart-inflation-threshold"></canvas>
        </div>
        <p class="text-[9px] text-gray-400 mt-3 text-center italic">Source: ANSD (calculé depuis IHPC annuel). 2023 exclu (rebasement).</p>
      </div>
    </div>

    <!-- Row 2: ICAI (line) + ICAI Breakdown (2-col) -->
    <div class="grid lg:grid-cols-2 gap-6 mb-6">
      <!-- ICAI Commerce Line Chart -->
      <div class="bg-white border border-gray-100 rounded-lg p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-semibold text-gray-800">ICAI Commerce</h3>
          <span class="text-[10px] text-gray-400">10 dernières périodes</span>
        </div>
        <div class="bg-gray-50 rounded-md p-3" style="height: 280px;">
          <canvas id="chart-icai-series"></canvas>
        </div>
        <p class="text-[9px] text-gray-400 mt-3 text-center italic">Source: DPEE</p>
      </div>

      <!-- ICAI Breakdown Donut -->
      <div class="bg-white border border-gray-100 rounded-lg p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-semibold text-gray-800">Répartition ICAI par Catégorie</h3>
          <span class="text-[10px] text-gray-400">${year}</span>
        </div>
        <div class="bg-gray-50 rounded-md p-3" style="height: 280px;">
          <canvas id="chart-icai-breakdown"></canvas>
        </div>
        <p class="text-[9px] text-gray-400 mt-3 text-center italic">Source: DPEE</p>
      </div>
    </div>

    <!-- Denrées de base table (Excel-like wide table, screenshot-style card) -->
    <div class="bg-white border border-gray-100 rounded-lg overflow-hidden">
      <div class="bg-brand-frost px-4 py-3 border-b border-brand-ice/50">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-semibold text-gray-800">
            <span class="inline-flex items-center gap-1">
              <svg class="w-4 h-4" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M24 8 L36 20 H28 V40 H20 V20 H12 Z" fill="#00B66A"/>
              </svg>
              <span>Prix des denrées de base (FCFA/kg)</span>
            </span>
          </h3>
          <span class="text-[10px] text-gray-400">12 dernières périodes</span>
        </div>
      </div>
      <div class="overflow-x-auto">
        ${(() => {
          const series = (denreesDeBaseSeries || [])
          const latestRows = (denreesDeBase || [])
          // Remove unit suffix "(FCFA/kg)" from headers to reduce width
          const stripUnit = (s: any) => String(s || '').replace(/\s*\(FCFA\/kg\)\s*/i, '').trim()
          const produitsRaw = latestRows.map(r => stripUnit(r.produit))
          const produits = produitsRaw
          // Map display label -> original key used in series.values (which still includes unit)
          const keyByLabel = Object.fromEntries(produitsRaw.map((lbl, i) => [lbl, latestRows[i].produit]))

          const fmt = (v: any) => (v === null || v === undefined) ? '' : Math.round(Number(v)).toLocaleString('fr-FR')

          return `
          <table class="w-full text-xs table-fixed">
            <thead>
              <tr class="bg-gray-50 text-gray-500 text-left">
                <th class="sticky left-0 bg-gray-50 px-1 py-2 font-medium w-[56px]">Période</th>
                ${produits.map(p => {
                  const parts = String(p).split(/\s+/)
                  const line1 = parts.slice(0, Math.ceil(parts.length / 2)).join(' ')
                  const line2 = parts.slice(Math.ceil(parts.length / 2)).join(' ')
                  return `<th class=\"px-1 py-2 font-medium text-center w-[56px] leading-3\" title=\"${p}\"><div class=\"flex flex-col items-center\"><span class=\"block truncate w-full text-center\">${line1}</span><span class=\"block truncate w-full text-center\">${line2}</span></div></th>`
                }).join('')}
              </tr>
            </thead>
            <tbody>
              ${series.slice().reverse().map(row => {
                return `
                <tr class=\"border-t border-gray-50 hover:bg-gray-50/50\">
                  <td class=\"sticky left-0 bg-white px-2 py-2 text-left font-medium text-gray-800\">${(() => {
                    const d = String(row.date || '').trim()
                    const m = d.match(/^(\d{4})-(\d{2})/) // gviz gives YYYY-MM
                    if (!m) return d
                    const y = Number(m[1])
                    const mo = Number(m[2])
                    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']
                    const label = months[mo - 1] || String(mo)
                    return `${label} ${y}`
                  })()}</td>
                  ${(() => {
                    // We render series in reverse (latest first)
                    const rendered = series.slice().reverse()
                    const rowIdx = rendered.indexOf(row)
                    const prevRow = (rowIdx >= 0 && rowIdx + 1 < rendered.length) ? rendered[rowIdx + 1] : null

                    return produits.map(p => {
                      const current = row.values?.[keyByLabel[p]]
                      const prev = prevRow?.values?.[keyByLabel[p]]

                      const curN = current === null || current === undefined ? null : Number(current)
                      const prevN = prev === null || prev === undefined ? null : Number(prev)

                      const delta = (curN !== null && prevN !== null && Number.isFinite(curN) && Number.isFinite(prevN))
                        ? (curN - prevN)
                        : null

                      // Requirement: red = increase, green = decrease
                      const arrow = delta === null || delta === 0 ? '' : (delta > 0
                        ? '<span class=\"ml-1 text-red-500\" aria-label=\"hausse\">▲</span>'
                        : '<span class=\"ml-1 text-emerald-600\" aria-label=\"baisse\">▼</span>'
                      )

                      return `<td class=\"px-2 py-2 text-center text-gray-600\"><span class=\"inline-flex items-center justify-center\">${fmt(curN)}${arrow}</span></td>`
                    }).join('')
                  })()}
                </tr>
                `
              }).join('')}
            </tbody>
          </table>
          `
        })()}
      </div>
      <div class="px-4 py-2">
        <p class="text-[9px] text-gray-400 mt-1 text-center italic">Source: DPEE — Prix intérieurs des denrées de base</p>
      </div>
    </div>
  </div>
</section>

<section class="bg-white py-8 border-t border-gray-100">
  <div class="max-w-6xl mx-auto px-4 sm:px-6">
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <p class="text-xs text-gray-500"><i class="fas fa-info-circle mr-1"></i> Sources : ANSD, DPEE, World Bank, UEMOA</p>
        <p class="text-[10px] text-gray-400 mt-1">Données Commerce Intérieur actualisées Mars ${year} - IHPC Base 100=2023</p>
      </div>
      <div class="flex items-center gap-3">
        <a href="/api/commerce-interieur" target="_blank" class="text-[10px] bg-brand-frost border border-brand-ice px-3 py-1.5 rounded hover:bg-brand-ice/50 text-gray-700 transition-colors">
          <i class="fas fa-code mr-1"></i> API JSON
        </a>
      </div>
    </div>
  </div>
</section>

<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
document.addEventListener('DOMContentLoaded', () => {
  const fontFamily = "'Montserrat', sans-serif";
  const gridColor = '#f1f5f9';
  const blue = '#044bad';
  const navy = '#032d6b';
  const gold = '#b8943e';
  const lightBlue = '#3a7fd4';
  const emerald = '#10b981';
  const red = '#dc2626';

  const ihpcSeries = ${JSON.stringify(ihpcSeries)};
  const ihpcRaw = ${JSON.stringify(ihpcDesagregeRecent)};
  const icaiSeries = ${JSON.stringify(icaiSeries)};
  const icaiBreakdown = ${JSON.stringify(icaiBreakdown)};
  const inflationData = ${JSON.stringify(inflationData)};

  // ─── Chart 1: IHPC Désagrégé — month-on-month variations ────
  const ihpcCategories = [
    { key: 'global',                   label: 'Global',               color: '#1e293b' },
    { key: 'alimentaire',              label: 'Alim. & boissons',     color: '#e74c3c' },
    { key: 'boissonsTabac',            label: 'Boissons & tabac',     color: '#8e44ad' },
    { key: 'vetementsChaussures',      label: 'Vêtements',            color: '#3498db' },
    { key: 'logementEau',              label: 'Logement & eau',       color: '#2ecc71' },
    { key: 'soinsPersonnels',          label: 'Soins perso.',         color: '#f39c12' },
    { key: 'assurancesFinances',       label: 'Assurances',           color: '#1abc9c' },
    { key: 'restaurantsHebergement',   label: 'Restaurants',          color: '#e67e22' },
    { key: 'enseignement',             label: 'Enseignement',         color: '#9b59b6' },
    { key: 'loisirsCulture',           label: 'Loisirs',              color: '#16a085' },
    { key: 'informationCommunication', label: 'Info. & com.',         color: '#2980b9' },
    { key: 'transport',                label: 'Transport',            color: '#c0392b' },
    { key: 'ameublementMenager',       label: 'Ameublement',          color: '#d35400' },
    { key: 'sante',                    label: 'Santé',                color: '#27ae60' },
  ];

  // Compute month-on-month % variation: (v[t]/v[t-1] - 1)*100
  // ihpcRaw has 11 rows → 10 variation periods
  const varLabels = ihpcRaw.slice(1).map(d => d.date);
  const varDatasets = ihpcCategories.map(cat => {
    const varData = ihpcRaw.slice(1).map((d, i) => {
      const prev = ihpcRaw[i][cat.key];
      const curr = d[cat.key];
      if (!prev || !curr) return null;
      return Math.round(((curr / prev) - 1) * 10000) / 100; // 2 decimal places
    });
    return {
      label: cat.label,
      data: varData,
      borderColor: cat.color,
      backgroundColor: cat.color + 'CC',
      borderWidth: cat.key === 'global' ? 2.5 : 1.5,
      pointRadius: 3,
      pointHoverRadius: 5,
      tension: 0.3,
      hidden: false,
    };
  });

  new Chart(document.getElementById('chart-ihpc-desagrege'), {
    type: 'line',
    data: { labels: varLabels, datasets: varDatasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'nearest', intersect: true },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: ctx => ctx[0].label,
            label: ctx => {
              const v = ctx.parsed.y;
              if (v === null) return '';
              const sign = v > 0 ? '+' : '';
              return \` \${ctx.dataset.label}: \${sign}\${v.toFixed(2)}%\`;
            }
          }
        }
      },
      scales: {
        y: {
          grid: { color: gridColor },
          ticks: { font: { size: 10 }, callback: v => (v > 0 ? '+' : '') + v.toFixed(1) + '%' },
          title: { display: true, text: 'Var. mensuelle (%)', font: { size: 9 }, color: '#94a3b8' }
        },
        x: { grid: { display: false }, ticks: { font: { size: 9 }, maxRotation: 45, minRotation: 45 } }
      }
    }
  });

  // Chart 2: ICAI Services — line chart (last 10 periods)
  // Expected icaiSeries items: { date, gros, detail, autoMoto }
  const icaiStacked = (icaiSeries || []).slice(-10);
  new Chart(document.getElementById('chart-icai-series'), {
    type: 'line',
    data: {
      labels: icaiStacked.map(d => d.date),
      datasets: [
        {
          label: 'Commerce de Gros',
          data: icaiStacked.map(d => d.gros),
          borderColor: blue,
          backgroundColor: blue + '20',
          borderWidth: 2,
          fill: false,
          tension: 0.3,
          pointRadius: 3,
          pointHoverRadius: 5,
        },
        {
          label: 'Commerce de Détail',
          data: icaiStacked.map(d => d.detail),
          borderColor: emerald,
          backgroundColor: emerald + '20',
          borderWidth: 2,
          fill: false,
          tension: 0.3,
          pointRadius: 3,
          pointHoverRadius: 5,
        },
        {
          label: 'Auto & Moto',
          data: icaiStacked.map(d => d.autoMoto),
          borderColor: gold,
          backgroundColor: gold + '20',
          borderWidth: 2,
          fill: false,
          tension: 0.3,
          pointRadius: 3,
          pointHoverRadius: 5,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: { font: { size: 9 }, boxWidth: 10, padding: 10 }
        },
        tooltip: {
          callbacks: {
            label: (ctx) => ' ' + String(ctx.dataset.label) + ': ' + Number(ctx.parsed.y).toFixed(1)
          }
        }
      },
      scales: {
        y: {
          grid: { color: gridColor },
          ticks: { font: { size: 10 } }
        },
        x: {
          grid: { display: false },
          ticks: { font: { size: 9 }, maxRotation: 45, minRotation: 45 }
        }
      }
    }
  });

  // Chart 3: ICAI Breakdown (Donut)
  new Chart(document.getElementById('chart-icai-breakdown'), {
    type: 'doughnut',
    data: {
      labels: icaiBreakdown.map(d => d.category),
      datasets: [{
        data: icaiBreakdown.map(d => d.share),
        backgroundColor: [
          blue + '85',
          navy + '85',
          gold + '85',
          lightBlue + '85',
          emerald + '85'
        ],
        borderColor: [blue, navy, gold, lightBlue, emerald],
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { 
          position: 'bottom', 
          labels: { font: { size: 9, family: fontFamily }, padding: 6, boxWidth: 10 } 
        },
        tooltip: {
          callbacks: {
            label: (ctx) => \`\${ctx.label}: \${ctx.parsed.toFixed(1)}%\`
          }
        }
      }
    }
  });

  // Chart 4: Inflation vs UEMOA Threshold (Bar with line)
  new Chart(document.getElementById('chart-inflation-threshold'), {
    type: 'bar',
    data: {
      labels: inflationData.map(d => d.year),
      datasets: [
        {
          type: 'line',
          label: 'Seuil UEMOA (3%)',
          // Ensure line spans full x-axis
          data: inflationData.length ? new Array(inflationData.length).fill(3) : [],
          borderColor: red,
          borderWidth: 2,
          borderDash: [5, 5],
          fill: false,
          pointRadius: 0
        },
        {
          type: 'bar',
          label: "Taux d'inflation",
          data: inflationData.map(d => d.rate),
          backgroundColor: inflationData.map(d => d.rate > 3 ? red + '70' : emerald + '70'),
          borderColor: inflationData.map(d => d.rate > 3 ? red : emerald),
          borderWidth: 2,
          borderRadius: 4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { 
        title: {
          display: true,
          text: "Taux d'inflation",
          align: 'start',
          font: { size: 14, weight: '600' },
          color: '#0f172a',
          padding: { bottom: 10 }
        },
        legend: { 
          display: true,
          position: 'top',
          labels: {
            font: { size: 10 },
            padding: 10,
            usePointStyle: true,
            // Render legend sample for dashed threshold like the chart
            generateLabels: (chart) => {
              const original = Chart.defaults.plugins.legend.labels.generateLabels(chart)
              return original.map(l => {
                const ds = chart.data.datasets[l.datasetIndex]
                if (ds && ds.type === 'line') {
                  // Force a line sample in legend (not a box)
                  l.strokeStyle = ds.borderColor
                  l.lineWidth = ds.borderWidth || 2
                  l.lineDash = ds.borderDash || [5, 5]
                  l.fillStyle = 'rgba(0,0,0,0)'
                  // Chart.js draws line sample when pointStyle is set to 'line'
                  l.pointStyle = 'line'
                }
                if (ds && ds.type === 'bar') {
                  l.fillStyle = Array.isArray(ds.backgroundColor) ? ds.backgroundColor[0] : ds.backgroundColor
                  l.strokeStyle = Array.isArray(ds.borderColor) ? ds.borderColor[0] : ds.borderColor
                  l.lineDash = []
                }
                return l
              })
            }
          }
        },
        tooltip: {
          callbacks: {
            label: (ctx) => \`\${ctx.dataset.label}: \${ctx.parsed.y.toFixed(2)}%\`
          }
        }
      },
      scales: {
        y: { 
          grid: { color: gridColor }, 
          ticks: { font: { size: 10 }, callback: v => v + '%' },
          suggestedMax: 12
        },
        x: { 
          grid: { display: false }, 
          ticks: { font: { size: 11 } } 
        }
      }
    }
  });
});
</script>
`

  return layout(content, {
    title: 'Commerce Intérieur',
    description: 'Tableau de bord du commerce intérieur du Sénégal avec IHPC, ICAI et inflation (Mars 2026).',
    path: '/commerce-interieur',
  })
}
