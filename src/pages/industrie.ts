import { layout } from '../components/layout'
import { ihpiSeries, IHPI_SOURCE_FILE } from '../data/ihpi'

type DashboardIndicator = {
  name: string
  value: number | null
  unit: string
  year: number | null
  source: string
}

function formatNumber(value: number, digits = 1): string {
  return value.toLocaleString('fr-FR', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
}

function formatIndicatorValue(indicator: DashboardIndicator): string {
  if (indicator.value === null) return 'n/a'
  if (indicator.unit === '%') return `${formatNumber(indicator.value, 1)}%`
  if (indicator.unit === 'index') return formatNumber(indicator.value, 1)
  return formatNumber(indicator.value, 1)
}

function parseYear(period: string): number {
  return Number(period.slice(0, 4))
}

export async function industriePage(): Promise<string> {
  const indexSeries = ihpiSeries.map((p) => ({ label: p.period, value: p.value }))
  const latest = indexSeries[indexSeries.length - 1] || null
  const latestYear = latest ? parseYear(latest.label) : null

  const recent12 = indexSeries.slice(-12)
  const avg12 = recent12.length
    ? recent12.reduce((s, p) => s + p.value, 0) / recent12.length
    : null
  const max12 = recent12.length ? Math.max(...recent12.map((p) => p.value)) : null
  const min12 = recent12.length ? Math.min(...recent12.map((p) => p.value)) : null

  // YoY based on same month previous year when available.
  const yoySeries: Array<{ label: string; value: number }> = []
  for (let i = 12; i < indexSeries.length; i++) {
    const curr = indexSeries[i]
    const prev = indexSeries[i - 12]
    if (!prev || prev.value === 0) continue
    yoySeries.push({
      label: curr.label,
      value: ((curr.value - prev.value) / prev.value) * 100,
    })
  }
  const yoyLatest = yoySeries.length ? yoySeries[yoySeries.length - 1] : null

  const indicators: DashboardIndicator[] = [
    {
      name: 'IHPI',
      value: latest?.value ?? null,
      unit: 'index',
      year: latest ? parseYear(latest.label) : null,
      source: 'ANSD IHPI (snapshot local)',
    },
    {
      name: 'Croissance annuelle IHPI',
      value: yoyLatest?.value ?? null,
      unit: '%',
      year: yoyLatest ? parseYear(yoyLatest.label) : null,
      source: 'ANSD IHPI (calcule sur 12 mois glissants)',
    },
    {
      name: 'IHPI moyen (12 derniers mois)',
      value: avg12,
      unit: 'index',
      year: latestYear,
      source: 'ANSD IHPI (snapshot local)',
    },
    {
      name: 'IHPI max (12 derniers mois)',
      value: max12,
      unit: 'index',
      year: latestYear,
      source: 'ANSD IHPI (snapshot local)',
    },
    {
      name: 'IHPI min (12 derniers mois)',
      value: min12,
      unit: 'index',
      year: latestYear,
      source: 'ANSD IHPI (snapshot local)',
    },
    {
      name: "Part de l'Industrie / PIB",
      value: null,
      unit: '%',
      year: null,
      source: 'ANSD (non disponible dans ce snapshot local)',
    },
    {
      name: "Valeur ajoutee de l'Industrie",
      value: null,
      unit: 'index',
      year: null,
      source: 'ANSD (non disponible dans ce snapshot local)',
    },
    {
      name: 'Valeur ajoutee manufacturiere',
      value: null,
      unit: 'index',
      year: null,
      source: 'ANSD (non disponible dans ce snapshot local)',
    },
    {
      name: "Part des biens manufacturiers dans les exportations",
      value: null,
      unit: '%',
      year: null,
      source: 'ANSD (non disponible dans ce snapshot local)',
    },
    {
      name: "Part du secteur industriel dans l'emploi total",
      value: null,
      unit: '%',
      year: null,
      source: 'ANSD (non disponible dans ce snapshot local)',
    },
  ]

  const heroCards = indicators.filter((i) => i.value !== null).slice(0, 4)
  const indexRecent = indexSeries.slice(-24)
  const yoyRecent = yoySeries.slice(-24)
  const dataQuality = indicators.filter((i) => i.value !== null).length

  const content = `
<section class="bg-brand-navy py-14 lg:py-18">
  <div class="max-w-6xl mx-auto px-4 sm:px-6">
    <nav class="text-xs text-gray-400 mb-4">
      <a href="/" class="hover:text-white">Accueil</a>
      <span class="mx-2 text-gray-600">/</span>
      <span class="text-gray-300">Industrie</span>
    </nav>
    <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
      <div>
        <h1 class="font-display text-2xl lg:text-3xl text-white">Industrie du Senegal</h1>
        <p class="text-gray-400 mt-2 text-sm max-w-xl">
          Donnees statiques officielles ANSD (snapshot local) prioritaires pour stabilite et traçabilite.
          Derniere periode disponible : <span class="text-brand-gold font-medium">${latest?.label || 'n/a'}</span>.
        </p>
      </div>
      <div class="flex items-center gap-2 text-xs text-gray-500">
        <i class="fas fa-database"></i>
        <span>Source : ANSD (snapshot local)</span>
      </div>
    </div>
  </div>
</section>

<section class="bg-white border-b border-gray-100">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 py-6">
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      ${heroCards.map((item, idx) => `
      <div class="bg-brand-frost rounded-lg p-4 text-center">
        <div class="text-2xl font-bold ${idx === 2 ? 'text-brand-gold' : 'text-brand-blue'}">${formatIndicatorValue(item)}</div>
        <div class="text-[11px] text-gray-500 mt-1">${item.name}</div>
        <div class="text-[10px] text-gray-400">${item.year || 'n/a'}</div>
      </div>
      `).join('')}
    </div>
  </div>
</section>

<section class="py-10 bg-gray-50">
  <div class="max-w-6xl mx-auto px-4 sm:px-6">
    <div class="grid lg:grid-cols-2 gap-6">
      <div class="bg-white border border-gray-100 rounded-lg p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-semibold text-gray-800">Evolution IHPI (niveau)</h3>
          <span class="text-[10px] text-gray-400">${indexRecent[0]?.label || 'n/a'}-${indexRecent[indexRecent.length - 1]?.label || 'n/a'}</span>
        </div>
        <div class="bg-gray-50 rounded-md p-3">
          <canvas id="chart-ihpi-level" height="240"></canvas>
        </div>
        <div class="mt-2 text-[10px] text-gray-300 text-right">Source: ANSD IHPI (${IHPI_SOURCE_FILE.split('/').pop()})</div>
      </div>

      <div class="bg-white border border-gray-100 rounded-lg p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-semibold text-gray-800">Evolution IHPI (glissement annuel %)</h3>
          <span class="text-[10px] text-gray-400">${yoyRecent[0]?.label || 'n/a'}-${yoyRecent[yoyRecent.length - 1]?.label || 'n/a'}</span>
        </div>
        <div class="bg-gray-50 rounded-md p-3">
          <canvas id="chart-ihpi-yoy" height="240"></canvas>
        </div>
        <div class="mt-2 text-[10px] text-gray-300 text-right">Source: ANSD IHPI (calcule interne)</div>
      </div>
    </div>
  </div>
</section>

<section class="py-10">
  <div class="max-w-6xl mx-auto px-4 sm:px-6">
    <h2 class="font-display text-xl text-gray-800 mb-6">Donnees detaillees</h2>
    <div class="bg-white border border-gray-100 rounded-lg overflow-hidden">
      <div class="bg-brand-frost px-4 py-3 border-b border-brand-ice/50">
        <h3 class="text-sm font-semibold text-gray-800"><i class="fas fa-list-check text-emerald-600 mr-1"></i> Liste des indicateurs (ANSD static snapshot)</h3>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-xs">
          <thead>
            <tr class="bg-gray-50 text-gray-500 text-left">
              <th class="px-4 py-2 font-medium">#</th>
              <th class="px-4 py-2 font-medium">Indicateur</th>
              <th class="px-4 py-2 font-medium text-right">Valeur</th>
              <th class="px-4 py-2 font-medium text-right">Unite</th>
              <th class="px-4 py-2 font-medium text-right">Annee</th>
              <th class="px-4 py-2 font-medium text-right">Source</th>
            </tr>
          </thead>
          <tbody>
            ${indicators.map((i, idx) => `
            <tr class="border-t border-gray-50 hover:bg-gray-50/50">
              <td class="px-4 py-2 text-gray-400">${idx + 1}</td>
              <td class="px-4 py-2 font-medium text-gray-800">${i.name}</td>
              <td class="px-4 py-2 text-right text-gray-600">${formatIndicatorValue(i)}</td>
              <td class="px-4 py-2 text-right text-gray-500">${i.unit}</td>
              <td class="px-4 py-2 text-right text-gray-500">${i.year || 'n/a'}</td>
              <td class="px-4 py-2 text-right text-gray-500">${i.source}</td>
            </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  </div>
</section>

<section class="bg-brand-frost border-t border-brand-ice/50 py-8">
  <div class="max-w-6xl mx-auto px-4 sm:px-6">
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <p class="text-xs text-gray-500"><i class="fas fa-info-circle mr-1"></i> Source principale : ANSD (snapshot statique local)</p>
        <p class="text-[10px] text-gray-400 mt-1">Couverture donnees : ${dataQuality}/10 | Fichier source: ${IHPI_SOURCE_FILE}</p>
      </div>
      <div class="flex items-center gap-3">
        <a href="/api/ansd/industrial-index" target="_blank" class="text-[10px] bg-white border border-gray-200 px-3 py-1.5 rounded hover:border-gray-300 text-gray-500 transition-colors">
          <i class="fas fa-code mr-1"></i> API ANSD
        </a>
      </div>
    </div>
  </div>
</section>

<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
document.addEventListener('DOMContentLoaded', () => {
  const gridColor = '#f1f5f9';
  const blue = '#044bad';
  const gold = '#b8943e';

  const indexSeries = ${JSON.stringify(indexRecent)};
  const yoySeries = ${JSON.stringify(yoyRecent)};

  if (indexSeries.length) {
    new Chart(document.getElementById('chart-ihpi-level'), {
      type: 'line',
      data: {
        labels: indexSeries.map((p) => p.label),
        datasets: [{
          label: 'IHPI',
          data: indexSeries.map((p) => p.value),
          borderColor: gold,
          backgroundColor: gold + '20',
          fill: true,
          tension: 0.25,
          pointRadius: 2,
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          y: { grid: { color: gridColor }, ticks: { font: { size: 10 } } },
          x: { grid: { display: false }, ticks: { font: { size: 10 } } }
        }
      }
    });
  }

  if (yoySeries.length) {
    new Chart(document.getElementById('chart-ihpi-yoy'), {
      type: 'line',
      data: {
        labels: yoySeries.map((p) => p.label),
        datasets: [{
          label: 'YoY (%)',
          data: yoySeries.map((p) => p.value),
          borderColor: blue,
          backgroundColor: blue + '18',
          fill: true,
          tension: 0.25,
          pointRadius: 2,
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx) => Number(ctx.parsed.y).toLocaleString('fr-FR', { maximumFractionDigits: 2 }) + ' %' } }
        },
        scales: {
          y: { grid: { color: gridColor }, ticks: { font: { size: 10 }, callback: (v) => v + '%' } },
          x: { grid: { display: false }, ticks: { font: { size: 10 } } }
        }
      }
    });
  }
});
</script>
`

  return layout(content, {
    title: 'Industrie',
    description: 'Tableau de bord industrie du Senegal - donnees statiques ANSD.',
    path: '/industrie',
  })
}
