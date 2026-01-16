<?php
/**
 * Register control in Block Visibility settings.
 *
 * @package bws-acf-datetime-control
 * @since 1.0.0
 * @license GPL-2.0-or-later
 */

defined( 'ABSPATH' ) || exit;

/**
 * Add control to Block Visibility settings schema.
 *
 * @param array $settings Block Visibility settings schema.
 * @return array Modified settings schema.
 */
add_filter( 'block_visibility_settings', 'bws_register_acf_datetime_settings' );
function bws_register_acf_datetime_settings( $settings ) {
	$settings['visibility_controls']['properties']['acf_date_time'] = array(
		'type'       => 'object',
		'properties' => array(
			'enable' => array( 'type' => 'boolean' ),
		),
	);
	return $settings;
}

/**
 * Set default values for control.
 *
 * @param array $defaults Block Visibility default settings.
 * @return array Modified defaults.
 */
add_filter( 'block_visibility_settings_defaults', 'bws_register_acf_datetime_defaults' );
function bws_register_acf_datetime_defaults( $defaults ) {
	$defaults['visibility_controls']['acf_date_time'] = array(
		'enable' => true,
	);
	return $defaults;
}
