<?php
/**
 * CRADES Footer â€” Exact replica of Hono frontend
 */
$logo_crades = crades_img( 'logo-crades.png' );
?>
</main>

<!-- Footer -->
<footer class="border-t border-gray-100 mt-20">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 py-12">
    <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
      <div class="col-span-2 md:col-span-1">
        <div class="flex items-center gap-2 mb-3">
          <img src="<?php echo esc_url( $logo_crades ); ?>" alt="CRADES" class="h-20 w-auto">
        </div>
        <p class="text-xs text-gray-400 leading-relaxed">Centre de Recherche, d'Analyse des Ã‰changes et Statistiques</p>
      </div>
      <div>
        <h4 class="text-xs font-semibold text-gray-800 uppercase tracking-wider mb-3">Navigation</h4>
        <ul class="space-y-2 text-xs text-gray-400">
          <li><a href="<?php echo esc_url( home_url( '/a-propos/' ) ); ?>" class="hover:text-gray-600">Ã€ propos</a></li>
          <li><a href="<?php echo esc_url( home_url( '/publications/' ) ); ?>" class="hover:text-gray-600">Publications</a></li>
          <li><a href="<?php echo esc_url( home_url( '/tableaux-de-bord/' ) ); ?>" class="hover:text-gray-600">Tableaux de bord</a></li>
          <li><a href="<?php echo esc_url( home_url( '/actualites/' ) ); ?>" class="hover:text-gray-600">ActualitÃ©s</a></li>
        </ul>
      </div>
      <div>
        <h4 class="text-xs font-semibold text-gray-800 uppercase tracking-wider mb-3">Ressources</h4>
        <ul class="space-y-2 text-xs text-gray-400">
          <li><a href="<?php echo esc_url( rest_url( 'wp/v2/indicateur' ) ); ?>" class="hover:text-gray-600">API</a></li>
          <li><a href="<?php echo esc_url( home_url( '/donnees/' ) ); ?>" class="hover:text-gray-600">DonnÃ©es</a></li>
          <li><a href="<?php echo esc_url( home_url( '/sitemap.xml' ) ); ?>" class="hover:text-gray-600">Plan du site</a></li>
          <li><a href="<?php echo esc_url( home_url( '/contact/' ) ); ?>" class="hover:text-gray-600">Contact</a></li>
        </ul>
      </div>
      <div>
        <h4 class="text-xs font-semibold text-gray-800 uppercase tracking-wider mb-3">Contact</h4>
        <div class="space-y-2 text-xs text-gray-400">
          <p>Rue AimÃ© CÃ©saire, Plateau<br>Dakar, SÃ©nÃ©gal</p>
          <p>+221 33 889 12 34</p>
          <p>contact@crades.gouv.sn</p>
        </div>
      </div>
    </div>
  </div>
  <div class="border-t border-gray-50">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-300">
      <p>&copy; <?php echo date( 'Y' ); ?> CRADES â€” Tous droits rÃ©servÃ©s</p>
      <p>RÃ©publique du SÃ©nÃ©gal</p>
    </div>
  </div>
</footer>
<?php wp_footer(); ?>
</body>
</html>
