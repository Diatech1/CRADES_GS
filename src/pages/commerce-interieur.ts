import { layout } from '../components/layout'
import { getCommerceData } from '../utils/ministry-api'
import { getSenegalCpiSeries } from '../utils/imf-api'

export async function commerceInterieurPage(): Promise<string> {
  const commerceData = await getCommerceData('domestic')
  const cpiRaw = await getSenegalCpiSeries('2023-M01').catch(() => [])
  const { totalValue, period, byProduct, topPartners } = commerceData

  const cpiSeries = cpiRaw.slice(-24).map((p) => ({ label: p.period, value: p.value }))
  const cpiLatest = cpiSeries.length ? cpiSeries[cpiSeries.length - 1] : null
  const cpiYoY = cpiSeries.length >= 13 && cpiSeries[cpiSeries.length - 13].value !== 0
    ? ((cpiSeries[cpiSeries.length - 1].value - cpiSeries[cpiSeries.length - 13].value) / cpiSeries[cpiSeries.length - 13].value) * 100
    : null

  const fmt = (n: number) => {
    if (Math.abs(n) >= 1_000_000_000_000) return (n / 1_000_000_000_000).toFixed(1).replace('.', ',') + ' Tn'
    if (Math.abs(n) >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1).replace('.', ',') + ' Mds'
    if (Math.abs(n) >= 1_000_000) return (n / 1_000_000).toFixed(1).replace('.', ',') + ' M'
    return Math.round(n).toLocaleString('fr-FR')
  }

  const regionData = [
    { region: 'Dakar', value: 3450000000000, share: 42.5 },
    { region: 'Thies', value: 1240000000000, share: 15.3 },
    { region: 'Kaolack', value: 980000000000, share: 12.1 },
    { region: 'Saint-Louis', value: 620000000000, share: 7.6 },
    { region: 'Louga', value: 450000000000, share: 5.5 },
    { region: 'Matam', value: 380000000000, share: 4.7 },
    { region: 'Autres regions', value: 400000000000, share: 4.9 },
  ]

  const content = `
<section class="bg-brand-navy py-14 lg:py-18">
  <div class="max-w-6xl mx-auto px-4 sm:px-6">
    <nav class="text-xs text-gray-400 mb-4">
      <a href="/" class="hover:text-white">Accueil</a>
      <span class="mx-2 text-gray-600">/</span>
      <span class="text-gray-300">Commerce interieur</span>
    </nav>
    <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
      <div>
        <h1 class="font-display text-2xl lg:text-3xl text-white">Commerce interieur du Senegal</h1>
        <p class="text-gray-400 mt-2 text-sm max-w-xl">
          Analyse du commerce interne et indicateurs de prix a la consommation (CPI).
          Donnees pour : <span class="text-brand-gold font-medium">${period}</span>.
        </p>
      </div>
      <div class="flex items-center gap-2 text-xs text-gray-500">
        <i class="fas fa-store"></i>
        <span>Source : Ministere du Commerce + CPI (IMF)</span>
      </div>
    </div>
  </div>
</section>

<section class="bg-white border-b border-gray-100">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 py-6">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <div class="bg-brand-frost rounded-lg p-4 text-center">
        <div class="text-lg md:text-xl font-bold text-brand-blue">${fmt(totalValue)}</div>
        <div class="text-[11px] text-gray-500 mt-1">Volume commerce interieur</div>
        <div class="text-[10px] text-gray-400">FCFA courants</div>
      </div>
      <div class="bg-brand-frost rounded-lg p-4 text-center">
        <div class="text-lg md:text-xl font-bold text-brand-navy">${byProduct.length}</div>
        <div class="text-[11px] text-gray-500 mt-1">Categories de produits</div>
        <div class="text-[10px] text-gray-400">${period}</div>
      </div>
      <div class="bg-brand-frost rounded-lg p-4 text-center">
        <div class="text-lg md:text-xl font-bold text-brand-gold">${regionData.length}</div>
        <div class="text-[11px] text-gray-500 mt-1">Regions couvertes</div>
        <div class="text-[10px] text-gray-400">Analyse regionale</div>
      </div>
      <div class="bg-brand-frost rounded-lg p-4 text-center">
        <div class="text-lg md:text-xl font-bold text-emerald-600">${topPartners.length}</div>
        <div class="text-[11px] text-gray-500 mt-1">Zones regionales</div>
        <div class="text-[10px] text-gray-400">WAEMU & CEDEAO</div>
      </div>
      <div class="bg-brand-frost rounded-lg p-4 text-center">
        <div class="text-lg md:text-xl font-bold text-brand-navy">${cpiLatest ? cpiLatest.value.toLocaleString('fr-FR', { maximumFractionDigits: 1 }) : 'n/a'}</div>
        <div class="text-[11px] text-gray-500 mt-1">Indice des prix (CPI)</div>
        <div class="text-[10px] ${cpiYoY === null ? 'text-gray-400' : (cpiYoY >= 0 ? 'text-red-400' : 'text-emerald-600')}">${cpiYoY === null ? 'n/a' : (cpiYoY >= 0 ? '+' : '') + cpiYoY.toLocaleString('fr-FR', { maximumFractionDigits: 1 }) + '% (YoY)'}</div>
      </div>
    </div>
  </div>
</section>

<section class="py-10 bg-gray-50">
  <div class="max-w-6xl mx-auto px-4 sm:px-6">
    <div class="bg-white border border-gray-100 rounded-lg p-5 mb-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-sm font-semibold text-gray-800">Evolution de l'indice des prix a la consommation (CPI)</h3>
        <span class="text-[10px] text-gray-400">${cpiSeries[0]?.label || 'n/a'}-${cpiSeries[cpiSeries.length - 1]?.label || 'n/a'}</span>
      </div>
      <div class="bg-gray-50 rounded-md p-3">
        <canvas id="chart-cpi-trend" height="180"></canvas>
      </div>
      <div class="mt-2 text-[10px] text-gray-300 text-right">Source: CPI API</div>
    </div>

    <div class="grid lg:grid-cols-2 gap-6 mb-6">
      <div class="bg-white border border-gray-100 rounded-lg p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-semibold text-gray-800">Commerce par categorie (FCFA)</h3>
          <span class="text-[10px] text-gray-400">${period}</span>
        </div>
        <div class="bg-gray-50 rounded-md p-3">
          <canvas id="chart-products-horizontal" height="250"></canvas>
        </div>
      </div>

      <div class="bg-white border border-gray-100 rounded-lg p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-semibold text-gray-800">Marches regionaux (FCFA)</h3>
          <span class="text-[10px] text-gray-400">${period}</span>
        </div>
        <div class="bg-gray-50 rounded-md p-3">
          <canvas id="chart-regions-doughnut" height="250"></canvas>
        </div>
      </div>
    </div>

    <div class="bg-white border border-gray-100 rounded-lg p-5 mb-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-sm font-semibold text-gray-800">Part des categories de produits (%)</h3>
        <span class="text-[10px] text-gray-400">${period}</span>
      </div>
      <div class="bg-gray-50 rounded-md p-3">
        <canvas id="chart-products-pie" height="240"></canvas>
      </div>
    </div>

    <div class="bg-white border border-gray-100 rounded-lg p-5">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-sm font-semibold text-gray-800">Flux commerciaux regionaux (FCFA)</h3>
        <span class="text-[10px] text-gray-400">${period}</span>
      </div>
      <div class="bg-gray-50 rounded-md p-3">
        <canvas id="chart-partners-bar" height="180"></canvas>
      </div>
    </div>
  </div>
</section>

<section class="bg-white py-8 border-t border-gray-100">
  <div class="max-w-6xl mx-auto px-4 sm:px-6">
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <p class="text-xs text-gray-500"><i class="fas fa-info-circle mr-1"></i> Source : Ministere du Commerce + CPI</p>
        <p class="text-[10px] text-gray-400 mt-1">Commerce interieur en FCFA; CPI pour suivi des prix.</p>
      </div>
      <div class="flex items-center gap-3">
        <a href="/api/ministry/commerce?type=domestic" target="_blank" class="text-[10px] bg-brand-frost border border-brand-ice px-3 py-1.5 rounded hover:bg-brand-ice/50 text-gray-700 transition-colors">
          <i class="fas fa-code mr-1"></i> API commerce
        </a>
        <a href="/api/imf/cpi" target="_blank" class="text-[10px] bg-brand-frost border border-brand-ice px-3 py-1.5 rounded hover:bg-brand-ice/50 text-gray-700 transition-colors">
          <i class="fas fa-chart-line mr-1"></i> API CPI
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
  const productColors = [blue, navy, gold, lightBlue, '#7c3aed', '#0d9488', '#ea580c', '#f43f5e'];
  const regionColors = ['#ec4899', '#06b6d4', '#f59e0b', '#8b5cf6', '#14b8a6', '#f97316', '#06b6d4'];

  const cpiSeries = ${JSON.stringify(cpiSeries)};
  const products = ${JSON.stringify(byProduct)};
  const regions = ${JSON.stringify(regionData)};
  const partners = ${JSON.stringify(topPartners)};

  if (cpiSeries.length) {
    new Chart(document.getElementById('chart-cpi-trend'), {
      type: 'line',
      data: {
        labels: cpiSeries.map(p => p.label),
        datasets: [{
          label: 'CPI',
          data: cpiSeries.map(p => p.value),
          borderColor: navy,
          backgroundColor: navy + '15',
          fill: true,
          tension: 0.25,
          pointRadius: 2,
          borderWidth: 2,
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          y: { grid: { color: gridColor }, ticks: { font: { size: 10 } } },
          x: { grid: { display: false }, ticks: { font: { size: 9 } } }
        }
      }
    });
  }

  new Chart(document.getElementById('chart-products-horizontal'), {
    type: 'bar',
    data: {
      labels: products.map(p => p.productFr),
      datasets: [{
        label: 'Valeur commerciale (FCFA)',
        data: products.map(p => p.value),
        backgroundColor: products.map((_, i) => productColors[i % productColors.length] + '70'),
        borderColor: products.map((_, i) => productColors[i % productColors.length]),
        borderWidth: 1,
        borderRadius: 3,
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: gridColor }, ticks: { font: { size: 10 } } },
        y: { grid: { display: false }, ticks: { font: { size: 10 } } }
      }
    }
  });

  new Chart(document.getElementById('chart-regions-doughnut'), {
    type: 'doughnut',
    data: {
      labels: regions.map(r => r.region),
      datasets: [{
        data: regions.map(r => r.share),
        backgroundColor: regions.map((_, i) => regionColors[i % regionColors.length] + '85'),
        borderColor: regions.map((_, i) => regionColors[i % regionColors.length]),
        borderWidth: 2,
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'right', labels: { font: { size: 9, family: fontFamily }, padding: 12, boxWidth: 10 } }
      }
    }
  });

  new Chart(document.getElementById('chart-products-pie'), {
    type: 'pie',
    data: {
      labels: products.map(p => p.productFr),
      datasets: [{
        data: products.map(p => p.share),
        backgroundColor: products.map((_, i) => productColors[i % productColors.length] + '75'),
        borderColor: products.map((_, i) => productColors[i % productColors.length]),
        borderWidth: 2,
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom', labels: { font: { size: 10, family: fontFamily }, padding: 12, boxWidth: 12 } }
      }
    }
  });

  new Chart(document.getElementById('chart-partners-bar'), {
    type: 'bar',
    data: {
      labels: partners.map(p => p.country),
      datasets: [{
        label: 'Flux commerciaux (FCFA)',
        data: partners.map(p => p.value),
        backgroundColor: partners.map((_, i) => (i === 0 ? blue : emerald) + '70'),
        borderColor: partners.map((_, i) => i === 0 ? blue : emerald),
        borderWidth: 1,
        borderRadius: 2,
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 9 } } },
        y: { grid: { color: gridColor }, ticks: { font: { size: 9 } } }
      }
    }
  });
});
</script>
`

  return layout(content, {
    title: 'Commerce interieur',
    description: 'Tableau de bord du commerce interieur du Senegal avec indicateur CPI.',
    path: '/commerce-interieur',
  })
}
