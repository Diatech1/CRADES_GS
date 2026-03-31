import { layout } from '../components/layout'
import { fetchPmeData } from '../utils/pme-sheets-api'

function fmt(value: number, digits = 1): string {
  return value.toLocaleString('fr-FR', { minimumFractionDigits: digits, maximumFractionDigits: digits })
}

export async function pmePmiPage(): Promise<string> {
  const data = await fetchPmeData()

  const content = `
<!-- Hero header -->
<section class="bg-brand-navy py-14 lg:py-18">
  <div class="max-w-6xl mx-auto px-4 sm:px-6">
    <nav class="text-xs text-gray-400 mb-4">
      <a href="/" class="hover:text-white">Accueil</a>
      <span class="mx-2 text-gray-600">/</span>
      <span class="text-gray-300">PME / PMI</span>
    </nav>
    <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
      <div>
        <h1 class="font-display text-2xl lg:text-3xl text-white">Tableau de Bord PME / PMI</h1>
        <p class="text-gray-400 mt-2 text-sm max-w-xl">
          Immatriculations, structure des entreprises, démographie entrepreneuriale et obstacles à l'activité au Sénégal.
          Données : <span class="text-brand-gold font-medium">2019–2024</span>.
        </p>
      </div>
      <div class="flex items-center gap-2 text-xs text-gray-500">
        <i class="fas fa-briefcase"></i>
        <span>Sources : ANSD / Banque Mondiale</span>
      </div>
    </div>
  </div>
</section>

<!-- ═══════════ SECTION 1: Executive KPIs ═══════════ -->
<section class="bg-white border-b border-gray-100">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 py-6">
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Immatriculations -->
      <div class="bg-brand-frost rounded-lg p-4 text-center">
        <div class="text-lg md:text-xl font-bold text-emerald-600">${data.immatriculations.toLocaleString('fr-FR')}</div>
        <div class="text-[11px] text-gray-500 mt-1">Immatriculations 2024</div>
        <div class="text-[10px] text-gray-400">${data.immatricVariation} vs 2019</div>
      </div>
      <!-- Accès au crédit -->
      <div class="bg-brand-frost rounded-lg p-4 text-center">
        <div class="text-lg md:text-xl font-bold text-amber-600">${data.creditAccess}</div>
        <div class="text-[11px] text-gray-500 mt-1">Accès au Crédit</div>
        <div class="text-[10px] text-gray-400">Ligne de crédit — BM 2024</div>
      </div>
      <!-- Croissance emploi -->
      <div class="bg-brand-frost rounded-lg p-4 text-center">
        <div class="text-lg md:text-xl font-bold text-emerald-600">${data.croissanceEmploi}</div>
        <div class="text-[11px] text-gray-500 mt-1">Croissance Emploi</div>
        <div class="text-[10px] text-gray-400">3 dernières années — BM 2024</div>
      </div>
      <!-- Exportatrices -->
      <div class="bg-brand-frost rounded-lg p-4 text-center">
        <div class="text-lg md:text-xl font-bold text-red-600">${data.exportatrices}</div>
        <div class="text-[11px] text-gray-500 mt-1">Entreprises Exportatrices</div>
        <div class="text-[10px] text-gray-400">Enquête BM 2024</div>
      </div>
    </div>
  </div>
</section>

<!-- ═══════════ SECTION 2: Stacked Bar + Taille ═══════════ -->
<section class="py-10 bg-gray-50">
  <div class="max-w-6xl mx-auto px-4 sm:px-6">
    <div class="grid lg:grid-cols-2 gap-6">
      <!-- Stacked Bar: Immatriculations par Secteur -->
      <div class="bg-white border border-gray-100 rounded-lg p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-semibold text-gray-800">Immatriculations par secteur d'activité</h3>
          <span class="text-[10px] text-gray-400">Entreprises individuelles — 2019–2024</span>
        </div>
        <div class="bg-gray-50 rounded-md p-3" style="height: 280px;">
          <canvas id="chart-stacked-secteur"></canvas>
        </div>
        <p class="text-[9px] text-gray-400 mt-3 text-center italic">Source : ANSD/RNEA — BANIN 2024</p>
      </div>

      <!-- Choropleth Map: Répartition géographique -->
      <div class="bg-white border border-gray-100 rounded-lg p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-semibold text-gray-800">Répartition Géographique des Immatriculations</h3>
          <span class="text-[10px] text-gray-400">% immatriculations 2024</span>
        </div>
        <div class="bg-gray-50 rounded-md p-3 relative" style="height: 280px;">
          <svg id="senegal-map" viewBox="0 0 820 520" preserveAspectRatio="xMidYMid meet" class="absolute inset-0 w-full h-full p-1" xmlns="http://www.w3.org/2000/svg">
            ${data.regionBreakdown.map(r => {
              const regionPaths: Record<string, { d: string; cx: number; cy: number }> = {
                'Dakar':        { d: 'M32.9,229.9L33.0,234.1L21.2,222.8L67.0,207.7L70.5,238.9L44.3,224.5L34.7,224.8L32.9,229.9Z', cx: 43.0, cy: 226.7 },
                'Diourbel':     { d: 'M203.9,244.0L135.8,238.3L129.9,231.5L135.9,220.7L124.9,203.6L154.8,193.0L182.1,200.9L228.9,196.5L240.5,206.7L249.6,201.6L265.5,214.8L278.7,214.9L275.6,227.2L264.2,232.2L253.8,225.3L247.6,229.3L235.8,223.8L228.2,243.7L210.3,248.1L203.9,244.0Z', cx: 191.9, cy: 221.4 },
                'Fatick':       { d: 'M148.0,348.9L140.3,348.2L129.3,331.3L115.8,325.0L116.6,295.7L111.8,290.2L120.1,283.2L123.8,258.0L141.4,250.9L145.6,240.1L163.1,238.2L218.1,247.7L232.9,240.2L234.5,224.3L260.9,228.9L266.4,239.4L254.3,249.4L243.1,250.0L233.6,263.4L222.3,263.3L221.8,255.5L214.3,254.7L206.7,263.6L188.1,265.1L166.5,275.3L161.8,286.9L180.6,292.1L175.3,303.9L182.3,305.0L185.1,315.5L179.0,326.3L188.9,332.3L193.2,347.1L148.0,348.9Z', cx: 175.8, cy: 277.9 },
                'Kaffrine':     { d: 'M283.7,330.7L260.9,322.7L253.7,328.7L245.6,322.2L245.1,309.2L235.5,306.2L235.3,298.7L226.4,292.6L231.3,278.0L247.0,273.0L247.4,252.7L266.4,239.4L263.2,232.1L275.6,227.2L281.7,218.0L301.3,233.5L329.5,238.1L343.4,228.1L363.5,241.0L381.8,241.4L376.6,271.6L382.1,276.6L383.3,306.0L366.8,324.2L352.5,329.6L324.7,323.2L305.8,331.6L293.9,327.6L283.7,330.7Z', cx: 290.9, cy: 289.0 },
                'Kaolack':      { d: 'M209.4,348.7L191.8,348.7L188.9,332.3L179.0,326.3L185.1,315.5L182.3,305.0L175.3,303.9L180.6,292.1L162.4,287.5L163.7,279.7L188.1,265.1L206.7,263.6L214.3,254.7L221.8,255.5L222.3,263.3L233.6,263.4L247.2,249.5L247.0,273.0L231.3,278.0L227.1,294.8L235.3,298.7L235.5,306.2L245.1,309.2L245.6,322.2L253.7,328.7L260.9,322.7L280.1,326.2L282.6,332.6L274.1,348.8L209.4,348.7Z', cx: 211.3, cy: 295.7 },
                'Kédougou':     { d: 'M678.3,482.5L657.8,488.3L646.4,478.2L632.2,481.8L624.8,474.5L607.6,474.5L592.0,461.6L585.6,463.5L585.3,470.0L570.8,469.0L572.6,454.0L559.5,449.5L567.5,445.4L566.0,432.6L559.6,430.8L555.9,424.0L560.3,420.9L549.2,411.1L557.5,405.9L568.0,409.9L584.4,404.2L601.5,413.5L617.2,401.5L618.5,394.1L628.6,390.2L637.9,392.9L650.4,382.1L660.4,384.9L663.7,378.5L673.2,378.0L671.9,362.9L698.2,372.7L699.7,379.2L715.9,371.1L726.2,379.2L734.1,367.8L747.7,369.9L760.8,384.9L761.6,396.8L772.8,404.2L774.5,416.2L781.4,415.4L774.7,429.7L780.3,442.4L772.8,442.8L769.9,448.6L775.4,457.7L770.1,462.2L781.0,466.6L779.7,476.0L763.4,473.0L730.3,479.8L713.9,472.9L700.3,477.9L694.0,474.6L678.3,482.5Z', cx: 670.9, cy: 425.8 },
                'Kolda':        { d: 'M347.2,447.9L315.2,446.0L318.6,424.2L298.8,393.0L289.0,388.5L290.8,374.0L304.3,367.6L308.2,355.6L321.4,348.0L339.6,362.7L361.9,367.6L374.3,376.0L386.4,373.6L406.4,386.5L426.5,389.6L475.3,376.8L481.0,365.4L472.7,357.5L481.5,353.8L479.7,362.1L490.5,362.5L483.5,372.2L495.9,371.6L494.0,381.6L503.9,387.1L502.8,398.5L516.8,412.6L514.9,418.1L523.0,429.4L520.8,446.1L535.1,446.6L534.1,450.0L347.2,447.9Z', cx: 466.5, cy: 402.2 },
                'Louga':        { d: 'M344.7,229.3L329.5,238.1L301.3,233.5L278.5,214.8L253.5,208.8L249.6,201.6L241.1,206.8L228.9,196.5L187.4,199.7L175.3,167.4L169.4,168.3L166.2,160.9L153.7,156.6L132.8,179.9L131.1,171.2L117.8,162.8L124.5,149.7L120.0,145.6L143.5,108.5L169.2,105.2L192.0,85.9L230.0,66.9L268.1,98.1L280.9,96.8L279.2,88.7L285.4,87.2L286.2,81.0L297.4,81.7L314.9,92.8L340.4,87.0L355.3,100.9L374.8,89.7L389.7,105.1L373.3,114.6L359.9,148.1L380.8,157.1L395.7,155.4L380.1,180.1L355.5,183.6L360.7,219.4L350.8,233.1L344.7,229.3Z', cx: 241.0, cy: 153.5 },
                'Matam':        { d: 'M597.4,174.0L603.5,172.9L604.3,179.3L622.0,191.7L629.0,207.2L621.2,227.8L603.7,241.3L584.5,243.7L548.5,237.9L515.3,259.7L482.0,259.7L469.9,243.1L445.9,242.9L440.9,248.0L407.3,236.5L387.9,243.4L363.5,241.0L350.8,233.1L360.7,219.4L355.5,183.6L380.1,180.1L395.7,155.4L380.8,157.1L359.9,148.1L373.3,114.6L389.7,105.1L394.0,119.9L406.3,126.1L400.9,133.0L405.9,155.2L424.0,154.0L431.0,150.7L433.1,135.6L452.4,136.2L460.7,98.2L487.2,81.9L490.1,72.2L495.0,76.7L518.4,71.0L517.1,78.2L521.8,75.1L531.8,80.7L545.7,109.7L542.5,112.3L552.9,120.1L547.4,122.7L550.1,128.8L567.7,132.5L566.2,141.8L582.9,141.2L587.7,147.6L585.4,156.9L598.8,164.3L590.9,167.2L597.4,174.0Z', cx: 496.8, cy: 153.7 },
                'Saint-Louis':  { d: 'M459.7,62.6L471.1,66.1L474.3,75.4L491.8,67.6L487.2,81.9L460.7,98.2L452.4,136.2L433.1,135.6L431.0,150.7L424.0,154.0L405.9,155.2L400.9,133.0L406.3,126.1L394.0,119.9L394.3,110.4L374.8,89.7L355.3,100.9L340.4,87.0L314.9,92.8L297.4,81.7L286.2,81.0L285.4,87.2L279.2,88.7L280.9,96.8L268.1,98.1L231.0,66.7L192.0,85.9L169.2,105.2L142.8,109.5L152.8,66.8L165.2,57.9L174.6,31.1L192.4,26.6L202.7,34.9L213.3,34.3L220.5,25.9L218.5,31.6L246.2,35.6L255.6,29.5L268.5,30.2L274.5,22.5L283.2,28.6L318.1,24.0L320.0,13.5L326.0,18.7L334.1,11.7L340.2,18.4L413.9,17.2L414.8,25.5L421.0,23.4L423.3,30.3L430.8,29.2L459.3,51.0L459.7,62.6Z', cx: 322.4, cy: 53.7 },
                'Sédhiou':      { d: 'M229.7,473.4L218.9,471.3L213.4,453.7L206.6,448.8L209.7,422.1L221.8,404.3L217.5,400.1L222.3,393.3L233.5,393.4L233.6,375.2L261.1,374.9L271.8,370.1L291.1,373.9L289.2,388.9L298.8,393.0L318.6,424.2L313.2,441.4L317.4,447.5L248.5,475.6L229.7,473.4Z', cx: 251.2, cy: 423.4 },
                'Tambacounda':  { d: 'M540.8,451.7L535.5,446.6L520.8,446.1L523.0,429.4L514.9,418.1L516.8,412.6L502.8,398.5L503.9,387.1L494.0,381.6L495.9,371.6L483.5,372.2L490.5,362.5L479.7,362.1L481.7,353.9L475.9,358.2L458.4,350.1L415.9,363.6L402.8,358.5L388.0,342.5L368.1,346.2L359.3,342.2L352.5,329.6L366.8,324.2L383.3,306.0L382.1,276.6L376.6,271.6L378.4,243.5L407.3,236.5L440.9,248.0L445.9,242.9L460.4,241.6L469.9,243.1L482.0,259.7L502.6,260.1L516.6,259.2L548.5,237.9L584.5,243.7L603.7,241.3L621.2,227.8L629.0,207.2L616.9,186.3L620.3,184.0L642.0,194.9L645.8,207.3L681.9,229.6L683.2,236.5L674.8,244.7L676.7,260.2L686.0,261.5L689.0,271.1L699.1,273.8L705.0,284.3L700.9,304.9L709.1,304.6L710.2,312.5L707.9,325.2L692.5,334.7L701.8,351.3L718.2,365.3L699.7,379.2L698.2,372.7L671.7,363.0L673.2,378.0L663.7,378.5L660.4,384.9L650.4,382.1L637.9,392.9L628.6,390.2L618.5,394.1L617.2,401.5L601.5,413.5L587.2,404.3L568.0,409.9L552.8,407.5L549.0,411.7L560.3,420.9L555.9,424.1L565.9,432.4L567.5,445.4L559.5,448.3L562.9,452.4L540.8,451.7Z', cx: 573.7, cy: 361.1 },
                'Thiès':        { d: 'M100.2,277.4L90.9,261.2L68.5,240.7L72.6,224.3L66.4,207.2L120.1,145.7L124.5,149.7L117.8,162.8L131.1,171.2L132.8,179.9L153.7,156.6L166.2,160.9L168.2,167.6L175.7,168.1L187.4,199.7L154.8,193.0L125.5,202.9L135.9,220.8L130.0,232.5L144.7,238.5L143.8,246.6L123.4,258.7L120.1,283.2L111.8,290.2L116.5,297.5L100.2,277.4Z', cx: 124.7, cy: 224.8 },
                'Ziguinchor':   { d: 'M147.9,483.3L121.0,484.9L112.1,472.2L111.9,438.3L122.1,396.3L222.4,394.8L206.4,440.5L207.2,450.5L223.0,472.8L184.5,471.7L162.6,482.4L147.9,483.3Z', cx: 166.1, cy: 434.3 },
              }
              const rp = regionPaths[r.region]
              if (!rp) return ''
              const labelStyle = 'font-size:15px;font-weight:500;font-family:Montserrat,sans-serif;pointer-events:none;'
              // Dakar is too small — place label outside with a leader line
              if (r.region === 'Dakar') {
                const lx = 10; const ly = 192;
                return `<path data-region="${r.region}" data-pct="${r.pct}" d="${rp.d}" fill="#FBC4A0" stroke="#fff" stroke-width="1.2" style="cursor:pointer;transition:fill .2s,filter .2s"/>
<line x1="${rp.cx}" y1="${rp.cy - 8}" x2="${lx + 30}" y2="${ly + 4}" stroke="#9ca3af" stroke-width="0.8" style="pointer-events:none;"/>
<text x="${lx}" y="${ly}" text-anchor="start" fill="#6b7280" style="${labelStyle}">${fmt(r.pct, 1)}%</text>`
              }
              return `<path data-region="${r.region}" data-pct="${r.pct}" d="${rp.d}" fill="#FBC4A0" stroke="#fff" stroke-width="1.2" style="cursor:pointer;transition:fill .2s,filter .2s"/>
<text x="${rp.cx}" y="${rp.cy + 4}" text-anchor="middle" fill="#6b7280" style="${labelStyle}">${fmt(r.pct, 1)}%</text>`
            }).join('\n            ')}
            <!-- Tooltip -->
            <g id="map-tooltip" style="pointer-events:none;display:none;">
              <rect id="map-tooltip-bg" rx="6" ry="6" fill="rgba(26,5,162,0.94)" width="200" height="62"/>
              <text id="map-tooltip-name" x="12" y="24" fill="#fff" style="font-size:16px;font-weight:700;font-family:Montserrat,sans-serif;"></text>
              <text id="map-tooltip-value" x="12" y="48" fill="#b8943e" style="font-size:14px;font-weight:600;font-family:Montserrat,sans-serif;"></text>
            </g>
          </svg>
        </div>
        <!-- Legend inline below map box -->
        <div class="flex items-center justify-center gap-1 mt-2">
          <span class="text-[9px] text-gray-400 mr-1">Forte</span>
          <div class="w-4 h-2.5 rounded-sm" style="background:#1A05A2;"></div>
          <div class="w-4 h-2.5 rounded-sm" style="background:#8F0177;"></div>
          <div class="w-4 h-2.5 rounded-sm" style="background:#DE1A58;"></div>
          <div class="w-4 h-2.5 rounded-sm" style="background:#FBC4A0;"></div>
          <span class="text-[9px] text-gray-400 ml-1">Faible</span>
        </div>
        <p class="text-[9px] text-gray-400 mt-1 text-center italic">Source : ANSD/RNEA — BANIN 2024 | Fond : GADM 4.1</p>
      </div>

    </div>
  </div>
</section>

<!-- ═══════════ SECTION 3: Taille + Âge ═══════════ -->
<section class="py-10">
  <div class="max-w-6xl mx-auto px-4 sm:px-6">
    <div class="grid lg:grid-cols-2 gap-6">
      <!-- Doughnut: Répartition par taille -->
      <div class="bg-white border border-gray-100 rounded-lg p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-semibold text-gray-800">Répartition par Taille</h3>
          <span class="text-[10px] text-gray-400">Enquête BM 2024</span>
        </div>
        <div class="bg-gray-50 rounded-md p-3" style="height: 280px;">
          <canvas id="chart-taille"></canvas>
        </div>
        <p class="text-[9px] text-gray-400 mt-3 text-center italic">Source : Banque Mondiale — Enterprise Surveys 2024</p>
      </div>

      <!-- Bar: Répartition par âge -->
      <div class="bg-white border border-gray-100 rounded-lg p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-semibold text-gray-800">Répartition par Tranche d'Âge</h3>
          <span class="text-[10px] text-gray-400">Entrepreneurs individuels 2024</span>
        </div>
        <div class="bg-gray-50 rounded-md p-3" style="height: 280px;">
          <canvas id="chart-age"></canvas>
        </div>
        <p class="text-[9px] text-gray-400 mt-3 text-center italic">Source : ANSD/RNEA — BANIN 2024</p>
      </div>
    </div>
  </div>
</section>

<!-- ═══════════ SECTION 4: Régime juridique + Obstacles ═══════════ -->
<section class="py-10 bg-gray-50">
  <div class="max-w-6xl mx-auto px-4 sm:px-6">
    <div class="grid lg:grid-cols-2 gap-6">
      <!-- Doughnut: Régime juridique -->
      <div class="bg-white border border-gray-100 rounded-lg p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-semibold text-gray-800">Répartition par Régime Juridique</h3>
          <span class="text-[10px] text-gray-400">2024</span>
        </div>
        <div class="bg-gray-50 rounded-md p-3" style="height: 280px;">
          <canvas id="chart-regime"></canvas>
        </div>
        <p class="text-[9px] text-gray-400 mt-3 text-center italic">Source : ANSD/RNEA — BANIN 2024</p>
      </div>

      <!-- Treemap: Obstacles à l'activité -->
      <div class="bg-white border border-gray-100 rounded-lg p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-semibold text-gray-800">Obstacles à l'Activité</h3>
          <span class="text-[10px] text-gray-400">Enquête BM 2024</span>
        </div>
        <div class="bg-gray-50 rounded-md p-2" style="height: 280px;">
          <div id="obstacles-treemap" class="w-full h-full relative" style="display:grid;grid-template-columns:repeat(12,1fr);grid-template-rows:repeat(12,1fr);gap:2px;">
          </div>
        </div>
        <p class="text-[9px] text-gray-400 mt-3 text-center italic">Source : Banque Mondiale — Enterprise Surveys 2024 — Taille proportionnelle à la sévérité</p>
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
          <a href="https://www.ansd.sn" target="_blank" class="text-brand-blue hover:underline">ANSD</a> (NINEA/BANIN/BDEF),
          <a href="https://www.enterprisesurveys.org/en/data/exploreeconomies/2024/senegal" target="_blank" class="text-brand-blue hover:underline">Banque Mondiale</a> (Enterprise Surveys 2024)
        </p>
        <p class="text-[10px] text-gray-400 mt-1">Données mises à jour automatiquement depuis les sources officielles.</p>
      </div>
      <div class="flex items-center gap-3">
        <a href="/api/pme-pmi" target="_blank" class="text-[10px] bg-white border border-gray-200 px-3 py-1.5 rounded hover:border-gray-300 text-gray-500 transition-colors">
          <i class="fas fa-code mr-1"></i> API JSON
        </a>
      </div>
    </div>
  </div>
</section>

<!-- ═══════════ Chart.js Scripts ═══════════ -->
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2"></script>
<script>
document.addEventListener('DOMContentLoaded', () => {
  // Disable datalabels globally – only enable per-chart
  Chart.defaults.plugins.datalabels = { display: false };
  const fontFamily = "'Montserrat', sans-serif";
  const gridColor = '#f1f5f9';
  const blue = '#044bad';
  const green = '#059669';
  const gold = '#b8943e';
  const red = '#dc2626';
  const purple = '#7c3aed';
  const teal = '#0891b2';
  const orange_ = '#ea580c';
  const rose = '#e11d48';

  const palette = [blue, green, gold, red, purple, teal, orange_, rose];

  // ─── 0. Choropleth Map ────
  (function initMap() {
    const svg = document.getElementById('senegal-map');
    if (!svg) return;
    const paths = svg.querySelectorAll('path[data-region]');
    const tooltip = document.getElementById('map-tooltip');
    const ttBg = document.getElementById('map-tooltip-bg');
    const ttName = document.getElementById('map-tooltip-name');
    const ttValue = document.getElementById('map-tooltip-value');

    // Color scale: 5-step blue gradient – kept separate from standard palette
    function getColor(pct) {
      if (pct >= 40) return '#1A05A2';   // deep purple – dominant (Dakar)
      if (pct >= 10) return '#8F0177';   // magenta (Thiès)
      if (pct >= 5)  return '#DE1A58';   // rose/coral
      return '#FBC4A0';                   // light peach – low density
    }

    // Apply choropleth colors
    paths.forEach(function(p) {
      var pct = parseFloat(p.getAttribute('data-pct') || '0');
      p.setAttribute('fill', getColor(pct));
    });

    // Hover interactions
    paths.forEach(function(p) {
      p.addEventListener('mouseenter', function(e) {
        p.setAttribute('filter', 'brightness(1.2)');
        p.style.filter = 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))';
        p.style.strokeWidth = '2.5';
        var region = p.getAttribute('data-region');
        var pct = p.getAttribute('data-pct');
        ttName.textContent = region;
        ttValue.textContent = parseFloat(pct).toFixed(1) + '% des immatriculations';
        // Measure text width to size the tooltip box
        var textLen = Math.max(region.length, (pct + '% des immatriculations').length);
        var boxW = Math.max(200, textLen * 9.5);
        ttBg.setAttribute('width', String(boxW));
        tooltip.style.display = '';
      });

      p.addEventListener('mousemove', function(e) {
        // Get SVG coordinates from mouse position
        var svgRect = svg.getBoundingClientRect();
        var scaleX = 820 / svgRect.width;
        var scaleY = 520 / svgRect.height;
        var x = (e.clientX - svgRect.left) * scaleX;
        var y = (e.clientY - svgRect.top) * scaleY;
        // Offset so tooltip doesn't overlap cursor
        var tx = x + 15;
        var ty = y - 30;
        // Keep within viewport
        var bw = parseFloat(ttBg.getAttribute('width') || '140');
        if (tx + bw > 810) tx = x - bw - 10;
        if (ty < 5) ty = y + 15;
        tooltip.setAttribute('transform', 'translate(' + tx + ',' + ty + ')');
      });

      p.addEventListener('mouseleave', function() {
        p.style.filter = '';
        p.style.strokeWidth = '1.5';
        tooltip.style.display = 'none';
      });
    });
  })();

  // ─── 1. Stacked Bar: Immatriculations par Secteur (absolute numbers) ────
  const secteurByYear = ${JSON.stringify(data.secteurByYear)};
  const immatricTotals = ${JSON.stringify(Object.fromEntries(data.immatricSeries.map(s => [s.year, s.total])))};
  const stackedYears = [2019, 2020, 2021, 2022, 2023, 2024];
  const stackColors = [blue, green, gold, red, purple, teal, orange_];
  new Chart(document.getElementById('chart-stacked-secteur'), {
    type: 'bar',
    data: {
      labels: stackedYears,
      datasets: secteurByYear.map((s, i) => ({
        label: s.label,
        data: stackedYears.map(y => Math.round((s.values[y] || 0) / 100 * (immatricTotals[y] || 0))),
        backgroundColor: stackColors[i % stackColors.length] + 'cc',
        borderColor: stackColors[i % stackColors.length],
        borderWidth: 1,
        borderRadius: 2,
      }))
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { font: { size: 9, family: fontFamily }, boxWidth: 10, padding: 8 } },
        tooltip: {
          mode: 'nearest',
          intersect: true,
          callbacks: { label: ctx => ' ' + ctx.dataset.label + ' : ' + ctx.parsed.y.toLocaleString('fr-FR') }
        }
      },
      scales: {
        x: { stacked: true, grid: { display: false }, ticks: { font: { size: 11, weight: 'bold' } } },
        y: { stacked: true, grid: { color: gridColor }, ticks: { font: { size: 9 }, callback: v => (v / 1000).toFixed(0) + 'k' } }
      }
    }
  });

  // ─── 2. Pie: Taille ────
  const tailleData = ${JSON.stringify(data.tailleBreakdown)};
  new Chart(document.getElementById('chart-taille'), {
    type: 'pie',
    data: {
      labels: tailleData.map(d => d.label),
      datasets: [{
        data: tailleData.map(d => d.pct),
        backgroundColor: [blue + 'cc', green + 'cc', gold + 'cc'],
        borderColor: '#fff',
        borderWidth: 1,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { font: { size: 10, family: fontFamily }, boxWidth: 12, padding: 12 } },
        tooltip: { callbacks: { label: ctx => ' ' + ctx.label + ' : ' + ctx.parsed + '%' } },
        datalabels: {
          display: true,
          color: '#fff',
          font: { size: 14, weight: 'bold', family: fontFamily },
          formatter: (value) => value + '%',
          anchor: 'center',
          align: 'center'
        }
      }
    },
    plugins: [ChartDataLabels]
  });

  // ─── 3. Doughnut: Régime juridique ────
  const regimeData = ${JSON.stringify(data.regimeBreakdown)};
  new Chart(document.getElementById('chart-regime'), {
    type: 'doughnut',
    data: {
      labels: regimeData.map(d => d.label),
      datasets: [{
        data: regimeData.map(d => d.pct),
        backgroundColor: regimeData.map((_, i) => palette[i % palette.length] + 'cc'),
        borderColor: '#fff',
        borderWidth: 1,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { font: { size: 9, family: fontFamily }, boxWidth: 10, padding: 8 } },
        tooltip: { callbacks: { label: ctx => ' ' + ctx.label + ' : ' + ctx.parsed.toFixed(1) + '%' } }
      }
    }
  });

  // ─── 5. Bar: Tranches d'âge ────
  const ageData = ${JSON.stringify(data.ageBreakdown)};
  new Chart(document.getElementById('chart-age'), {
    type: 'bar',
    data: {
      labels: ageData.map(d => d.label),
      datasets: [{
        label: 'Part (%)',
        data: ageData.map(d => d.pct),
        backgroundColor: [gold + '90', red + '90', green + '90', blue + '90'],
        borderColor: [gold, red, green, blue],
        borderWidth: 1,
        borderRadius: 4,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => ctx.parsed.y.toFixed(1) + '%' } }
      },
      scales: {
        y: { beginAtZero: true, grid: { color: gridColor }, ticks: { font: { size: 10 }, callback: v => v + '%' } },
        x: { grid: { display: false }, ticks: { font: { size: 10 } } }
      }
    }
  });

  // ─── 6. Treemap: Obstacles ────
  (function initTreemap() {
    const container = document.getElementById('obstacles-treemap');
    if (!container) return;
    const items = ${JSON.stringify(data.obstacles)};
    container.style.display = 'block';
    container.style.position = 'relative';
    const W = container.offsetWidth;
    const H = container.offsetHeight;
    const treemapColors = [blue, green, gold, red, purple, teal, orange_];

    // Squarified treemap (Bruls, Huizing, van Wijk algorithm)
    function worst(row, w) {
      var s = row.reduce(function(a, b) { return a + b; }, 0);
      var rMax = Math.max.apply(null, row);
      var rMin = Math.min.apply(null, row);
      var s2 = s * s, w2 = w * w;
      return Math.max((w2 * rMax) / s2, s2 / (w2 * rMin));
    }

    function squarify(values, x, y, w, h) {
      if (values.length === 0) return [];
      if (values.length === 1) return [{ x: x, y: y, w: w, h: h, idx: values[0].idx }];

      var total = values.reduce(function(s, v) { return s + v.val; }, 0);
      var areas = values.map(function(v) { return (v.val / total) * w * h; });

      var results = [];
      var remaining = areas.map(function(a, i) { return { area: a, idx: values[i].idx }; });

      function layoutRow(row, rowAreas, rx, ry, rw, rh) {
        var sum = rowAreas.reduce(function(a, b) { return a + b; }, 0);
        var rects = [];
        if (rw >= rh) {
          var rowW = sum / rh;
          var cy = ry;
          for (var i = 0; i < row.length; i++) {
            var cellH = rowAreas[i] / rowW;
            rects.push({ x: rx, y: cy, w: rowW, h: cellH, idx: row[i].idx });
            cy += cellH;
          }
          return { rects: rects, newX: rx + rowW, newY: ry, newW: rw - rowW, newH: rh };
        } else {
          var rowH = sum / rw;
          var cx = rx;
          for (var i = 0; i < row.length; i++) {
            var cellW = rowAreas[i] / rowH;
            rects.push({ x: cx, y: ry, w: cellW, h: rowH, idx: row[i].idx });
            cx += cellW;
          }
          return { rects: rects, newX: rx, newY: ry + rowH, newW: rw, newH: rh - rowH };
        }
      }

      var rx = x, ry = y, rw = w, rh = h;
      while (remaining.length > 0) {
        var side = Math.min(rw, rh);
        var row = [remaining[0]];
        var rowAreas = [remaining[0].area];
        var i = 1;
        while (i < remaining.length) {
          var newRow = rowAreas.concat([remaining[i].area]);
          if (worst(newRow, side) <= worst(rowAreas, side)) {
            row.push(remaining[i]);
            rowAreas.push(remaining[i].area);
            i++;
          } else {
            break;
          }
        }
        remaining = remaining.slice(i);
        var result = layoutRow(row, rowAreas, rx, ry, rw, rh);
        results = results.concat(result.rects);
        rx = result.newX; ry = result.newY; rw = result.newW; rh = result.newH;
      }
      return results;
    }

    var sorted = items.map(function(d, i) { return { val: d.pct, idx: i }; })
      .sort(function(a, b) { return b.val - a.val; });
    var rects = squarify(sorted, 0, 0, W, H);

    rects.forEach(function(r, i) {
      var item = items[r.idx];
      var div = document.createElement('div');
      div.style.position = 'absolute';
      div.style.left = r.x + 'px';
      div.style.top = r.y + 'px';
      div.style.width = (r.w - 1) + 'px';
      div.style.height = (r.h - 1) + 'px';
      div.style.backgroundColor = treemapColors[i % treemapColors.length] + 'cc';
      div.style.display = 'flex';
      div.style.flexDirection = 'column';
      div.style.alignItems = 'center';
      div.style.justifyContent = 'center';
      div.style.padding = '6px';
      div.style.overflow = 'hidden';
      div.style.cursor = 'default';
      div.style.transition = 'filter 0.2s';

      var pctSize = r.w > 80 && r.h > 50 ? 18 : (r.w > 55 && r.h > 35 ? 14 : 11);
      var labelSize = r.w > 80 && r.h > 50 ? 11 : (r.w > 55 && r.h > 35 ? 9 : 7);

      div.innerHTML = '<span style="font-size:' + pctSize + 'px;font-weight:700;color:#fff;font-family:Montserrat,sans-serif;line-height:1.1;">' + item.pct + '%</span>' +
        '<span style="font-size:' + labelSize + 'px;color:rgba(255,255,255,0.9);font-family:Montserrat,sans-serif;text-align:center;line-height:1.2;margin-top:3px;">' + item.label + '</span>';

      div.title = item.label + ' : ' + item.pct + '% des entreprises';
      div.addEventListener('mouseenter', function() { div.style.filter = 'brightness(1.25)'; });
      div.addEventListener('mouseleave', function() { div.style.filter = ''; });

      container.appendChild(div);
    });
  })();

});
</script>
`

  return layout(content, {
    title: 'PME / PMI',
    description: 'Tableau de bord des PME/PMI du Sénégal — immatriculations, structure, démographie entrepreneuriale et obstacles',
    path: '/pme-pmi',
  })
}
