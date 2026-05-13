<?php
/**
 * Plugin Name: Air for WordPress
 * Plugin URI:  https://air.inc
 * Description: Sync or upload your Air assets to your WordPress website!
 * Version:     0.2.7
 * Author:      Air Inc
 * Author URI:  https://air.inc
 * License:     GPL-2.0-or-later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: air-asset-picker
 * Requires at least: 6.3
 * Requires PHP: 7.4
 *
 * @package Air_Inc
 */

defined( 'ABSPATH' ) || exit;

/**
 * Registers the Air Asset Picker block and passes runtime config to the editor script.
 *
 * @return void
 */
function air_inc_register_block() {
	register_block_type( __DIR__ . '/build' );

	wp_localize_script(
		'air-inc-asset-picker-editor-script',
		'airAssetPickerData',
		array(
			'workspaceId' => get_option( 'air_workspace_id', defined( 'AIR_INC_WORKSPACE_ID' ) ? AIR_INC_WORKSPACE_ID : '' ),
			'pluginUrl'   => trailingslashit( plugin_dir_url( __FILE__ ) ),
		)
	);
}

add_action( 'init', 'air_inc_register_block' );

/**
 * Registers the Settings → Air Media admin page.
 *
 * @return void
 */
function air_inc_register_settings_page() {
	add_options_page(
		__( 'Air Media Settings', 'air-asset-picker' ),
		__( 'Air Media', 'air-asset-picker' ),
		'manage_options',
		'air-media',
		'air_inc_settings_page_html'
	);
}

add_action( 'admin_menu', 'air_inc_register_settings_page' );

/**
 * Registers the plugin options with sanitization callbacks.
 *
 * @return void
 */
function air_inc_register_settings() {
	register_setting(
		'air_inc_settings',
		'air_workspace_id',
		array( 'sanitize_callback' => 'sanitize_text_field' )
	);
}

add_action( 'admin_init', 'air_inc_register_settings' );

/**
 * Renders the Settings → Air Media page HTML.
 *
 * @return void
 */
function air_inc_settings_page_html() {
	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}
	?>
	<div class="wrap">
		<h1><?php echo esc_html( get_admin_page_title() ); ?></h1>
		<form action="options.php" method="post">
			<?php
			settings_fields( 'air_inc_settings' );
			do_settings_sections( 'air-media' );
			?>
			<table class="form-table" role="presentation">
				<tr>
					<th scope="row">
						<label for="air_workspace_id"><?php esc_html_e( 'Workspace ID', 'air-asset-picker' ); ?></label>
					</th>
					<td>
						<input
							type="text"
							id="air_workspace_id"
							name="air_workspace_id"
							value="<?php echo esc_attr( get_option( 'air_workspace_id' ) ); ?>"
							class="regular-text"
						/>
						<p class="description"><?php esc_html_e( 'Your Air workspace ID, found in your Air account settings.', 'air-asset-picker' ); ?></p>
					</td>
				</tr>
			</table>
			<?php submit_button( __( 'Save Settings', 'air-asset-picker' ) ); ?>
		</form>
	</div>
	<?php
}

/**
 * Returns the plugin's installed folder slug, used to match search/details requests.
 *
 * @return string
 */
function air_inc_plugin_slug() {
	return basename( __DIR__ );
}

/**
 * Builds the wp.org-shaped plugin info payload used by the install search card and Details modal.
 *
 * @param bool $with_sections Include long sections + screenshots (Details modal).
 * @return object
 */
function air_inc_plugin_info_payload( $with_sections = false ) {
	$assets_url = plugins_url( 'assets', __FILE__ );

	$info = (object) array(
		'name'              => 'Air for WordPress',
		'slug'              => air_inc_plugin_slug(),
		'version'           => '0.2.0',
		'author'            => '<a href="https://air.inc">Air Inc</a>',
		'author_profile'    => 'https://air.inc',
		'requires'          => '6.3',
		'tested'            => '6.9',
		'requires_php'      => '7.4',
		'rating'            => 100,
		'num_ratings'       => 0,
		'support_threads'   => 0,
		'active_installs'   => 0,
		'last_updated'      => gmdate( 'Y-m-d' ),
		'added'             => '2026-01-01',
		'homepage'          => 'https://air.inc',
		'short_description' => 'Sync or upload your Air assets to your WordPress website!',
		'download_link'     => '',
		'tags'              => array(
			'air'   => 'air',
			'dam'   => 'dam',
			'media' => 'media',
		),
		'icons'             => array(
			'1x'      => $assets_url . '/icon-128x128.png',
			'2x'      => $assets_url . '/icon-256x256.png',
			'default' => $assets_url . '/icon-1024x1024.png',
		),
		'banners'           => array(
			'low'  => $assets_url . '/banner-772x250.png',
			'high' => $assets_url . '/banner-1544x500.png',
		),
	);

	if ( $with_sections ) {
		$screenshots_html = '<ol>';
		for ( $i = 1; $i <= 7; $i++ ) {
			$screenshots_html .= '<li><img src="' . esc_url( $assets_url . "/screenshot-{$i}.png" ) . '" alt="" /></li>';
		}
		$screenshots_html .= '</ol>';

		$info->sections = array(
			'description'  => '<blockquote><p>This plugin requires a Brandfolder account which you can setup at <a href="https://brandfolder.com">Brandfolder.com</a></p></blockquote>'
				. '<p>This plugin provides one block and is only compatible with the Gutenberg editor at time.</p>'
				. '<h3>Features of the Brandfolder WordPress plugin</h3>'
				. '<ul>'
				. '<li>Edit your Brandfolders directly from your WordPress admin panel.</li>'
				. '<li>Easily embed your Brandfolder using our Popup Embed on any widget, menu bar, page, or post.</li>'
				. '</ul>',
			'installation' => '<ol><li>Activate the plugin.</li><li>Go to <strong>Settings → Air Media</strong> and enter your Air workspace ID.</li><li>Edit a page or post, add the <strong>Air Media</strong> block, and click <strong>Browse Air</strong>.</li></ol>',
			'screenshots'  => $screenshots_html,
			'changelog'    => '<h4>0.1.0</h4><ul><li>Initial release.</li></ul>',
		);
	}

	return $info;
}

/**
 * Handles `plugin_information` requests for the Plugin Details modal.
 *
 * @param false|object|WP_Error $res    Existing response.
 * @param string                $action API action.
 * @param object                $args   Request args.
 * @return false|object|WP_Error
 */
function air_inc_filter_plugin_information( $res, $action, $args ) {
	if ( 'plugin_information' !== $action ) {
		return $res;
	}
	if ( empty( $args->slug ) ) {
		return $res;
	}
	$slug         = (string) $args->slug;
	$stale_slugs  = array( 'air-wp', 'brandfolder', 'brandfolder-wordpress', 'air-asset-picker' );
	if ( $slug === air_inc_plugin_slug() || in_array( strtolower( $slug ), $stale_slugs, true ) ) {
		return air_inc_plugin_info_payload( true );
	}
	return $res;
}

add_filter( 'plugins_api', 'air_inc_filter_plugin_information', 10, 3 );

/**
 * Injects the plugin into install search results so the card renders with our metadata.
 *
 * @param object|WP_Error $res    wp.org API response.
 * @param string          $action API action.
 * @param object          $args   Request args.
 * @return object|WP_Error
 */
function air_inc_filter_plugin_search_results( $res, $action, $args ) {
	if ( 'query_plugins' !== $action || is_wp_error( $res ) ) {
		return $res;
	}

	$search = isset( $args->search ) ? strtolower( (string) $args->search ) : '';
	if ( '' === $search || false === strpos( $search, 'air' ) ) {
		return $res;
	}

	if ( ! isset( $res->plugins ) || ! is_array( $res->plugins ) ) {
		$res->plugins = array();
	}

	$removed       = 0;
	$res->plugins  = array_values(
		array_filter(
			$res->plugins,
			static function ( $plugin ) use ( &$removed ) {
				if ( air_inc_is_stale_air_listing( $plugin ) ) {
					$removed++;
					return false;
				}
				return true;
			}
		)
	);

	$slug = air_inc_plugin_slug();
	foreach ( $res->plugins as $existing ) {
		$existing_slug = is_object( $existing ) ? ( $existing->slug ?? '' ) : ( $existing['slug'] ?? '' );
		if ( $existing_slug === $slug ) {
			if ( $removed && isset( $res->info['results'] ) ) {
				$res->info['results'] = max( 0, $res->info['results'] - $removed );
			}
			return $res;
		}
	}

	array_unshift( $res->plugins, air_inc_plugin_info_payload() );

	if ( isset( $res->info['results'] ) ) {
		$res->info['results'] = max( 0, $res->info['results'] - $removed + 1 );
	}

	return $res;
}

/**
 * Detects the legacy Brandfolder/Air plugin entry served from wp.org so it can be removed
 * from search results in favor of our card.
 *
 * @param object|array $plugin Plugin entry from the wp.org API.
 * @return bool
 */
function air_inc_is_stale_air_listing( $plugin ) {
	$get = static function ( $key ) use ( $plugin ) {
		if ( is_object( $plugin ) ) {
			return $plugin->$key ?? '';
		}
		if ( is_array( $plugin ) ) {
			return $plugin[ $key ] ?? '';
		}
		return '';
	};

	$slug   = strtolower( (string) $get( 'slug' ) );
	$author = strtolower( wp_strip_all_tags( (string) $get( 'author' ) ) );
	$name   = strtolower( (string) $get( 'name' ) );
	$short  = strtolower( wp_strip_all_tags( (string) $get( 'short_description' ) ) );

	$stale_slugs = array( 'air-wp', 'brandfolder', 'brandfolder-wordpress', 'air-asset-picker' );
	if ( in_array( $slug, $stale_slugs, true ) ) {
		return true;
	}

	if ( false !== strpos( $author, 'brandfolder' ) ) {
		return true;
	}

	if ( false !== strpos( $name, 'brandfolder' ) || false !== strpos( $short, 'brandfolder' ) ) {
		return true;
	}

	return false;
}

add_filter( 'plugins_api_result', 'air_inc_filter_plugin_search_results', 10, 3 );
