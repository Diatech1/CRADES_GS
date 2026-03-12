<?php
/**
 * CRADES Theme - Functions (v3.0)
 * Classic PHP theme faithful to Hono/Tailwind preview
 *
 * @package CRADES
 * @version 3.0.0
 */

if ( ! defined( 'ABSPATH' ) ) exit;

define( 'CRADES_VERSION', '3.0.0' );
define( 'CRADES_DIR', get_template_directory() );
define( 'CRADES_URI', get_template_directory_uri() );

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   1. THEME SETUP
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function crades_setup() {
    add_theme_support( 'post-thumbnails' );
    add_theme_support( 'title-tag' );
    add_theme_support( 'html5', [
        'search-form', 'comment-form', 'comment-list',
        'gallery', 'caption', 'style', 'script'
    ] );
    add_theme_support( 'custom-logo', [
        'height'      => 200,
        'width'       => 400,
        'flex-height' => true,
        'flex-width'  => true,
    ] );
    add_theme_support( 'responsive-embeds' );

    add_image_size( 'crades-card', 600, 400, true );
    add_image_size( 'crades-hero', 1920, 800, true );
    add_image_size( 'crades-thumb', 300, 200, true );

    register_nav_menus( [
        'primary' => 'Navigation principale',
        'footer'  => 'Navigation pied de page',
    ] );
}
add_action( 'after_setup_theme', 'crades_setup' );

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   2. ENQUEUE ASSETS - Tailwind + FontAwesome + Montserrat + Chart.js
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function crades_enqueue_assets() {
    /* Tailwind CDN */
    wp_enqueue_script( 'tailwindcss', 'https://cdn.tailwindcss.com', [], null, false );

    /* FontAwesome */
    wp_enqueue_style( 'font-awesome', 'https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.5.0/css/all.min.css', [], '6.5.0' );

    /* Montserrat */
    wp_enqueue_style( 'google-fonts-montserrat', 'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&display=swap', [], null );

    /* Chart.js */
    wp_enqueue_script( 'chartjs', 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js', [], '4.4.0', true );

    /* Theme custom CSS */
    wp_enqueue_style( 'crades-style', get_stylesheet_uri(), [], CRADES_VERSION );
    wp_enqueue_style( 'crades-custom', CRADES_URI . '/assets/css/custom.css', [ 'crades-style' ], CRADES_VERSION );

    /* Theme JS */
    wp_enqueue_script( 'crades-main', CRADES_URI . '/assets/js/main.js', [], CRADES_VERSION, true );

    /* Tailwind config inline */
    wp_add_inline_script( 'tailwindcss', "
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        brand: {
                            navy: '#032d6b',
                            blue: '#044bad',
                            sky: '#3a7fd4',
                            ice: '#c7ddf5',
                            frost: '#eef4fb',
                            gold: '#b8943e',
                            'gold-light': '#d4b262',
                        }
                    },
                    fontFamily: {
                        sans: ['Montserrat', 'system-ui', 'sans-serif'],
                        display: ['Montserrat', 'system-ui', 'sans-serif'],
                    }
                }
            }
        }
    ", 'after' );
}
add_action( 'wp_enqueue_scripts', 'crades_enqueue_assets' );

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   3. TEMPLATE ROUTING - Route pages by slug
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function crades_template_routing( $template ) {
    if ( is_page() ) {
        $slug = get_post_field( 'post_name', get_queried_object_id() );
        $slug_map = [
            'publications'       => 'page-publications.php',
            'tableaux-de-bord'   => 'page-dashboards.php',
            'contact'            => 'page-contact.php',
            'commerce-exterieur' => 'page-commerce.php',
            'donnees'            => 'page-data.php',
            'actualites'         => 'page-actualites.php',
            'a-propos'           => 'page-about.php',
        ];

        if ( isset( $slug_map[ $slug ] ) ) {
            $new = locate_template( $slug_map[ $slug ] );
            if ( $new ) return $new;
        }
    }

    /* Archive routing for CPTs */
    if ( is_post_type_archive( 'publication' ) ) {
        $new = locate_template( 'page-publications.php' );
        if ( $new ) return $new;
    }
    if ( is_post_type_archive( 'dashboard' ) ) {
        $new = locate_template( 'page-dashboards.php' );
        if ( $new ) return $new;
    }
    if ( is_post_type_archive( 'dataset' ) ) {
        $new = locate_template( 'page-data.php' );
        if ( $new ) return $new;
    }

    return $template;
}
add_filter( 'template_include', 'crades_template_routing' );

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   4. TEMPLATE HELPERS
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function crades_img( $file ) {
    return CRADES_URI . '/assets/img/' . $file;
}

function crades_header() {
    get_template_part( 'template-parts/header' );
}

function crades_footer() {
    get_template_part( 'template-parts/footer' );
}

/**
 * Renders a page header banner (navy bg, breadcrumb, title, subtitle)
 */
function crades_page_header( $title, $subtitle = '', $breadcrumb = [] ) {
    ?>
    <section class="bg-brand-navy py-16 lg:py-20">
      <div class="max-w-6xl mx-auto px-4 sm:px-6">
        <?php if ( ! empty( $breadcrumb ) ) : ?>
        <nav class="text-xs text-gray-400 mb-4">
          <a href="<?php echo esc_url( home_url('/') ); ?>" class="hover:text-white">Accueil</a>
          <?php foreach ( $breadcrumb as $link ) : ?>
            <span class="mx-2 text-gray-600">/</span>
            <?php if ( ! empty( $link['url'] ) ) : ?>
              <a href="<?php echo esc_url( $link['url'] ); ?>" class="hover:text-white"><?php echo esc_html( $link['label'] ); ?></a>
            <?php else : ?>
              <span class="text-gray-300"><?php echo esc_html( $link['label'] ); ?></span>
            <?php endif; ?>
          <?php endforeach; ?>
        </nav>
        <?php endif; ?>
        <h1 class="font-display text-2xl lg:text-3xl text-white"><?php echo esc_html( $title ); ?></h1>
        <?php if ( $subtitle ) : ?>
          <p class="text-gray-400 mt-2 text-sm"><?php echo esc_html( $subtitle ); ?></p>
        <?php endif; ?>
      </div>
    </section>
    <?php
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   5. ADMIN CUSTOMISATION
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function crades_admin_footer() {
    return '<span>CRADES &mdash; Centre de Recherche, d\'Analyse des &Eacute;changes et Statistiques</span>';
}
add_filter( 'admin_footer_text', 'crades_admin_footer' );

function crades_login_logo() {
    $logo = crades_img( 'logo-crades.png' );
    echo '<style>#login h1 a { background-image:url(' . esc_url( $logo ) . ')!important; background-size:contain!important; width:200px!important; height:80px!important; }</style>';
}
add_action( 'login_enqueue_scripts', 'crades_login_logo' );

add_filter( 'login_headerurl', function() { return home_url(); } );

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   6. DISABLE COMMENTS ON CPTs
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function crades_disable_cpt_comments() {
    foreach ( [ 'publication', 'indicateur', 'dashboard', 'dataset' ] as $cpt ) {
        if ( post_type_exists( $cpt ) ) {
            remove_post_type_support( $cpt, 'comments' );
            remove_post_type_support( $cpt, 'trackbacks' );
        }
    }
}
add_action( 'init', 'crades_disable_cpt_comments', 20 );

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   7. SECURITY
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
remove_action( 'wp_head', 'wp_generator' );
add_filter( 'xmlrpc_enabled', '__return_false' );
remove_action( 'wp_head', 'wp_shortlink_wp_head' );

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   8. EXCERPT
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
add_filter( 'excerpt_length', function() { return 25; } );
add_filter( 'excerpt_more', function() { return '...'; } );

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   9. DASHBOARD WIDGET
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function crades_dashboard_widget() {
    wp_add_dashboard_widget( 'crades_info', 'CRADES - Gestion du contenu', 'crades_dashboard_widget_render' );
}
add_action( 'wp_dashboard_setup', 'crades_dashboard_widget' );

function crades_dashboard_widget_render() {
    $links = [
        [ 'edit.php?post_type=indicateur', 'fas fa-chart-bar', 'Indicateurs' ],
        [ 'edit.php?post_type=dashboard',  'fas fa-chart-pie', 'Tableaux de bord' ],
        [ 'edit.php?post_type=publication', 'fas fa-book',     'Publications' ],
        [ 'edit.php?post_type=dataset',    'fas fa-database',  'Datasets' ],
        [ 'edit.php',                      'fas fa-newspaper', 'Actualites' ],
    ];
    echo '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px;">';
    foreach ( $links as $l ) {
        printf(
            '<a href="%s" style="display:flex;align-items:center;gap:8px;padding:10px 12px;background:#eef4fb;border-radius:8px;text-decoration:none;color:#032d6b;font-size:13px;font-weight:500;"><i class="%s"></i>%s</a>',
            esc_url( admin_url( $l[0] ) ), esc_attr( $l[1] ), esc_html( $l[2] )
        );
    }
    echo '</div>';
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   10. BODY CLASS
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function crades_body_class( $classes ) {
    $classes[] = 'bg-white';
    $classes[] = 'font-sans';
    $classes[] = 'text-gray-700';
    $classes[] = 'antialiased';
    return $classes;
}
add_filter( 'body_class', 'crades_body_class' );

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   11. CUSTOM TITLE TAG
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function crades_document_title_parts( $title ) {
    $title['tagline'] = '';
    if ( isset( $title['site'] ) ) {
        $title['site'] = 'CRADES';
    }
    return $title;
}
add_filter( 'document_title_parts', 'crades_document_title_parts' );

add_filter( 'document_title_separator', function() { return '|'; } );

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   12. AUTO-CREATE REQUIRED PAGES ON THEME SWITCH
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function crades_create_pages() {
    $pages = [
        'publications'       => 'Publications',
        'tableaux-de-bord'   => 'Tableaux de bord',
        'contact'            => 'Contact',
        'commerce-exterieur' => 'Commerce exterieur',
        'donnees'            => 'Donnees',
        'actualites'         => 'Actualites',
        'a-propos'           => 'A propos',
    ];

    foreach ( $pages as $slug => $title ) {
        $existing = get_page_by_path( $slug );
        if ( ! $existing ) {
            wp_insert_post( [
                'post_title'   => $title,
                'post_name'    => $slug,
                'post_status'  => 'publish',
                'post_type'    => 'page',
                'post_content' => '',
            ] );
        }
    }

    /* Set front page to static page */
    $front = get_page_by_path( 'accueil' );
    if ( ! $front ) {
        $front_id = wp_insert_post( [
            'post_title'   => 'Accueil',
            'post_name'    => 'accueil',
            'post_status'  => 'publish',
            'post_type'    => 'page',
            'post_content' => '',
        ] );
        update_option( 'show_on_front', 'page' );
        update_option( 'page_on_front', $front_id );
    }
}
add_action( 'after_switch_theme', 'crades_create_pages' );
