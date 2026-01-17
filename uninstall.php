<?php
/**
 * Uninstall Script
 *
 * Runs when the plugin is uninstalled via the WordPress admin.
 * Cleans up any plugin data if needed.
 *
 * @package bws-block-visibility-acf-datetime-extension
 */

// Exit if accessed directly.
defined( 'ABSPATH' ) || exit;

// If uninstall not called from WordPress, exit.
if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

/**
 * Note: This plugin doesn't store any data in the database.
 * All visibility rules are stored in block attributes by Block Visibility.
 * No cleanup is needed on uninstall.
 */
