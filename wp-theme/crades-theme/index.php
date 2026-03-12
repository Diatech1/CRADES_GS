<?php
/**
 * Index Template (required fallback)
 * Used when no other template matches
 */
get_template_part( 'template-parts/header' );
?>

<?php crades_page_header(
    'CRADES',
    'Centre de Recherche, d\'Analyse des Ã‰changes et Statistiques',
    []
); ?>

<section class="py-10">
  <div class="max-w-6xl mx-auto px-4 sm:px-6">
    <?php if ( have_posts() ) : ?>
    <div class="grid md:grid-cols-3 gap-6">
      <?php while ( have_posts() ) : the_post(); ?>
        <a href="<?php the_permalink(); ?>" class="bg-white rounded-lg border border-brand-ice/60 p-5 hover:border-brand-sky/40 hover:shadow-sm transition-all group">
          <span class="text-[11px] text-gray-400"><?php echo get_the_date( 'j F Y' ); ?></span>
          <h3 class="text-sm font-medium text-gray-800 mt-2 group-hover:text-brand-blue transition-colors line-clamp-2"><?php the_title(); ?></h3>
          <p class="text-xs text-gray-400 mt-2 line-clamp-3"><?php echo esc_html( wp_trim_words( get_the_excerpt(), 25, '...' ) ); ?></p>
        </a>
      <?php endwhile; ?>
    </div>
    <?php else : ?>
    <div class="text-center py-16">
      <i class="fas fa-inbox text-3xl mb-4 text-brand-ice"></i>
      <p class="text-sm text-gray-400">Aucun contenu disponible.</p>
    </div>
    <?php endif; ?>
  </div>
</section>

<?php get_template_part( 'template-parts/footer' ); ?>
