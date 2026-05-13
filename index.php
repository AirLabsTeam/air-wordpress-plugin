<?php
/**
 * Plugin Name: Air Asset Picker
 * Plugin URI:  https://air.inc
 * Description: Embed brand-approved images and videos from your Air workspace directly in the WordPress block editor.
 * Version:     0.2.11
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

