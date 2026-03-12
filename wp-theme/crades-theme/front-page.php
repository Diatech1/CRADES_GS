<?php
/**
 * Template Name: Accueil CRADES
 * CRADES Homepage â€” exact replica of Hono frontend
 */
get_template_part( 'template-parts/header' );

// Fetch indicators
$indicators = get_posts([
    'post_type'   => 'indicateur',
    'numberposts' => 8,
    'orderby'     => 'date',
    'order'       => 'ASC',
]);
$valid_indicators = array_filter( $indicators, function( $ind ) {
    return ! empty( get_post_meta( $ind->ID, 'indicateur_value', true ) );
});

// Fetch dashboards
$dashboards = get_posts([
    'post_type'   => 'dashboard',
    'numberposts' => 10,
    'orderby'     => 'date',
    'order'       => 'ASC',
]);

// Fetch publications
$publications = get_posts([
    'post_type'   => 'publication',
    'numberposts' => 4,
    'orderby'     => 'date',
    'order'       => 'DESC',
]);

// Fetch news
$news = get_posts([
    'post_type'   => 'post',
    'numberposts' => 3,
    'orderby'     => 'date',
    'order'       => 'DESC',
]);
?>

<!-- Hero -->
<section class="relative overflow-hidden bg-brand-frost">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 py-16 lg:py-20">
    <div class="max-w-xl">
      <h1 class="font-display font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-brand-navy leading-tight">
        Centre de Recherche, d'Analyse des Ã‰changes et Statistiques
      </h1>
      <p class="text-gray-600 mt-5 text-sm leading-relaxed">
        Le CRADES produit et diffuse les statistiques, Ã©tudes et analyses stratÃ©giques sur l'industrie et le commerce du SÃ©nÃ©gal.
      </p>
      <div class="flex flex-wrap gap-4 mt-10">
        <a href="<?php echo esc_url( home_url('/publications/') ); ?>" class="text-sm font-medium bg-brand-blue text-white px-5 py-2.5 rounded-lg hover:bg-brand-navy transition-colors shadow-sm">
          Publications
        </a>
        <a href="<?php echo esc_url( home_url('/donnees/') ); ?>" class="text-sm font-medium bg-white text-brand-navy px-5 py-2.5 rounded-lg hover:bg-white/80 transition-colors border border-brand-ice shadow-sm">
          DonnÃ©es ouvertes
        </a>
      </div>
    </div>
  </div>
</section>

<?php if ( ! empty( $valid_indicators ) ) : ?>
<!-- Key Indicators Strip -->
<section class="py-10 border-b border-gray-100">
  <div class="max-w-6xl mx-auto px-4 sm:px-6">
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <?php foreach ( array_slice( $valid_indicators, 0, 4 ) as $ind ) :
          $value  = get_post_meta( $ind->ID, 'indicateur_value', true );
          $unit   = get_post_meta( $ind->ID, 'indicateur_unit', true );
          $pct    = get_post_meta( $ind->ID, 'indicateur_change_percent', true );
          $dir    = get_post_meta( $ind->ID, 'indicateur_change_direction', true );
          $name   = get_the_title( $ind );
          $arrow  = $dir === 'up' ? 'â–²' : ( $dir === 'down' ? 'â–¼' : '' );
          $color  = $dir === 'up' ? 'text-emerald-500' : ( $dir === 'down' ? 'text-red-500' : 'text-gray-400' );
      ?>
      <div class="text-center p-5 rounded-xl border border-gray-100 bg-white hover:shadow-md transition-shadow">
        <div class="text-2xl lg:text-3xl font-extrabold text-brand-navy"><?php echo esc_html( $value ); ?></div>
        <div class="text-[11px] font-semibold text-brand-gold uppercase tracking-wide mt-1"><?php echo esc_html( $unit ); ?></div>
        <div class="text-[13px] font-medium text-gray-600 mt-2"><?php echo esc_html( $name ); ?></div>
        <?php if ( $pct ) : ?>
          <div class="text-[11px] font-semibold mt-1 <?php echo esc_attr( $color ); ?>"><?php echo esc_html( $arrow . ' ' . $pct . '%' ); ?></div>
        <?php endif; ?>
      </div>
      <?php endforeach; ?>
    </div>
  </div>
</section>
<?php endif; ?>

<?php
// Dashboard charts
$chart_configs = [];
foreach ( $dashboards as $dash ) {
    $raw = get_post_meta( $dash->ID, 'dashboard_chart_data', true );
    $chart_color = get_post_meta( $dash->ID, 'dashboard_chart_color', true ) ?: '#044bad';
    if ( ! $raw ) continue;
    $decoded = json_decode( $raw );
    if ( ! $decoded ) continue;
    $slug = sanitize_title( get_the_title( $dash ) );
    $chart_configs[] = [
        'id'    => 'home-chart-' . $slug,
        'title' => get_the_title( $dash ),
        'data'  => $raw,
        'color' => $chart_color,
    ];
}
?>

<?php if ( ! empty( $chart_configs ) ) : ?>
<!-- Dashboard Charts -->
<section class="py-12 border-b border-gray-100">
  <div class="max-w-6xl mx-auto px-4 sm:px-6">
    <div class="flex items-center justify-between mb-8">
      <h2 class="font-display text-xl text-gray-800">Tableaux de bord</h2>
      <a href="<?php echo esc_url( home_url('/tableaux-de-bord/') ); ?>" class="text-xs text-brand-gold hover:underline">Tous les tableaux &rarr;</a>
    </div>
    <div class="grid md:grid-cols-2 gap-6">
      <?php foreach ( $chart_configs as $cfg ) : ?>
      <div class="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
        <h3 class="text-sm font-bold text-brand-navy mb-3"><?php echo esc_html( $cfg['title'] ); ?></h3>
        <div style="position:relative;height:220px;"><canvas id="<?php echo esc_attr( $cfg['id'] ); ?>"></canvas></div>
      </div>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<script>
document.addEventListener('DOMContentLoaded', function() {
  var chartConfigs = <?php echo json_encode( $chart_configs ); ?>;
  chartConfigs.forEach(function(cfg) {
    try {
      var chartData = JSON.parse(cfg.data);
      var color = cfg.color;
      if (chartData.data && chartData.data.datasets) {
        chartData.data.datasets.forEach(function(ds, i) {
          var colors = [color, '#b8943e', '#3a7fd4', '#032d6b'];
          var c = colors[i % colors.length];
          if (!ds.borderColor) ds.borderColor = c;
          if (!ds.backgroundColor) ds.backgroundColor = c + '33';
          if (chartData.type === 'line' && !ds.tension) ds.tension = 0.3;
          if (!ds.pointRadius && ds.pointRadius !== 0) ds.pointRadius = 2;
        });
      }
      if (!chartData.options) chartData.options = {};
      chartData.options.responsive = true;
      chartData.options.maintainAspectRatio = false;
      chartData.options.plugins = chartData.options.plugins || {};
      chartData.options.plugins.legend = { display: false };
      new Chart(document.getElementById(cfg.id), chartData);
    } catch(e) { console.error('Chart error:', e); }
  });
});
</script>
<?php else : ?>
<!-- No dashboards -->
<section class="py-12 border-b border-gray-100">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 text-center py-8">
    <i class="fas fa-chart-area text-3xl mb-3 text-brand-ice"></i>
    <p class="text-sm text-gray-400">Aucun tableau de bord disponible.</p>
    <p class="text-xs text-gray-300 mt-1">Ajoutez des dashboards avec leurs donnÃ©es de graphique depuis <a href="<?php echo esc_url( admin_url('edit.php?post_type=dashboard') ); ?>" class="text-brand-blue underline">l'administration</a>.</p>
  </div>
</section>
<?php endif; ?>

<!-- Mission -->
<section class="py-14 bg-brand-frost border-b border-brand-ice/50">
  <div class="max-w-6xl mx-auto px-4 sm:px-6">
    <div class="grid md:grid-cols-3 gap-8 text-center">
      <div>
        <div class="w-12 h-12 mx-auto mb-4 rounded-full bg-brand-blue/10 flex items-center justify-center">
          <i class="fas fa-chart-line text-brand-blue text-lg"></i>
        </div>
        <h3 class="font-semibold text-sm text-gray-800 mb-2">Produire des statistiques</h3>
        <p class="text-xs text-gray-500 leading-relaxed">Collecter, traiter et diffuser les donnÃ©es statistiques sur l'industrie et le commerce du SÃ©nÃ©gal.</p>
      </div>
      <div>
        <div class="w-12 h-12 mx-auto mb-4 rounded-full bg-brand-blue/10 flex items-center justify-center">
          <i class="fas fa-microscope text-brand-blue text-lg"></i>
        </div>
        <h3 class="font-semibold text-sm text-gray-800 mb-2">Analyser et rechercher</h3>
        <p class="text-xs text-gray-500 leading-relaxed">Mener des Ã©tudes et analyses stratÃ©giques pour Ã©clairer les politiques publiques et les acteurs Ã©conomiques.</p>
      </div>
      <div>
        <div class="w-12 h-12 mx-auto mb-4 rounded-full bg-brand-blue/10 flex items-center justify-center">
          <i class="fas fa-globe-africa text-brand-blue text-lg"></i>
        </div>
        <h3 class="font-semibold text-sm text-gray-800 mb-2">Accompagner les Ã©changes</h3>
        <p class="text-xs text-gray-500 leading-relaxed">Fournir aux opÃ©rateurs Ã©conomiques et aux institutions les outils nÃ©cessaires au dÃ©veloppement des Ã©changes commerciaux.</p>
      </div>
    </div>
  </div>
</section>

<!-- Latest publications -->
<section class="py-16">
  <div class="max-w-6xl mx-auto px-4 sm:px-6">
    <div class="flex items-center justify-between mb-8">
      <h2 class="font-display text-xl text-gray-800">DerniÃ¨res publications</h2>
      <a href="<?php echo esc_url( home_url('/publications/') ); ?>" class="text-xs text-brand-gold hover:underline">Toutes les publications &rarr;</a>
    </div>
    <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <?php if ( ! empty( $publications ) ) : ?>
        <?php foreach ( $publications as $pub ) :
          $year = get_post_meta( $pub->ID, 'publication_year', true );
          $sectors = get_the_terms( $pub->ID, 'sector' );
        ?>
        <a href="<?php echo get_permalink( $pub ); ?>" class="group block border border-gray-100 rounded-xl p-5 hover:shadow-md transition-all bg-white">
          <div class="text-[11px] font-semibold text-brand-blue mb-2"><?php echo esc_html( $year ?: get_the_date( 'Y', $pub ) ); ?></div>
          <h3 class="text-sm font-semibold text-gray-800 group-hover:text-brand-blue transition-colors line-clamp-2"><?php echo esc_html( get_the_title( $pub ) ); ?></h3>
          <p class="text-xs text-gray-400 mt-2 line-clamp-2"><?php echo esc_html( wp_trim_words( $pub->post_excerpt ?: $pub->post_content, 15, 'â€¦' ) ); ?></p>
          <?php if ( $sectors && ! is_wp_error( $sectors ) ) : ?>
            <div class="mt-3 text-[10px] text-brand-gold font-medium"><?php echo esc_html( implode( ', ', wp_list_pluck( $sectors, 'name' ) ) ); ?></div>
          <?php endif; ?>
        </a>
        <?php endforeach; ?>
      <?php else : ?>
        <div class="col-span-4 text-center py-8 text-gray-400 text-sm">
          <i class="fas fa-book-open text-2xl mb-3 text-brand-ice"></i>
          <p>Aucune publication pour le moment.</p>
          <p class="text-xs mt-1">Ajoutez des publications depuis <a href="<?php echo esc_url( admin_url('edit.php?post_type=publication') ); ?>" class="text-brand-blue underline">WordPress</a>.</p>
        </div>
      <?php endif; ?>
    </div>
  </div>
</section>

<!-- ActualitÃ©s -->
<section class="bg-brand-frost border-y border-brand-ice/50 py-16">
  <div class="max-w-6xl mx-auto px-4 sm:px-6">
    <div class="flex items-center justify-between mb-8">
      <h2 class="font-display text-xl text-gray-800">ActualitÃ©s</h2>
      <a href="<?php echo esc_url( home_url('/actualites/') ); ?>" class="text-xs text-brand-gold hover:underline">Toutes les actualitÃ©s &rarr;</a>
    </div>
    <div class="grid md:grid-cols-3 gap-6">
      <?php if ( ! empty( $news ) ) : ?>
        <?php foreach ( $news as $post_item ) :
          $thumb = get_the_post_thumbnail_url( $post_item, 'crades-card' );
        ?>
        <a href="<?php echo get_permalink( $post_item ); ?>" class="group block bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-all">
          <?php if ( $thumb ) : ?>
            <div class="h-44 bg-cover bg-center" style="background-image:url('<?php echo esc_url( $thumb ); ?>')"></div>
          <?php else : ?>
            <div class="h-44 bg-brand-frost flex items-center justify-center"><i class="fas fa-newspaper text-2xl text-brand-ice"></i></div>
          <?php endif; ?>
          <div class="p-5">
            <div class="text-[11px] text-gray-400 mb-2"><?php echo get_the_date( 'j M Y', $post_item ); ?></div>
            <h3 class="text-sm font-semibold text-gray-800 group-hover:text-brand-blue transition-colors line-clamp-2"><?php echo esc_html( get_the_title( $post_item ) ); ?></h3>
            <p class="text-xs text-gray-400 mt-2 line-clamp-2"><?php echo esc_html( wp_trim_words( $post_item->post_excerpt ?: $post_item->post_content, 18, 'â€¦' ) ); ?></p>
          </div>
        </a>
        <?php endforeach; ?>
      <?php else : ?>
        <div class="col-span-3 text-center py-8 text-gray-400 text-sm">
          <i class="fas fa-newspaper text-2xl mb-3 text-brand-ice"></i>
          <p>Aucune actualitÃ© pour le moment.</p>
          <p class="text-xs mt-1">Ajoutez des articles depuis <a href="<?php echo esc_url( admin_url('edit.php') ); ?>" class="text-brand-blue underline">WordPress</a>.</p>
        </div>
      <?php endif; ?>
    </div>
  </div>
</section>

<!-- CTA -->
<section class="py-16">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 text-center">
    <h2 class="font-display text-xl text-gray-800">AccÃ©dez aux donnÃ©es ouvertes</h2>
    <p class="text-sm text-gray-400 mt-2 max-w-md mx-auto">TÃ©lÃ©chargez les jeux de donnÃ©es du CRADES ou intÃ©grez nos indicateurs via l'API publique.</p>
    <div class="flex items-center justify-center gap-3 mt-6">
      <a href="<?php echo esc_url( home_url('/donnees/') ); ?>" class="text-sm font-medium bg-brand-blue text-white px-5 py-2.5 rounded-lg hover:bg-brand-navy transition-colors">Explorer les donnÃ©es</a>
      <a href="<?php echo esc_url( rest_url('wp/v2/indicateur') ); ?>" class="text-sm font-medium text-gray-500 border border-gray-200 px-5 py-2.5 rounded-lg hover:border-gray-300 transition-colors">API</a>
    </div>
  </div>
</section>

<?php get_template_part( 'template-parts/footer' ); ?>
