<?php
/**
 * Plugin Name: Air Asset Picker
 * Description: Gutenberg block for selecting and embedding assets from Air.
 * Version:     0.1.0
 * Author:      Air.inc
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
			'workspaceId' => defined( 'AIR_INC_WORKSPACE_ID' ) ? AIR_INC_WORKSPACE_ID : '',
		)
	);
}

add_action( 'init', 'air_inc_register_block' );
