<?php
/**
 * Plugin Name: Air Asset Picker
 * Description: Gutenberg block for selecting and embedding assets from Air.
 * Version: 0.1.0
 * Author: Air.inc
 *
 * @package air-inc-plugin
 */

defined( 'ABSPATH' ) || exit;

function example_air_register_block() {
	register_block_type( __DIR__ . '/build' );
}

add_action( 'init', 'example_air_register_block' );
