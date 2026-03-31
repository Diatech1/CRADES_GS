import { layout } from '../components/layout'
import { fetchIndustryData } from '../utils/industry-sheets-api'

function fmt(value: number, digits = 1): string {
  return value.toLocaleString('fr-FR', { minimumFractionDigits: digits, maximumFractionDigits: digits })
}

export async function industriePage(): Promise<string> {
  const data = await fetchIndustryData()
  const { year, indicators, ihpiData, ihpiBranches, ippiData, ippiBranches, icaiData, icaiBranches, pibBranches, cipData, cipScore, pciData, productionDPEE, tucpData } = data

  // ── KPI values ──
  const ihpiInd = indicators.find(i => i.name.includes('IHPI'))
  const ippiInd = indicators.find(i => i.name.includes('IPPI'))
  const icaiInd = indicators.find(i => i.name.includes('ICAI'))
  const cipInd  = indicators.find(i => i.name.includes('CIP'))

  // ── IHPI chart data (ensemble + disaggregated branches) ──
  const ihpiRecent = ihpiData.slice(-12)
  const latestIHPI = ihpiData[ihpiData.length - 1]
  const ihpiBranchColors = ['#044bad', '#059669', '#b8943e', '#dc2626', '#7c3aed', '#0891b2', '#ea580c', '#e11d48', '#16a085', '#8e44ad', '#f39c12', '#2980b9', '#c0392b']
  const ihpiBranchShortNames: Record<string, string> = {
    'INDUSTRIES EXTRACTIVES': 'Extractives',
    'INDUSTRIES AGRO-ALIMENTAIRES': 'Agro-alimentaires',
    'INDUSTRIES TEXTILES': 'Textiles',
    'INDUSTRIE DE CUIR': 'Cuir & Chaussures',
    'INDUSTRIES DU PAPIER': 'Papier & Carton',
    'INDUSTRIES DE TRANSFORMATION DE PRODUITS PETROLIERS': 'Raffinage Pétrole',
    'INDUSTRIES CHIMIQUES': 'Chimie/Plastique',
    'INDUSTRIES DE MATÉRIAUX': 'Mat. Minéraux',
    'INDUSTRIES MÉTALLIQUES': 'Métallurgie',
    'INDUSTRIES ÉLECTRONIQUES': 'Électronique/Machines',
    'AUTRES INDUSTRIES MANUFACTURIÈRES': 'Autres Manuf.',
    'INDUSTRIES DE PRODUCTION ET DE DISTRIBUTION': 'Électricité/Gaz/Eau',
    'INDUSTRIES ENVIRONNEMENTALES': 'Environnement',
  }
  const getIhpiShort = (name: string): string => {
    for (const [key, val] of Object.entries(ihpiBranchShortNames)) {
      if (name.toUpperCase().includes(key.toUpperCase())) return val
    }
    return name.length > 20 ? name.substring(0, 18) + '…' : name
  }
  const ihpiDisaggregated = ihpiBranches.filter(b =>
    !b.branch.toUpperCase().includes('ENSEMBLE') &&
    !b.branch.toUpperCase().includes('EGRENAGE')
  )

  // ── ICAI chart data (ensemble + disaggregated branches) ──
  const icaiRecent = icaiData.slice(-12)
  // Prepare disaggregated ICAI branches for multi-line chart
  const icaiBranchColors = ['#044bad', '#059669', '#b8943e', '#dc2626', '#7c3aed', '#0891b2', '#ea580c']
  const icaiBranchShortNames: Record<string, string> = {
    'PRODUITS DES INDUSTRIES EXTRACTIVES': 'Extractives',
    'PRODUITS MANUFACTURIERS': 'Manufacturiers',
    'ELECTRICITE, GAZ ET EAU': 'Électricité/Gaz/Eau',
    'PRODUITS DES INDUSTRIES ENVIRONNEMENTALES': 'Environnement',
    'Produits chimiques, pharmaceutiques, du travail du caoutchouc et du plastique': 'Chimie/Plastique',
    'Produits métallurgiques et de fonderie, ouvrages en métaux ; produit du travail des métaux': 'Métallurgie',
    'Produits électroniques et informatiques, équipements électriques, machines et équipements': 'Électronique/Machines',
    'Autres industries manufacturières': 'Autres Manuf.',
  }
  const getIcaiShort = (name: string): string => {
    for (const [key, val] of Object.entries(icaiBranchShortNames)) {
      if (name.toUpperCase().includes(key.toUpperCase())) return val
    }
    return name.length > 20 ? name.substring(0, 18) + '…' : name
  }
  // Filter only main aggregate branches (skip ENSEMBLE which is already the main line)
  const icaiDisaggregated = icaiBranches.filter(b =>
    !b.branch.toUpperCase().includes('ENSEMBLE')
  )

  // ── IPPI chart data: last 24 months of ENSEMBLE ──
  const ippiRecent = ippiData.slice(-24)

  // ── PCI Granulaire UNCTAD data ──
  const pciSorted = [...pciData].sort((a, b) => a.year - b.year)
  const pci2000 = pciSorted.find(d => d.year === 2000)
  const pciLatest = pciSorted[pciSorted.length - 1]
  const pciDimensions = [
    { key: 'humanCapital', label: 'Capital Humain' },
    { key: 'naturalCapital', label: 'Capital Naturel' },
    { key: 'energy', label: 'Énergie' },
    { key: 'transport', label: 'Transport' },
    { key: 'ict', label: 'TIC' },
    { key: 'institutions', label: 'Institutions' },
    { key: 'privateSector', label: 'Secteur Privé' },
    { key: 'structuralChange', label: 'Changement Structurel' },
  ]

  // ── Production DPEE table: last 12 periods ──
  const dpeeProducts = productionDPEE.products
  const dpeeSeries = productionDPEE.series.slice(-12)
  // Short names for column headers
  const dpeeShortNames: Record<string, string> = {
    'Pétrole Brut (millions bbl)': 'Pétrole Brut',
    'Phosphates - Total (1000t)': 'Phosphates',
    'dont: Phosphate de calcium (1000t)': 'Phosphate Ca.',
    'Prod. Arachidiers - Total (1000t)': 'Arachide',
    'OR - Production (Kg)': 'Or (Kg)',
    'Électricité - Ventes totales (M kwh)': 'Électricité',
    'Eau - Production (Mm³)': 'Eau',
    'Ciment - Production (1000t)': 'Ciment',
    'Acide Phosphorique (1000t)': 'Acide Phosph.',
    'Engrais Solides (1000t)': 'Engrais',
    'Sel - Production (tonnes)': 'Sel',
  }
  const getDpeeShort = (p: string): string => dpeeShortNames[p] || (p.length > 16 ? p.substring(0, 14) + '…' : p)

  const content = `
<!-- Hero header -->
<section class="bg-brand-navy py-14 lg:py-18">
  <div class="max-w-6xl mx-auto px-4 sm:px-6">
    <nav class="text-xs text-gray-400 mb-4">
      <a href="/" class="hover:text-white">Accueil</a>
      <span class="mx-2 text-gray-600">/</span>
      <span class="text-gray-300">Industrie</span>
    </nav>
    <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
      <div>
        <h1 class="font-display text-2xl lg:text-3xl text-white">Tableau de Bord Industrie</h1>
        <p class="text-gray-400 mt-2 text-sm max-w-xl">
          Production, prix, chiffre d'affaires, compétitivité et transformation structurelle du secteur industriel sénégalais.
          Mise à jour : <span class="text-brand-gold font-medium">${latestIHPI?.period || year}</span>.
        </p>
      </div>
      <div class="flex items-center gap-2 text-xs text-gray-500">
        <i class="fas fa-industry"></i>
        <span>Sources : ANSD / UNIDO / UNCTAD</span>
      </div>
    </div>
  </div>
</section>

<!-- ═══════════ SECTION 1: Executive KPIs ═══════════ -->
<section class="bg-white border-b border-gray-100">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 py-6">
    <div class="grid grid-cols-2 lg:grid-cols-5 gap-4">
      <!-- IHPI (+24.9% = good = green) -->
      <div class="bg-brand-frost rounded-lg p-4 text-center">
        <div class="text-lg md:text-xl font-bold text-emerald-600">+24,9%</div>
        <div class="text-[11px] text-gray-500 mt-1">IHPI – Production</div>
        <div class="text-[10px] text-gray-400">${ihpiInd?.lastPeriod || 'Cumul 2025 (Déc. 2024)'}</div>
      </div>
      <!-- ICAI (+16.5% = good = green) -->
      <div class="bg-brand-frost rounded-lg p-4 text-center">
        <div class="text-lg md:text-xl font-bold text-emerald-600">+16,5%</div>
        <div class="text-[11px] text-gray-500 mt-1">ICAI – Chiffre d'Affaires</div>
        <div class="text-[10px] text-gray-400">${icaiInd?.lastPeriod || 'Var. annuelle T3 2025'}</div>
      </div>
      <!-- IPPI (−1.7% deflation = good = green) -->
      <div class="bg-brand-frost rounded-lg p-4 text-center">
        <div class="text-lg md:text-xl font-bold text-emerald-600">−1,7%</div>
        <div class="text-[11px] text-gray-500 mt-1">IPPI – Prix Production</div>
        <div class="text-[10px] text-gray-400">${ippiInd?.lastPeriod || 'Var. annuelle Jan. 2026'}</div>
      </div>
      <!-- CIP (Rang 50 = bad = red) -->
      <div class="bg-brand-frost rounded-lg p-4 text-center">
        <div class="text-lg md:text-xl font-bold text-red-600">Rang 50</div>
        <div class="text-[11px] text-gray-500 mt-1">CIP – Compétitivité</div>
        <div class="text-[10px] text-gray-400">Score : ${cipScore ? fmt(cipScore.score, 3) : '0,061'} — ${cipScore?.year || 2023}</div>
      </div>
      <!-- TUCP (latest value, >=80% = green, else red) -->
      <div class="bg-brand-frost rounded-lg p-4 text-center">
        <div class="text-lg md:text-xl font-bold ${tucpData.length > 0 && tucpData[tucpData.length - 1].value >= 80 ? 'text-emerald-600' : tucpData.length > 0 ? 'text-red-600' : 'text-gray-400'}">${tucpData.length > 0 ? fmt(tucpData[tucpData.length - 1].value) + ' %' : '—'}</div>
        <div class="text-[11px] text-gray-500 mt-1">TUCP – Capacités</div>
        <div class="text-[10px] text-gray-400">${tucpData.length > 0 ? tucpData[tucpData.length - 1].period : 'Données BCEAO en attente'}</div>
      </div>
    </div>
  </div>
</section>

<!-- ═══════════ SECTION 2: IHPI & ICAI Line Graphs ═══════════ -->
<section class="py-10 bg-gray-50">
  <div class="max-w-6xl mx-auto px-4 sm:px-6">
    <div class="grid lg:grid-cols-2 gap-6">
      <!-- IHPI Disaggregated Line Chart -->
      <div class="bg-white border border-gray-100 rounded-lg p-5">
        <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div>
            <h3 class="text-sm font-semibold text-gray-800">Indice de Production Industrielle (IHPI)</h3>
            <p class="text-[10px] text-gray-500 mt-0.5">${ihpiDisaggregated.length} sous-secteurs · cliquer pour isoler une ligne</p>
          </div>
          <span class="text-[10px] text-gray-400">${ihpiRecent[0]?.period || ''} – ${ihpiRecent[ihpiRecent.length - 1]?.period || ''}</span>
        </div>
        <div class="bg-gray-50 rounded-md p-3" style="height: 280px;">
          <canvas id="chart-ihpi"></canvas>
        </div>
        <div id="legend-ihpi" class="mt-2"></div>
        <div class="mt-2 flex items-center justify-between">
          <span class="text-xs text-gray-500">Dernière valeur Ensemble : <strong class="text-brand-blue">${latestIHPI ? fmt(latestIHPI.value) : 'n/a'}</strong></span>
          <span class="text-[10px] text-gray-400">Base 100 = 2006</span>
        </div>
        <p class="text-[9px] text-gray-400 mt-2 text-center italic">Source : ANSD — IHPI mensuel</p>
      </div>

      <!-- ICAI Disaggregated Line Chart -->
      <div class="bg-white border border-gray-100 rounded-lg p-5">
        <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div>
            <h3 class="text-sm font-semibold text-gray-800">Indice du Chiffre d'Affaires Industriel (ICAI)</h3>
            <p class="text-[10px] text-gray-500 mt-0.5">${icaiDisaggregated.length} sous-secteurs · cliquer pour isoler une ligne</p>
          </div>
          <span class="text-[10px] text-gray-400">${icaiRecent[0]?.period || ''} – ${icaiRecent[icaiRecent.length - 1]?.period || ''}</span>
        </div>
        <div class="bg-gray-50 rounded-md p-3" style="height: 280px;">
          <canvas id="chart-icai"></canvas>
        </div>
        <div id="legend-icai" class="mt-2"></div>
        <div class="mt-2 flex items-center justify-between">
          <span class="text-xs text-gray-500">Dernière valeur Ensemble : <strong class="text-brand-navy">${icaiRecent.length > 0 ? fmt(icaiRecent[icaiRecent.length - 1].value) : 'n/a'}</strong></span>
          <span class="text-[10px] text-gray-400">Base 100 = 2016</span>
        </div>
        <p class="text-[9px] text-gray-400 mt-2 text-center italic">Source : ANSD — ICAI trimestriel</p>
      </div>
    </div>
  </div>
</section>

<!-- ═══════════ SECTION 3: IPPI & TUCP (Operational Metrics) ═══════════ -->
<section class="py-10">
  <div class="max-w-6xl mx-auto px-4 sm:px-6">
    <div class="grid lg:grid-cols-2 gap-6">
      <!-- IPPI Chart -->
      <div class="bg-white border border-gray-100 rounded-lg p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-semibold text-gray-800">Indice des Prix à la Production (IPPI)</h3>
          <span class="text-[10px] text-gray-400">${ippiRecent[0]?.period || ''} – ${ippiRecent[ippiRecent.length - 1]?.period || ''}</span>
        </div>
        <div class="bg-gray-50 rounded-md p-3" style="height: 280px;">
          <canvas id="chart-ippi"></canvas>
        </div>
        <div class="mt-2 flex items-center justify-between">
          <span class="text-xs text-gray-500">Dernière valeur : <strong class="text-rose-600">${ippiRecent.length > 0 ? fmt(ippiRecent[ippiRecent.length - 1].value) : 'n/a'}</strong></span>
          <span class="text-[10px] text-gray-400">Base 100 = 2015</span>
        </div>
        <p class="text-[9px] text-gray-400 mt-2 text-center italic">Source : ANSD — IPPI mensuel (Ensemble hors égrenage coton)</p>
      </div>

      <!-- TUCP Chart -->
      <div class="bg-white border border-gray-100 rounded-lg p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-semibold text-gray-800">Taux d'Utilisation des Capacités Productives</h3>
          <span class="text-[10px] text-gray-400">${tucpData.length > 0 ? tucpData[0].period + ' – ' + tucpData[tucpData.length - 1].period : ''}</span>
        </div>
        <div class="bg-gray-50 rounded-md p-3" style="height: 280px;">
          <canvas id="chart-tucp"></canvas>
        </div>
        <div class="mt-2 flex items-center justify-between">
          <span class="text-xs text-gray-500">Dernière valeur : <strong class="text-emerald-600">${tucpData.length > 0 ? fmt(tucpData[tucpData.length - 1].value) + ' %' : 'n/a'}</strong></span>
          <span class="text-[10px] text-gray-400">Unité : %</span>
        </div>
        <p class="text-[9px] text-gray-400 mt-2 text-center italic">Source : BCEAO — Bulletin Trimestriel des Statistiques</p>
      </div>
    </div>
  </div>
</section>

<!-- ═══════════ SECTION 4: Compétitivité Structurelle (PCI & CIP) ═══════════ -->
<section class="py-10 bg-gray-50">
  <div class="max-w-6xl mx-auto px-4 sm:px-6">
    <div class="grid lg:grid-cols-2 gap-6">
      <!-- PCI Granulaire UNCTAD Radar (LEFT) -->
      <div class="bg-white border border-gray-100 rounded-lg p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-semibold text-gray-800">Capacités Productives (PCI – UNCTAD)</h3>
          <span class="text-[10px] text-gray-400">${pci2000?.year || 2000} vs ${pciLatest?.year || 2024}</span>
        </div>
        <div class="bg-gray-50 rounded-md p-3" style="height: 280px;">
          <canvas id="chart-pci-radar"></canvas>
        </div>
        <div class="mt-3 grid grid-cols-2 gap-2">
          ${pciDimensions
            .map(d => {
              const from = (pci2000 as any)?.[d.key] || 0
              const to = (pciLatest as any)?.[d.key] || 0
              const change = to - from
              return `
          <div class="flex items-center justify-between gap-1 text-[10px]">
            <span class="text-gray-600 truncate">${d.label}</span>
            <span class="font-semibold ${change >= 0 ? 'text-emerald-600' : 'text-red-500'}">${change >= 0 ? '+' : ''}${fmt(change, 1)}</span>
          </div>`
            }).join('')}
        </div>
        <p class="text-[9px] text-gray-400 mt-2 text-center italic">Source : UNCTAD — Indice des Capacités Productives (0–100)</p>
      </div>

      <!-- CIP Score & Rank dual-axis chart (RIGHT) -->
      <div class="bg-white border border-gray-100 rounded-lg p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-semibold text-gray-800">Indice de Compétitivité Industrielle (CIP)</h3>
          <span class="text-[10px] text-gray-400">Score & Rang mondial — UNIDO</span>
        </div>
        <div class="bg-gray-50 rounded-md p-3" style="height: 280px;">
          <canvas id="chart-cip"></canvas>
        </div>
        <p class="text-[9px] text-gray-400 mt-3 text-center italic">Source : UNIDO CIP Index. Score plus élevé = meilleure compétitivité.</p>
      </div>
    </div>
  </div>
</section>

<!-- ═══════════ SECTION 5: Production Industrielle DPEE – Last 12 Periods ═══════════ -->
<section class="py-10">
  <div class="max-w-6xl mx-auto px-4 sm:px-6">
    <div class="bg-white border border-gray-100 rounded-lg overflow-hidden">
      <div class="bg-brand-frost px-4 py-3 border-b border-brand-ice/50">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-semibold text-gray-800">
            <i class="fas fa-table text-brand-navy mr-1.5"></i>
            Production Industrielle (DPEE)
          </h3>
          <span class="text-[10px] text-gray-400">12 dernières périodes</span>
        </div>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-xs">
          <thead>
            <tr class="bg-gray-50 text-gray-500 text-left">
              <th class="sticky left-0 bg-gray-50 px-2 py-2 font-medium w-[56px]">Période</th>
              ${dpeeProducts.map(p => {
                const short = getDpeeShort(p)
                // Extract unit from original label
                const unitMatch = p.match(/\(([^)]+)\)/)
                const unit = unitMatch ? unitMatch[1] : ''
                return `<th class="px-1 py-2 font-medium text-center w-[56px] leading-3" title="${p}"><div class="flex flex-col items-center"><span class="block truncate w-full text-center text-[9px]">${short}</span>${unit ? `<span class="block text-[7px] text-gray-400 font-normal">${unit}</span>` : ''}</div></th>`
              }).join('')}
            </tr>
          </thead>
          <tbody>
            ${dpeeSeries.slice().reverse().map((row, rowIdx, reversed) => {
              const prevRow = rowIdx + 1 < reversed.length ? reversed[rowIdx + 1] : null
              // Format date
              const d = String(row.date || '').trim()
              const dm = d.match(/^(\d{4})-(\d{2})/)
              let dateLabel = d
              if (dm) {
                const months: Record<string, string> = { '01': 'Jan', '02': 'Fév', '03': 'Mar', '04': 'Avr', '05': 'Mai', '06': 'Juin', '07': 'Juil', '08': 'Aoû', '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Déc' }
                dateLabel = (months[dm[2]] || dm[2]) + ' ' + dm[1]
              }
              return `
            <tr class="border-t border-gray-50 hover:bg-gray-50/50">
              <td class="sticky left-0 bg-white px-2 py-2 text-left font-medium text-gray-800">${dateLabel}</td>
              ${dpeeProducts.map(p => {
                const curN = row.values?.[p] ?? null
                const prevN = prevRow?.values?.[p] ?? null
                const delta = (curN !== null && prevN !== null && Number.isFinite(curN) && Number.isFinite(prevN))
                  ? curN - prevN : null
                const arrow = delta === null || Math.abs(delta) < 0.001 ? '' :
                  delta > 0 ? '<span class="ml-0.5 text-emerald-600" aria-label="hausse">▲</span>' :
                  '<span class="ml-0.5 text-red-500" aria-label="baisse">▼</span>'
                const fmtVal = curN !== null ? (Math.abs(curN) >= 100 ? Math.round(curN).toLocaleString('fr-FR') : curN.toFixed(1).replace('.', ',')) : ''
                return `<td class="px-1 py-2 text-center text-gray-600"><span class="inline-flex items-center justify-center">${fmtVal}${arrow}</span></td>`
              }).join('')}
            </tr>`
            }).join('')}
          </tbody>
        </table>
      </div>
      <div class="px-4 py-2">
        <p class="text-[9px] text-gray-400 text-center italic">Source : DPEE — Production Industrielle. ▲ hausse / ▼ baisse vs période précédente.</p>
      </div>
    </div>
  </div>
</section>

<!-- Source footer -->
<section class="bg-brand-frost border-t border-brand-ice/50 py-8">
  <div class="max-w-6xl mx-auto px-4 sm:px-6">
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <p class="text-xs text-gray-500">
          <i class="fas fa-info-circle mr-1"></i>
          Sources :
          <a href="https://www.ansd.sn" target="_blank" class="text-brand-blue hover:underline">ANSD</a> (IHPI, IPPI, ICAI),
          <a href="https://stat.unido.org" target="_blank" class="text-brand-blue hover:underline">UNIDO</a> (CIP),
          <a href="https://unctadstat.unctad.org" target="_blank" class="text-brand-blue hover:underline">UNCTAD</a> (PCI),
          <a href="https://www.bceao.int" target="_blank" class="text-brand-blue hover:underline">BCEAO</a> (TUCP)
        </p>
        <p class="text-[10px] text-gray-400 mt-1">Données mises à jour automatiquement depuis les sources officielles.</p>
      </div>
      <div class="flex items-center gap-3">
        <a href="/api/industrie" target="_blank" class="text-[10px] bg-white border border-gray-200 px-3 py-1.5 rounded hover:border-gray-300 text-gray-500 transition-colors">
          <i class="fas fa-code mr-1"></i> API JSON
        </a>
      </div>
    </div>
  </div>
</section>

<!-- ═══════════ Chart.js Scripts ═══════════ -->
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
  const rose = '#e11d48';
  const emerald = '#10b981';

  // ─── Custom HTML legend with solo-click + sorted grid ────
  function buildCustomLegend(chart, containerId, cols) {
    const container = document.getElementById(containerId);
    if (!container) return;
    chart._soloIndex = null;
    // Collect items: index 0 = ENSEMBLE (always first), rest sorted alphabetically
    const items = chart.data.datasets.map((ds, i) => ({ idx: i, label: ds.label, color: ds.borderColor }));
    const ensemble = items.filter(it => it.label === 'ENSEMBLE');
    const rest = items.filter(it => it.label !== 'ENSEMBLE').sort((a, b) => a.label.localeCompare(b.label, 'fr'));
    const sorted = [...ensemble, ...rest];
    // Build grid
    container.style.display = 'grid';
    container.style.gridTemplateColumns = 'repeat(' + cols + ', 1fr)';
    container.style.gap = '3px 8px';
    container.style.padding = '6px 0 0 0';
    sorted.forEach(item => {
      const el = document.createElement('div');
      el.style.cssText = 'display:flex;align-items:center;gap:4px;cursor:pointer;padding:2px 0;user-select:none;';
      el.innerHTML = '<span style="display:inline-block;width:10px;height:10px;border-radius:50%;flex-shrink:0;background:' + item.color + ';"></span>'
        + '<span style="font-size:9px;color:#475569;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + item.label + '</span>';
      el.title = item.label;
      el.dataset.idx = item.idx;
      el.addEventListener('click', () => {
        const idx = parseInt(el.dataset.idx);
        if (chart._soloIndex === idx) {
          chart.data.datasets.forEach((ds, i) => { chart.setDatasetVisibility(i, true); });
          chart._soloIndex = null;
          container.querySelectorAll('div').forEach(d => { d.style.opacity = '1'; });
        } else {
          chart.data.datasets.forEach((ds, i) => { chart.setDatasetVisibility(i, i === idx); });
          chart._soloIndex = idx;
          container.querySelectorAll('div').forEach(d => { d.style.opacity = d.dataset.idx == idx ? '1' : '0.35'; });
        }
        chart.update();
      });
      container.appendChild(el);
    });
  }

  // ─── 1. IHPI Disaggregated Multi-Line Chart ────
  const ihpiEnsemble = ${JSON.stringify(ihpiRecent)};
  const ihpiBranchesChart = ${JSON.stringify(ihpiDisaggregated.map((b, i) => ({
    label: getIhpiShort(b.branch),
    data: b.data,
    color: ihpiBranchColors[i % ihpiBranchColors.length],
  })))};
  const ihpiLabels = ihpiEnsemble.map(d => d.period);
  const ihpiDatasets = [{
    label: 'ENSEMBLE',
    data: ihpiEnsemble.map(d => d.value),
    borderColor: '#1e293b',
    backgroundColor: '#1e293b15',
    fill: true,
    tension: 0.3,
    pointRadius: 3,
    pointHoverRadius: 5,
    borderWidth: 2.5,
  }];
  ihpiBranchesChart.forEach(b => {
    ihpiDatasets.push({
      label: b.label,
      data: ihpiLabels.map(period => {
        const match = b.data.find(d => d.period === period);
        return match ? match.value : null;
      }),
      borderColor: b.color,
      backgroundColor: b.color + '10',
      fill: false,
      tension: 0.3,
      pointRadius: 2,
      pointHoverRadius: 5,
      borderWidth: 1.5,
    });
  });
  const ihpiChart = new Chart(document.getElementById('chart-ihpi'), {
    type: 'line',
    data: { labels: ihpiLabels, datasets: ihpiDatasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'nearest', intersect: true },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => {
              const v = ctx.parsed.y;
              if (v === null) return '';
              return ' ' + ctx.dataset.label + ': ' + v.toFixed(1);
            }
          }
        }
      },
      scales: {
        y: { beginAtZero: false, grid: { color: gridColor }, ticks: { font: { size: 10 } } },
        x: { grid: { display: false }, ticks: { font: { size: 9 }, maxRotation: 45, minRotation: 45, autoSkip: true, maxTicksLimit: 12 } }
      }
    }
  });
  buildCustomLegend(ihpiChart, 'legend-ihpi', 4);

  // ─── 2. ICAI Disaggregated Multi-Line Chart ────
  const icaiEnsemble = ${JSON.stringify(icaiRecent)};
  const icaiBranches = ${JSON.stringify(icaiDisaggregated.map((b, i) => ({
    label: getIcaiShort(b.branch),
    data: b.data,
    color: icaiBranchColors[i % icaiBranchColors.length],
  })))};
  const icaiLabels = icaiEnsemble.map(d => d.period);
  const icaiDatasets = [{
    label: 'ENSEMBLE',
    data: icaiEnsemble.map(d => d.value),
    borderColor: '#1e293b',
    backgroundColor: '#1e293b15',
    fill: true,
    tension: 0.3,
    pointRadius: 3,
    pointHoverRadius: 5,
    borderWidth: 2.5,
  }];
  icaiBranches.forEach(b => {
    icaiDatasets.push({
      label: b.label,
      data: icaiLabels.map(period => {
        const match = b.data.find(d => d.period === period);
        return match ? match.value : null;
      }),
      borderColor: b.color,
      backgroundColor: b.color + '10',
      fill: false,
      tension: 0.3,
      pointRadius: 2,
      pointHoverRadius: 5,
      borderWidth: 1.5,
    });
  });
  const icaiChart = new Chart(document.getElementById('chart-icai'), {
    type: 'line',
    data: { labels: icaiLabels, datasets: icaiDatasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'nearest', intersect: true },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => {
              const v = ctx.parsed.y;
              if (v === null) return '';
              return ' ' + ctx.dataset.label + ': ' + v.toFixed(1);
            }
          }
        }
      },
      scales: {
        y: { beginAtZero: false, grid: { color: gridColor }, ticks: { font: { size: 10 } } },
        x: { grid: { display: false }, ticks: { font: { size: 9 }, maxRotation: 45, minRotation: 45 } }
      }
    }
  });
  buildCustomLegend(icaiChart, 'legend-icai', 3);

  // ─── 3. IPPI Line Chart ────
  const ippiData = ${JSON.stringify(ippiRecent)};
  new Chart(document.getElementById('chart-ippi'), {
    type: 'line',
    data: {
      labels: ippiData.map(d => d.period),
      datasets: [{
        label: 'IPPI Ensemble',
        data: ippiData.map(d => d.value),
        borderColor: rose,
        backgroundColor: rose + '15',
        fill: true,
        tension: 0.3,
        pointRadius: 1.5,
        pointHoverRadius: 5,
        borderWidth: 2,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => 'IPPI: ' + ctx.parsed.y.toFixed(1) } }
      },
      scales: {
        y: { beginAtZero: false, grid: { color: gridColor }, ticks: { font: { size: 10 } } },
        x: { grid: { display: false }, ticks: { font: { size: 9 }, maxRotation: 45, minRotation: 45, autoSkip: true, maxTicksLimit: 12 } }
      }
    }
  });

  // ─── 4. TUCP Bar Chart ────
  const tucpChartData = ${JSON.stringify(tucpData)};
  new Chart(document.getElementById('chart-tucp'), {
    type: 'bar',
    data: {
      labels: tucpChartData.map(d => d.period),
      datasets: [{
        label: 'Taux d\u2019utilisation (%)',
        data: tucpChartData.map(d => d.value),
        backgroundColor: tucpChartData.map(d => d.value >= 80 ? green + '90' : d.value >= 60 ? gold + '90' : red + '90'),
        borderColor: tucpChartData.map(d => d.value >= 80 ? green : d.value >= 60 ? gold : red),
        borderWidth: 1,
        borderRadius: 3,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => ctx.parsed.y.toFixed(1) + ' %' } }
      },
      scales: {
        y: { min: 40, max: 100, grid: { color: gridColor }, ticks: { font: { size: 9 }, callback: v => v + '%' } },
        x: { grid: { display: false }, ticks: { font: { size: 8 }, maxRotation: 45, minRotation: 45, autoSkip: true, maxTicksLimit: 12 } }
      }
    }
  });

  // ─── 5. PCI Radar Chart ────
  const radarLabels = ${JSON.stringify(pciDimensions.map(d => d.label))};
  const radarData2000 = ${JSON.stringify(pciDimensions.map(d => (pci2000 as any)?.[d.key] || 0))};
  const radarDataLatest = ${JSON.stringify(pciDimensions.map(d => (pciLatest as any)?.[d.key] || 0))};
  new Chart(document.getElementById('chart-pci-radar'), {
    type: 'radar',
    data: {
      labels: radarLabels,
      datasets: [
        {
          label: '${pci2000?.year || 2000}',
          data: radarData2000,
          borderColor: rose,
          backgroundColor: rose + '18',
          borderWidth: 2,
          pointRadius: 3,
          pointBackgroundColor: rose,
        },
        {
          label: '${pciLatest?.year || 2024}',
          data: radarDataLatest,
          borderColor: green,
          backgroundColor: green + '20',
          borderWidth: 2.5,
          pointRadius: 3,
          pointBackgroundColor: green,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top', labels: { font: { size: 10, family: fontFamily }, usePointStyle: true, boxWidth: 8, padding: 8 } }
      },
      scales: {
        r: {
          beginAtZero: true,
          max: 70,
          ticks: { font: { size: 8 }, stepSize: 20, backdropColor: 'transparent' },
          pointLabels: { font: { size: 9 }, color: '#64748b' },
          grid: { color: '#e2e8f0' }
        }
      }
    }
  });

  // ─── 6. CIP Dual-Axis (Score + Rang) ────
  const cipData = ${JSON.stringify(cipData)};
  new Chart(document.getElementById('chart-cip'), {
    data: {
      labels: cipData.map(d => d.year),
      datasets: [
        {
          type: 'bar',
          label: 'Score CIP',
          data: cipData.map(d => d.score),
          backgroundColor: blue + 'cc',
          borderColor: blue,
          borderWidth: 1,
          borderRadius: 4,
          yAxisID: 'y',
          order: 2,
        },
        {
          type: 'line',
          label: 'Rang mondial',
          data: cipData.map(d => d.rank),
          borderColor: gold,
          backgroundColor: gold,
          tension: 0.3,
          pointRadius: 5,
          pointBackgroundColor: gold,
          borderWidth: 2.5,
          yAxisID: 'y1',
          order: 1,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top', labels: { font: { size: 10, family: fontFamily }, usePointStyle: true, boxWidth: 8 } },
        tooltip: {
          callbacks: {
            label: ctx => {
              if (ctx.dataset.type === 'bar') return ' Score : ' + ctx.parsed.y.toFixed(3);
              return ' Rang : ' + ctx.parsed.y + 'e';
            }
          }
        }
      },
      scales: {
        y: { position: 'left', title: { display: true, text: 'Score', font: { size: 10 } }, grid: { color: gridColor }, ticks: { font: { size: 9 } } },
        y1: { position: 'right', title: { display: true, text: 'Rang', font: { size: 10 } }, reverse: true, grid: { display: false }, ticks: { font: { size: 9 } } },
        x: { grid: { display: false }, ticks: { font: { size: 9 } } }
      }
    }
  });
});
</script>
`

  return layout(content, {
    title: 'Tableau de Bord Industrie',
    description: 'Indicateurs de production industrielle, compétitivité et performance du Sénégal — IHPI, IPPI, ICAI, CIP, UNCTAD PCI',
    path: '/industrie',
  })
}
