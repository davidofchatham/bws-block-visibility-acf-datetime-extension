<?php
/**
 * Visibility check tests for acf_datetime_test().
 *
 * Runs against real ACF and Block Visibility, with no stubs. Creates its own fixture
 * (an ACF local field group and a test post) and removes it afterward, even on failure.
 * Exits nonzero if any assertion fails.
 *
 * Run with wp-cli on the testbed; the command is in docs/testing.md.
 *
 * @package bws-block-visibility-acf-datetime-extension
 */

use function BWS\ACFDateTime\acf_datetime_test;

if ( ! defined( 'ABSPATH' ) || ! defined( 'WP_CLI' ) ) {
	exit( 'Run with wp eval-file.' );
}

if ( ! function_exists( 'acf_add_local_field_group' ) ) {
	WP_CLI::error( 'ACF is not active.' );
}

// The plugin loads this on the 'wp' hook, which never fires under wp-cli.
if ( ! function_exists( 'BlockVisibility\Utils\is_control_enabled' ) ) {
	require_once BLOCK_VISIBILITY_ABSPATH . 'includes/utils/is-control-enabled.php';
}
require_once BWS_ACF_DATETIME_PATH . 'includes/frontend/visibility-test.php';

$GLOBALS['bws_failures'] = 0;
$GLOBALS['bws_checks']   = 0;

/**
 * Record one assertion.
 *
 * @param string  $label    Case description.
 * @param boolean $expected Expected visibility.
 * @param array   $rule_sets Rule sets for the acfDateTime control.
 * @param boolean $hide_on  hideOnRuleSets value.
 */
function bws_check( $label, $expected, $rule_sets, $hide_on = false ) {
	$controls = array(
		'acfDateTime' => array(
			'ruleSets'       => $rule_sets,
			'hideOnRuleSets' => $hide_on,
		),
	);
	$actual   = acf_datetime_test( true, array(), $controls );
	++$GLOBALS['bws_checks'];

	if ( $actual === $expected ) {
		WP_CLI::log( "  ok    $label" );
		return;
	}

	++$GLOBALS['bws_failures'];
	WP_CLI::log( "  FAIL  $label (expected " . var_export( $expected, true ) . ', got ' . var_export( $actual, true ) . ')' );
}

/**
 * Build a single rule against a fixture field.
 *
 * @param string $field    Field name.
 * @param string $operator Comparison operator.
 * @param string $context  Field context: 'post'|'user'|'option'.
 * @return array Rule.
 */
function bws_rule( $field, $operator, $context = 'post' ) {
	return array(
		'field'    => $field,
		'subField' => $context,
		'operator' => $operator,
	);
}

/**
 * Build an enabled rule set.
 *
 * @param array ...$rules Rules, ANDed together.
 * @return array Rule set.
 */
function bws_set( ...$rules ) {
	return array(
		'enable' => true,
		'rules'  => $rules,
	);
}

$group_key = 'group_bws_acf_datetime_test';
$post_id   = 0;

try {
	acf_add_local_field_group(
		array(
			'key'      => $group_key,
			'title'    => 'BWS ACF DateTime test',
			'fields'   => array(
				array(
					'key'  => 'field_bws_test_past',
					'name' => 'bws_test_past',
					'type' => 'date_picker',
				),
				array(
					'key'  => 'field_bws_test_future',
					'name' => 'bws_test_future',
					'type' => 'date_picker',
				),
				array(
					'key'  => 'field_bws_test_empty',
					'name' => 'bws_test_empty',
					'type' => 'date_picker',
				),
				array(
					'key'  => 'field_bws_test_bad',
					'name' => 'bws_test_bad',
					'type' => 'date_picker',
				),
			),
			'location' => array(
				array(
					array(
						'param'    => 'post_type',
						'operator' => '==',
						'value'    => 'post',
					),
				),
			),
		)
	);

	$post_id = wp_insert_post(
		array(
			'post_title'  => 'BWS ACF DateTime test',
			'post_status' => 'draft',
		),
		true
	);
	if ( is_wp_error( $post_id ) ) {
		WP_CLI::error( $post_id->get_error_message() );
	}

	update_field( 'field_bws_test_past', '20000101', $post_id );
	update_field( 'field_bws_test_future', '20990101', $post_id );
	update_field( 'field_bws_test_bad', 'not-a-date', $post_id );

	// ACF reads the current post when no post ID is given.
	$GLOBALS['post'] = get_post( $post_id ); // phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited

	// A missing or empty field is skipped, so prove the fixture values are readable first.
	if (
		'20000101' !== get_field( 'bws_test_past', false, false )
		|| '20990101' !== get_field( 'bws_test_future', false, false )
		|| 'not-a-date' !== get_field( 'bws_test_bad', false, false )
	) {
		WP_CLI::error( 'Fixture fields are not readable; the checks below would be meaningless.' );
	}

	$pass = bws_rule( 'bws_test_past', 'after' );    // Past date, so current is after: passes.
	$fail = bws_rule( 'bws_test_future', 'after' );  // Future date, so current is not after: fails.

	WP_CLI::log( 'AND within a rule set' );
	bws_check( 'all rules pass -> visible', true, array( bws_set( $pass, $pass ) ) );
	bws_check( 'one rule fails -> hidden', false, array( bws_set( $pass, $fail ) ) );

	WP_CLI::log( 'OR across rule sets' );
	bws_check( 'one set passes -> visible', true, array( bws_set( $fail ), bws_set( $pass ) ) );
	bws_check( 'no set passes -> hidden', false, array( bws_set( $fail ), bws_set( $fail ) ) );

	WP_CLI::log( 'Logged-out user, user-context rule' );
	wp_set_current_user( 0 );
	$user_rule = bws_rule( 'bws_test_past', 'after', 'user' );
	bws_check( 'user rule -> hidden', false, array( bws_set( $user_rule ) ) );
	bws_check( 'user rule inverted -> visible', true, array( bws_set( $user_rule ) ), true );

	WP_CLI::log( 'Hide mode' );
	bws_check( 'passing set inverted -> hidden', false, array( bws_set( $pass ) ), true );
	bws_check( 'failing set inverted -> visible', true, array( bws_set( $fail ) ), true );

	// Rules that cannot be evaluated are skipped, and a set with no evaluated rules is skipped.
	$neutral_rules = array(
		'empty value'      => bws_rule( 'bws_test_empty', 'after' ),
		'unparseable date' => bws_rule( 'bws_test_bad', 'after' ),
		'missing field'    => bws_rule( '', 'after' ),
		'missing operator' => bws_rule( 'bws_test_past', '' ),
		'unknown operator' => bws_rule( 'bws_test_past', 'bogus' ),
		'field not found'  => bws_rule( 'bws_test_nonexistent', 'after' ),
	);
	foreach ( $neutral_rules as $name => $neutral ) {
		WP_CLI::log( "Neutral: $name" );
		bws_check( 'alone -> visible', true, array( bws_set( $neutral ) ) );
		bws_check( 'alone in hide mode -> visible', true, array( bws_set( $neutral ) ), true );
		bws_check( 'skipped set does not count as passing -> hidden', false, array( bws_set( $neutral ), bws_set( $fail ) ) );
		bws_check( 'skipped set is not inverted in hide mode -> visible', true, array( bws_set( $neutral ), bws_set( $fail ) ), true );
		bws_check( 'with a passing rule, only that rule counts -> visible', true, array( bws_set( $neutral, $pass ) ) );
		bws_check( 'with a failing rule, only that rule counts -> hidden', false, array( bws_set( $neutral, $fail ) ) );
	}
} finally {
	if ( $post_id ) {
		wp_delete_post( $post_id, true );
	}
	acf_remove_local_field_group( $group_key );
}

// eval-file runs in function scope, so the counters live in $GLOBALS for bws_check().
$failures = $GLOBALS['bws_failures'];
$checks   = $GLOBALS['bws_checks'];

if ( $failures ) {
	WP_CLI::log( "$failures of $checks checks failed." );
	exit( 1 );
}

WP_CLI::success( "$checks checks passed." );
