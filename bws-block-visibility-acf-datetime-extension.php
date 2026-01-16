<?php
/**
 * Plugin Name: Block Visibility ACF Date-Time Extension by BWS 
 * Plugin URI: https://github.com/davidofchatham/bws-block-visibility-acf-datetime-extension
 * Description: Adds a control for conditions based on ACF date/datetime fields to Block Visibility
 * Version: 1.0.0
 * Requires PHP: 7.4
 * Requires at least: 6.5
 * Author: Bridge Web Solutions
 * Author URI: https://bridgewebsolutions.com
 * License: GPL-2.0-or-later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: bws-block-visibility-acf-datetime-extension
 *
 * @package bws-block-visibility-acf-datetime-extension
 */

defined( 'ABSPATH' ) || exit;

// Check Block Visibility version.
if ( ! defined( 'BLOCK_VISIBILITY_VERSION' ) ||
	 version_compare( BLOCK_VISIBILITY_VERSION, '3.0.0', '<' ) ) {
	add_action( 'admin_notices', 'bws_acf_datetime_control_bv_version_notice' );
	return;
}

// Check ACF is active.
if ( ! function_exists( 'acf' ) ) {
	add_action( 'admin_notices', 'bws_acf_datetime_control_acf_notice' );
	return;
}

/**
 * Admin notice for Block Visibility version requirement.
 */
function bws_acf_datetime_control_bv_version_notice() {
	echo '<div class="error"><p>';
	echo esc_html__( 'Block Visibility ACF Date-Time Extension requires Block Visibility 3.0.0 or higher.', 'bws-block-visibility-acf-datetime-extension' );
	echo '</p></div>';
}

/**
 * Admin notice for ACF requirement.
 */
function bws_acf_datetime_control_acf_notice() {
	echo '<div class="error"><p>';
	echo esc_html__( 'Block Visibility ACF Date-Time Extension requires Advanced Custom Fields to be active.', 'bws-block-visibility-acf-datetime-extension' );
	echo '</p></div>';
}

// Define plugin constants.
define( 'BWS_ACF_DATETIME_VERSION', '1.0.0' );
define( 'BWS_ACF_DATETIME_FILE', __FILE__ );
define( 'BWS_ACF_DATETIME_PATH', plugin_dir_path( __FILE__ ) );
define( 'BWS_ACF_DATETIME_URL', plugin_dir_url( __FILE__ ) );

// Initialize at priority 20 (after BV at priority 10).
add_action( 'init', 'bws_acf_datetime_control_init', 20 );

/**
 * Initialize the plugin.
 */
function bws_acf_datetime_control_init() {
	require_once BWS_ACF_DATETIME_PATH . 'includes/class-acf-date-time-control.php';
	new BWS_ACF_DateTime_Control();
}
