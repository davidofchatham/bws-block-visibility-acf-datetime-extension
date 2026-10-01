/**
 * Advanced Custom Fields Date/Time Control - control metadata
 *
 * Imported by both the editor and settings scripts: BV's `getControls()` builds the editor menu
 * and the settings page's "Default visibility controls" list from this filter.
 *
 * @see block-visibility/src/utils/get-enabled-controls.js
 *
 * @package bws-block-visibility-acf-datetime-extension
 * @since 1.0.0
 * @license GPL-2.0-or-later
 */

import { addFilter } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import { calendar } from '@wordpress/icons';

addFilter(
	'blockVisibility.controls',
	'bws/acf-datetime-control',
	function( controls ) {
		controls.push( {
			label: __( 'Advanced Custom Fields Date/Time', 'bws-block-visibility-acf-datetime-extension' ),
			type: 'integration',
			icon: calendar,
			attributeSlug: 'acfDateTime',
			settingSlug: 'acf_date_time',
		} );
		return controls;
	}
);
