<?php
/**
 * Main control class.
 *
 * @package bws-block-visibility-acf-datetime-extension
 * @since 1.0.0
 * @license GPL-2.0-or-later
 */

defined( 'ABSPATH' ) || exit;

/**
 * ACF Date/Datetime Control class.
 */
class BWS_ACF_DateTime_Control {

	/**
	 * Constructor.
	 */
	public function __construct() {
		$this->includes();
		$this->init_hooks();
	}

	/**
	 * Include required files.
	 */
	private function includes() {
		require_once BWS_ACF_DATETIME_PATH . 'includes/settings-integration.php';

		// Load on every non-admin request, REST included; see docs/architecture.md.
		if ( ! is_admin() ) {
			require_once BWS_ACF_DATETIME_PATH . 'includes/frontend/visibility-test.php';
		}
	}

	/**
	 * Initialize hooks.
	 */
	private function init_hooks() {
		add_action( 'enqueue_block_editor_assets', array( $this, 'enqueue_editor_assets' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_settings_assets' ) );
	}

	/**
	 * Enqueue the settings panel script on Block Visibility's settings screen only.
	 */
	public function enqueue_settings_assets() {
		// Same page check as Block Visibility's own settings assets.
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		if ( ! isset( $_GET['page'] ) || 'block-visibility-settings' !== $_GET['page'] ) {
			return;
		}

		$asset_file = BWS_ACF_DATETIME_PATH . 'build/settings-panel.asset.php';

		if ( ! file_exists( $asset_file ) ) {
			return;
		}

		$asset_data = include $asset_file;

		wp_enqueue_script(
			'bws-block-visibility-acf-datetime-extension-settings',
			BWS_ACF_DATETIME_URL . 'build/settings-panel.js',
			$asset_data['dependencies'],
			$asset_data['version'],
			true
		);
	}

	/**
	 * Enqueue editor assets.
	 */
	public function enqueue_editor_assets() {
		$asset_file = BWS_ACF_DATETIME_PATH . 'build/editor-control.asset.php';

		// Check if asset file exists (will be created by build process).
		if ( ! file_exists( $asset_file ) ) {
			return;
		}

		$asset_data = include $asset_file;

		wp_enqueue_script(
			'bws-block-visibility-acf-datetime-extension-editor',
			BWS_ACF_DATETIME_URL . 'build/editor-control.js',
			$asset_data['dependencies'],
			$asset_data['version'],
			true
		);

		// Pass configuration to JavaScript using wp_localize_script.
		wp_localize_script(
			'bws-block-visibility-acf-datetime-extension-editor',
			'bwsAcfDateTimeConfig',
			array(
				'controlSlug' => 'acfDateTime',
				'operators'   => $this->get_operators(),
			)
		);
	}

	/**
	 * Get available operators.
	 *
	 * @return array Operators with value and label.
	 */
	private function get_operators() {
		return array(
			array(
				'value' => 'before',
				'label' => __( 'Before', 'bws-block-visibility-acf-datetime-extension' ),
			),
			array(
				'value' => 'beforeOrOn',
				'label' => __( 'On or before', 'bws-block-visibility-acf-datetime-extension' ),
			),
			array(
				'value' => 'onOrAfter',
				'label' => __( 'On or after', 'bws-block-visibility-acf-datetime-extension' ),
			),
			array(
				'value' => 'after',
				'label' => __( 'After', 'bws-block-visibility-acf-datetime-extension' ),
			),
		);
	}
}
