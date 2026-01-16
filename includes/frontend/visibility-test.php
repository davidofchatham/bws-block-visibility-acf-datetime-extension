<?php
/**
 * ACF Date/Time visibility test.
 *
 * Rule set structure adapted from Block Visibility's ACF integration.
 *
 * @see block-visibility/includes/frontend/visibility-tests/acf.php
 *
 * @package bws-block-visibility-acf-datetime-extension
 * @since 1.0.0
 * @license GPL-2.0-or-later
 */

namespace BWS\ACFDateTime;

defined( 'ABSPATH' ) || exit;

// Debug flag - set to true to enable detailed logging.
const DEBUG_ACF_DATETIME = false;

// Import Block Visibility utilities.
use function BlockVisibility\Utils\is_control_enabled;

/**
 * Debug logging helper.
 *
 * @param string $message Log message.
 */
function debug_log( $message ) {
	if ( DEBUG_ACF_DATETIME ) {
		error_log( $message );
	}
}

/**
 * Test block visibility based on ACF date/time field comparisons.
 *
 * @param boolean $is_visible Current visibility state.
 * @param array   $settings   Plugin settings.
 * @param array   $controls   Control set controls.
 * @return boolean Whether block should be visible.
 */
add_filter( 'block_visibility_control_set_is_block_visible', __NAMESPACE__ . '\\acf_datetime_test', 15, 3 );
function acf_datetime_test( $is_visible, $settings, $controls ) {
	debug_log( '==== BWS ACF DateTime: Filter called ====' );
	debug_log( 'is_visible = ' . ( $is_visible ? 'true' : 'false' ) );

	// Early returns.
	if ( ! $is_visible ) {
		debug_log( 'Returning early: is_visible already false' );
		return $is_visible;
	}

	if ( ! function_exists( 'get_field_object' ) ) {
		debug_log( 'Returning early: ACF get_field_object not available' );
		return $is_visible;
	}

	$control_enabled = is_control_enabled( $settings, 'acf_date_time' );
	debug_log( 'Control enabled check: ' . ( $control_enabled ? 'yes' : 'no' ) );

	if ( ! $control_enabled ) {
		return true;
	}

	$control_atts = isset( $controls['acfDateTime'] ) ? $controls['acfDateTime'] : null;

	if ( ! $control_atts ) {
		debug_log( 'Returning early: No acfDateTime control attributes' );
		return true;
	}

	$rule_sets         = isset( $control_atts['ruleSets'] ) ? $control_atts['ruleSets'] : array();
	$hide_on_rule_sets = isset( $control_atts['hideOnRuleSets'] ) ? $control_atts['hideOnRuleSets'] : false;

	debug_log( 'Rule sets count: ' . count( $rule_sets ) );
	debug_log( 'hideOnRuleSets: ' . ( $hide_on_rule_sets ? 'true' : 'false' ) );

	if ( empty( $rule_sets ) ) {
		debug_log( 'Returning early: No rule sets' );
		return true;
	}

	$current_user_id        = get_current_user_id();
	$rule_sets_test_results = array();

	// Process each rule set.
	foreach ( $rule_sets as $rule_set_index => $rule_set ) {
		debug_log( '-- Processing rule set ' . $rule_set_index );

		$enable = isset( $rule_set['enable'] ) ? $rule_set['enable'] : true;
		$rules  = isset( $rule_set['rules'] ) ? $rule_set['rules'] : array();

		if ( ! $enable || empty( $rules ) ) {
			debug_log( '   Skipping rule set (disabled or no rules)' );
			continue;
		}

		$rule_set_test_results = array();

		// Process each rule within the set.
		foreach ( $rules as $rule_index => $rule ) {
			debug_log( '   -- Processing rule ' . $rule_index );

			$field     = isset( $rule['field'] ) ? $rule['field'] : null;
			$sub_field = isset( $rule['subField'] ) ? $rule['subField'] : 'post';
			$operator  = isset( $rule['operator'] ) ? $rule['operator'] : null;

			debug_log( '      Field: ' . $field );
			debug_log( '      Operator: ' . $operator );
			debug_log( '      Context: ' . $sub_field );

			if ( ! $field || ! $operator ) {
				debug_log( '      Result: visible (missing field or operator)' );
				$rule_set_test_results[] = 'visible';
				continue;
			}

			// Get ACF field object with value.
			$acf_field = get_acf_field_by_context( $field, $sub_field, $current_user_id );

			if ( ! $acf_field ) {
				debug_log( '      Result: visible (ACF field not found)' );
				$rule_set_test_results[] = 'visible';
				continue;
			}

			debug_log( '      ACF field type: ' . $acf_field['type'] );
			debug_log( '      ACF field value: ' . $acf_field['value'] );

			if ( empty( $acf_field['value'] ) ) {
				debug_log( '      Result: visible (ACF field has no value)' );
				$rule_set_test_results[] = 'visible';
				continue;
			}

			// Run date comparison.
			$passes = compare_acf_datetime(
				$acf_field['value'],
				$acf_field['type'],
				$operator
			);

			debug_log( '      Comparison result: ' . ( $passes ? 'PASS' : 'FAIL' ) );
			debug_log( '      Result: ' . ( $passes ? 'visible' : 'hidden' ) );

			$rule_set_test_results[] = $passes ? 'visible' : 'hidden';
		}

		// AND logic within rule set.
		$rule_set_result = in_array( 'hidden', $rule_set_test_results, true )
			? 'hidden'
			: 'visible';

		debug_log( '   Rule set result (before inversion): ' . $rule_set_result );

		// Apply hideOnRuleSets inversion.
		if ( $hide_on_rule_sets ) {
			$rule_set_result = ( 'visible' === $rule_set_result ) ? 'hidden' : 'visible';
			debug_log( '   Rule set result (after inversion): ' . $rule_set_result );
		}

		$rule_sets_test_results[] = $rule_set_result;
	}

	debug_log( 'All rule set results: ' . implode( ', ', $rule_sets_test_results ) );

	// OR logic between rule sets.
	if ( ! $hide_on_rule_sets ) {
		$final_result = in_array( 'visible', $rule_sets_test_results, true );
	} else {
		$final_result = ! in_array( 'hidden', $rule_sets_test_results, true );
	}

	debug_log( 'Final visibility result: ' . ( $final_result ? 'VISIBLE' : 'HIDDEN' ) );
	debug_log( '==== BWS ACF DateTime: End ====' );

	return $final_result;
}

/**
 * Get the current portal's post ID.
 *
 * @return int|false Portal post ID or false if not available.
 */
function get_portal_post_id() {
	// Check if portal system is available.
	if ( ! function_exists( 'bws_portal' ) ) {
		return false;
	}

	// Get current portal ID.
	$portal_id = bws_portal()->detector()->get_current_id();

	if ( empty( $portal_id ) ) {
		return false;
	}

	// Get portal maps (portal_id -> post_id mapping).
	$maps = bws_portal()->portal_maps()->get_maps();
	$post_id = $maps['portal_map'][ $portal_id ] ?? null;

	if ( ! $post_id ) {
		return false;
	}

	// Verify post exists and is published.
	$post = get_post( $post_id );
	if ( ! $post || 'publish' !== $post->post_status ) {
		return false;
	}

	return (int) $post->ID;
}

/**
 * Get ACF field object based on context.
 *
 * @param string $field           ACF field key.
 * @param string $sub_field       Context: 'post'|'user'|'option'|'portal' (legacy: 'true' for post).
 * @param int    $current_user_id Current user ID.
 * @return array|null ACF field object.
 */
function get_acf_field_by_context( $field, $sub_field, $current_user_id ) {
	// Determine post_id based on context.
	if ( 'user' === $sub_field ) {
		if ( ! $current_user_id ) {
			return null;
		}
		$post_id = 'user_' . $current_user_id;
	} elseif ( 'option' === $sub_field ) {
		$post_id = 'option';
	} elseif ( 'portal' === $sub_field ) {
		// Portal context.
		$post_id = get_portal_post_id();

		if ( ! $post_id ) {
			// No valid portal context, return null.
			return null;
		}
	} else {
		// Default: current post context (when subField is 'post', 'true', or any other value).
		$post_id = false; // false means current post in ACF.
	}

	// Get field object for type and configuration.
	$field_object = get_field_object( $field, $post_id );

	if ( ! $field_object ) {
		return null;
	}

	// Get RAW unformatted value (third parameter = false prevents formatting).
	// This ensures we get Ymd format for date_picker instead of display format.
	$raw_value = get_field( $field, $post_id, false );

	// Override the formatted value with the raw value.
	$field_object['value'] = $raw_value;

	return $field_object;
}

/**
 * Compare ACF date/datetime field value against current date/time.
 *
 * @param mixed  $field_value ACF field value.
 * @param string $field_type  ACF field type.
 * @param string $operator    Comparison operator.
 * @return boolean Whether comparison passes.
 */
function compare_acf_datetime( $field_value, $field_type, $operator ) {
	debug_log( '      [compare_acf_datetime] ENTER: value=' . $field_value . ', type=' . $field_type . ', op=' . $operator );
	try {
		// Get WordPress timezone for consistent comparisons.
		$timezone = wp_timezone();

		// Parse ACF field value.
		if ( 'date_picker' === $field_type ) {
			// ACF stores as Ymd (e.g., 20240115).
			$field_datetime = \DateTime::createFromFormat( 'Ymd', $field_value, $timezone );
			debug_log( '      [compare_acf_datetime] DateTime created: ' . ( $field_datetime ? 'YES' : 'NO' ) );

			// Set to start of day for date-only comparisons.
			if ( $field_datetime ) {
				$field_datetime->setTime( 0, 0, 0 );
			}
		} elseif ( 'date_time_picker' === $field_type ) {
			// ACF stores as Y-m-d H:i:s (e.g., 2024-01-15 14:30:00).
			$field_datetime = \DateTime::createFromFormat( 'Y-m-d H:i:s', $field_value, $timezone );
		} else {
			return false;
		}

		if ( ! $field_datetime ) {
			debug_log( '      [compare_acf_datetime] EXIT EARLY: field_datetime is null/false' );
			return false;
		}

		// Get current date/time with same timezone.
		$current = new \DateTime( 'now', $timezone );
		debug_log( '      [compare_acf_datetime] Current created: ' . ( $current ? 'YES' : 'NO' ) );

		// For date_picker fields, compare at midnight.
		if ( 'date_picker' === $field_type ) {
			$current->setTime( 0, 0, 0 );
		}

		debug_log( '      Field DateTime: ' . $field_datetime->format( 'Y-m-d H:i:s' ) );
		debug_log( '      Current DateTime: ' . $current->format( 'Y-m-d H:i:s' ) );
		debug_log( '      Checking: current > field_datetime = ' . ( $current > $field_datetime ? 'TRUE' : 'FALSE' ) );

		// Apply operator.
		// All comparisons check: "Is current date/time [operator] the field date/time?"
		switch ( $operator ) {
			case 'before':
				// Current date-time is before this date-time.
				return $current < $field_datetime;

			case 'beforeOrOn':
				// Current date-time is on or before this date-time.
				return $current <= $field_datetime;

			case 'after':
				// Current date-time is after this date-time.
				return $current > $field_datetime;

			case 'onOrAfter':
				// Current date-time is on or after this date-time.
				return $current >= $field_datetime;

			default:
				return false;
		}

	} catch ( \Exception $e ) {
		debug_log( '      [compare_acf_datetime] EXCEPTION: ' . $e->getMessage() );
		debug_log( '      [compare_acf_datetime] Stack trace: ' . $e->getTraceAsString() );
		return false;
	}
}
