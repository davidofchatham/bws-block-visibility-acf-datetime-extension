/**
 * ACF Date & Time Control - Block Visibility settings panel
 *
 * Adds a global enable toggle to Settings → Block Visibility → Visibility Controls → Integrations.
 * The panel fills BV's `VisibilityControlsIntegrations` slot; the `blockVisibility.VisibilityControls`
 * filter is the only place BV hands settings state (`visibilityControls`, `setVisibilityControls`) to add-ons.
 *
 * @see block-visibility/src/settings/visibility-controls/acf/index.js
 * @see block-visibility/src/settings/visibility-controls/index.js
 *
 * @package bws-block-visibility-acf-datetime-extension
 * @since 1.0.0
 */

import { addFilter } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import { createElement as el, Fragment } from '@wordpress/element';
import { ToggleControl, Fill } from '@wordpress/components';
import { Icon, calendar } from '@wordpress/icons';

( function() {
	/**
	 * Settings panel component, modeled on BV's own ACF settings panel.
	 *
	 * @param {Object} props Props BV passes to `blockVisibility.VisibilityControls` components.
	 * @return {Element|null} The panel, or null when the control's integration is inactive.
	 */
	function AcfDateTimeSettingsPanel( props ) {
		const { variables, visibilityControls, setVisibilityControls } = props;

		if ( ! variables?.integrations?.acf_date_time?.active ) {
			return null;
		}

		// Match the PHP default so a missing key reads as enabled.
		const enable = visibilityControls?.acf_date_time?.enable ?? true;

		return el( 'div', { className: 'settings-panel control-acf-date-time' },
			el( 'div', { className: 'settings-panel__header' },
				el( 'span', { className: 'settings-panel__header-title' },
					el( Icon, { icon: calendar } ),
					__( 'ACF Date & Time', 'bws-block-visibility-acf-datetime-extension' )
				)
			),
			el( 'div', { className: 'settings-panel__container' },
				el( 'div', { className: 'settings-type__toggle' },
					el( ToggleControl, {
						label: __( 'Enable the ACF Date & Time control.', 'bws-block-visibility-acf-datetime-extension' ),
						checked: enable,
						onChange: function() {
							setVisibilityControls( Object.assign( {}, visibilityControls, {
								acf_date_time: Object.assign( {}, visibilityControls?.acf_date_time, { enable: ! enable } )
							} ) );
						}
					} )
				)
			)
		);
	}

	addFilter(
		'blockVisibility.VisibilityControls',
		'bws/acf-datetime-settings-panel',
		function( VisibilityControls ) {
			return function( props ) {
				return el( Fragment, {},
					el( VisibilityControls, props ),
					el( Fill, { name: 'VisibilityControlsIntegrations' },
						el( AcfDateTimeSettingsPanel, props )
					)
				);
			};
		}
	);
} )();
