/**
 * ACF Date/Datetime Control - Editor Component
 *
 * ACF fields are fetched via Block Visibility's REST API.
 *
 * @see block-visibility/includes/rest-api/controllers/class-block-visibility-rest-variables-controller.php
 *
 * @package bws-block-visibility-acf-datetime-extension
 * @since 1.0.0
 * @license GPL-2.0-or-later
 */

import ReactSelect, { components as selectComponents } from 'react-select';
import { addFilter } from '@wordpress/hooks';
import { __, sprintf } from '@wordpress/i18n';
import { createElement as el, Fragment } from '@wordpress/element';
import { ToggleControl, TextControl, Button, DropdownMenu, MenuGroup, MenuItem, Fill, Disabled } from '@wordpress/components';
import { SVG, Path } from '@wordpress/primitives';
import { Icon, calendar, closeSmall, info, moreVertical, pencil, plus } from '@wordpress/icons';
import './register-control';

( function() {
	// BV's chevron (block-visibility/src/utils/icons.js); not in @wordpress/icons.
	const chevronDown = el( SVG, { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', xmlns: 'http://www.w3.org/2000/svg' },
		el( Path, { d: 'M16 10.8571L12 14L8 10.8571L8.65455 10L12 12.5714L15.2727 10L16 10.8571Z', fill: '#1e1e1e' } )
	);

	/**
	 * Dropdown indicator matching BV's react-select-utils.js.
	 *
	 * @param {Object} props react-select indicator props.
	 * @return {Element} The dropdown indicator element.
	 */
	function DropdownIndicator( props ) {
		return el( selectComponents.DropdownIndicator, props, chevronDown );
	}

	/**
	 * Render a react-select field with the same markup as BV's RuleField, so BV's editor styles apply.
	 *
	 * @param {Object} props Field properties.
	 * @return {Element} The rendered field element.
	 */
	function renderSelectField( props ) {
		const { label, value, options, onChange, placeholder, fieldId, className, help, hasGroupedOptions } = props;
		const flatOptions = hasGroupedOptions
			? options.reduce( function( all, group ) {
				return all.concat( group.options || [] );
			}, [] )
			: options;
		const selectedOption = flatOptions.find( function( opt ) {
			return opt.value === value;
		} ) || null;

		return el( Fragment, {},
			label && el( 'label', {
				id: fieldId + '_label',
				htmlFor: fieldId + '_select',
				className: 'field__label'
			}, label ),
			el( ReactSelect, {
				'aria-labelledby': label ? fieldId + '_label' : undefined,
				'aria-label': label ? undefined : props.ariaLabel,
				inputId: fieldId + '_select',
				components: { DropdownIndicator: DropdownIndicator, IndicatorSeparator: function() {
					return null;
				} },
				className: 'block-visibility__react-select ' + className,
				classNamePrefix: 'react-select',
				value: selectedOption,
				options: options,
				placeholder: placeholder || __( 'Select…', 'bws-block-visibility-acf-datetime-extension' ),
				onChange: function( option ) {
					onChange( option ? option.value : '' );
				}
			} ),
			help && el( 'div', { className: 'control-fields-item__help for-select-component' }, help )
		);
	}

	/**
	 * Info popover matching BV's InformationPopover component (not exported by BV).
	 *
	 * @param {string} message Popover text.
	 * @return {Element} The popover element.
	 */
	function InformationPopover( message ) {
		return el( 'div', { className: 'information-popover' },
			el( DropdownMenu, {
				label: __( 'More Information', 'bws-block-visibility-acf-datetime-extension' ),
				icon: info,
				toggleProps: { className: 'information-popover__button' },
				popoverProps: {
					className: 'information-popover__popover',
					focusOnMount: 'container',
					position: 'bottom right',
					noArrow: false
				}
			}, function() {
				return el( 'p', null, message );
			} )
		);
	}

	/**
	 * ACF Date/Datetime Control Component.
	 */
	function AcfDateTimeControl( props ) {
		const { enabledControls, controlSetAtts, setControlAtts, settings, variables } = props;
		const enableNotices = settings?.plugin_settings?.enable_editor_notices ?? true;

		const controlActive = enabledControls.some(
			function( control ) {
				return control.settingSlug === 'acf_date_time' && control.isActive;
			}
		);

		if ( ! controlActive ) {
			return null;
		}

		const acfActive = variables?.integrations?.acf?.active;
		const acfFields = variables?.integrations?.acf?.fields || [];

		if ( ! acfActive ) {
			return null;
		}

		// Filter to date/datetime fields only.
		const dateFieldsData = filterDateFields( acfFields );
		const dateFieldGroups = dateFieldsData.groups;
		const flatDateFields = dateFieldsData.flatFields;

		if ( flatDateFields.length === 0 ) {
			return null;
		}

		// Get grouped field options for react-select.
		const groupedFieldOptions = getGroupedFieldOptions( dateFieldGroups );

		// Get current control data.
		const acfDateTime = controlSetAtts?.controls?.acfDateTime || {};
		const ruleSets = acfDateTime.ruleSets || [ { enable: true, rules: [ {} ] } ];
		const hideOnRuleSets = acfDateTime.hideOnRuleSets || false;

		/**
		 * Update rule sets.
		 */
		const updateRuleSets = function( newRuleSets ) {
			setControlAtts( 'acfDateTime', Object.assign( {}, acfDateTime, { ruleSets: newRuleSets } ) );
		};

		/**
		 * Update hideOnRuleSets toggle.
		 */
		const updateHideOnRuleSets = function( newValue ) {
			setControlAtts( 'acfDateTime', Object.assign( {}, acfDateTime, { hideOnRuleSets: newValue } ) );
		};

		/**
		 * Update individual rule set.
		 */
		const updateRuleSet = function( index, newRuleSet ) {
			const newRuleSets = ruleSets.slice();
			newRuleSets[ index ] = newRuleSet;
			updateRuleSets( newRuleSets );
		};

		/**
		 * Add new rule set.
		 */
		const addRuleSet = function() {
			updateRuleSets( ruleSets.concat( [ { enable: true, rules: [ {} ] } ] ) );
		};

		/**
		 * Remove rule set.
		 */
		const removeRuleSet = function( index ) {
			const newRuleSets = ruleSets.filter( function( _, i ) {
				return i !== index;
			} );
			updateRuleSets( newRuleSets.length > 0 ? newRuleSets : [ { enable: true, rules: [ {} ] } ] );
		};

		/**
		 * Duplicate rule set.
		 */
		const duplicateRuleSet = function( index ) {
			const originalRuleSet = ruleSets[ index ];
			const duplicatedRuleSet = Object.assign( {}, originalRuleSet, {
				enable: true,
				rules: ( originalRuleSet.rules || [] ).map( function( rule ) {
					return Object.assign( {}, rule );
				} )
			} );
			const newRuleSets = ruleSets.slice();
			newRuleSets.splice( index + 1, 0, duplicatedRuleSet );
			updateRuleSets( newRuleSets );
		};

		/**
		 * Update individual rule.
		 */
		const updateRule = function( ruleSetIndex, ruleIndex, newRule ) {
			const newRuleSet = Object.assign( {}, ruleSets[ ruleSetIndex ] );
			const newRules = ( newRuleSet.rules || [] ).slice();
			newRules[ ruleIndex ] = newRule;
			newRuleSet.rules = newRules;
			updateRuleSet( ruleSetIndex, newRuleSet );
		};

		/**
		 * Add new rule.
		 */
		const addRule = function( ruleSetIndex ) {
			const newRuleSet = Object.assign( {}, ruleSets[ ruleSetIndex ] );
			newRuleSet.rules = ( newRuleSet.rules || [] ).concat( [ {} ] );
			updateRuleSet( ruleSetIndex, newRuleSet );
		};

		/**
		 * Remove rule.
		 */
		const removeRule = function( ruleSetIndex, ruleIndex ) {
			const newRuleSet = Object.assign( {}, ruleSets[ ruleSetIndex ] );
			const newRules = ( newRuleSet.rules || [] ).filter( function( _, i ) {
				return i !== ruleIndex;
			} );
			newRuleSet.rules = newRules.length > 0 ? newRules : [ {} ];
			updateRuleSet( ruleSetIndex, newRuleSet );
		};

		return el( 'div', { className: 'controls-panel-item acf-datetime-control' },
			el( 'h3', { className: 'controls-panel-item__header has-icon' },
				el( Icon, { icon: calendar } ),
				el( 'span', null, __( 'ACF Date/Time', 'bws-block-visibility-acf-datetime-extension' ) ),
				enableNotices && InformationPopover(
					__( 'The Advanced Custom Fields Date/Time control shows or hides the block by comparing the current date and time with an ACF date or date/time field.', 'bws-block-visibility-acf-datetime-extension' )
				),
				el( 'div', { className: 'controls-panel-item__header-toolbar' },
					el( Button, {
						icon: plus,
						onClick: addRuleSet,
						label: __( 'Add rule set', 'bws-block-visibility-acf-datetime-extension' ),
						size: 'small'
					} )
				)
			),
			enableNotices && el( 'div', { className: 'controls-panel-item__description' },
				sprintf(
					// Translators: Whether the block is hidden or visible.
					__( '%s the block if any rule set applies. Rules associated with users will fail if the current user is not logged in.', 'bws-block-visibility-acf-datetime-extension' ),
					hideOnRuleSets ? __( 'Hide', 'bws-block-visibility-acf-datetime-extension' ) : __( 'Show', 'bws-block-visibility-acf-datetime-extension' )
				)
			),
			el( 'div', { className: 'controls-panel-item__control-fields' },
				el( 'div', { className: 'rule-sets' },
					ruleSets.map( function( ruleSet, ruleSetIndex ) {
						const isEnabled = ruleSet.enable !== false;

						const ruleSetContent = el( 'div', { className: 'rule-set__fields' },
							el( 'div', { className: 'rule-set__rules' },
								( ruleSet.rules || [] ).map( function( rule, ruleIndex ) {
									const hasOperator = rule.operator && rule.operator !== '';
									const hasField = rule.field && rule.field !== '';
									// Check for subField value or default
									const subFieldValue = rule.subField || 'post';

									// Get selected field object for field type display
									const selectedField = hasField ? findFieldByKey( flatDateFields, rule.field ) : null;
									const fieldTypeHelp = selectedField
										? sprintf(
											__( 'Field type: %s', 'bws-block-visibility-acf-datetime-extension' ),
											getFieldTypeLabel( selectedField.type )
										)
										: null;

									// Generate rule label
									const ruleLabel = ruleSetIndex === 0 && ruleIndex === 0
										? ( hideOnRuleSets ? __( 'Hide', 'bws-block-visibility-acf-datetime-extension' ) : __( 'Show', 'bws-block-visibility-acf-datetime-extension' ) ) + ' ' + __( 'the block if current date and time is', 'bws-block-visibility-acf-datetime-extension' )
										: __( 'And if current date and time is', 'bws-block-visibility-acf-datetime-extension' );

									return el( 'div', {
											key: ruleIndex,
											className: 'rule'
										},
										el( 'div', { className: 'rule__header' },
											el( 'span', null, ruleLabel ),
											( ruleSet.rules || [] ).length > 1 && el( Button, {
												label: __( 'Delete Rule', 'bws-block-visibility-acf-datetime-extension' ),
												icon: closeSmall,
												onClick: function() {
													removeRule( ruleSetIndex, ruleIndex );
												}
											} )
										),
										el( 'div', { className: 'rule__fields' },
											el( 'div', { className: 'fields-container' },
												renderSelectField( {
													ariaLabel: __( 'Comparison operator', 'bws-block-visibility-acf-datetime-extension' ),
													value: rule.operator || '',
													options: window.bwsAcfDateTimeConfig?.operators || [],
													onChange: function( operator ) {
														updateRule( ruleSetIndex, ruleIndex, Object.assign( {}, rule, { operator: operator } ) );
													},
													placeholder: __( 'Select…', 'bws-block-visibility-acf-datetime-extension' ),
													fieldId: ruleSetIndex + '_' + ruleIndex + '_operator',
													className: 'field__operatorField'
												} ),
												hasOperator && renderSelectField( {
													label: __( 'Date/datetime field', 'bws-block-visibility-acf-datetime-extension' ),
													value: rule.field || '',
													options: groupedFieldOptions,
													onChange: function( field ) {
														updateRule( ruleSetIndex, ruleIndex, Object.assign( {}, rule, { field: field } ) );
													},
													placeholder: __( 'Select Field…', 'bws-block-visibility-acf-datetime-extension' ),
													fieldId: ruleSetIndex + '_' + ruleIndex + '_field',
													className: 'field__ruleField',
													help: fieldTypeHelp,
													hasGroupedOptions: true
												} ),
												hasOperator && renderSelectField( {
													label: __( 'This field is associated with', 'bws-block-visibility-acf-datetime-extension' ),
													value: rule.subField || 'post',
													options: getSubFieldOptions(),
													onChange: function( subField ) {
														updateRule( ruleSetIndex, ruleIndex, Object.assign( {}, rule, { subField: subField } ) );
													},
													placeholder: __( 'Select Context…', 'bws-block-visibility-acf-datetime-extension' ),
													fieldId: ruleSetIndex + '_' + ruleIndex + '_subField',
													className: 'field__subField'
												} )
											)
										)
									);
								} )
							),
							el( 'div', { className: 'rule-set__add-rule' },
								el( Button, {
									isLink: true,
									onClick: function() {
										addRule( ruleSetIndex );
									}
								}, __( 'Add rule', 'bws-block-visibility-acf-datetime-extension' ) )
							)
						);

						return el( 'div', {
								key: ruleSetIndex,
								className: 'rule-sets__rule-set' + ( isEnabled ? '' : ' disabled' )
							},
							el( 'div', { className: 'rule-set__header section-header' },
								el( 'div', { className: 'section-header__title' },
									el( 'span', null, ruleSet.title || __( 'Rule Set', 'bws-block-visibility-acf-datetime-extension' ) ),
									el( DropdownMenu, {
										label: __( 'Edit', 'bws-block-visibility-acf-datetime-extension' ),
										icon: pencil,
										popoverProps: {
											className: 'block-visibility__control-popover edit-title',
											focusOnMount: 'container',
											placement: 'left-start',
											offset: 94
										}
									}, function() {
										return el( TextControl, {
											value: ruleSet.title || '',
											label: __( 'Rule set title', 'bws-block-visibility-acf-datetime-extension' ),
											placeholder: __( 'Rule Set', 'bws-block-visibility-acf-datetime-extension' ),
											onChange: function( title ) {
												updateRuleSet( ruleSetIndex, Object.assign( {}, ruleSet, { title: title } ) );
											}
										} );
									} )
								),
								el( 'div', { className: 'section-header__toolbar' },
									el( DropdownMenu, {
										className: 'options-dropdown',
										icon: moreVertical,
										label: __( 'Options', 'bws-block-visibility-acf-datetime-extension' ),
										popoverProps: {
											focusOnMount: 'container',
											placement: 'left-start',
											offset: 259
										}
									},
										function( props ) {
											const onClose = props.onClose;
											return el( Fragment, {},
												el( MenuGroup, { label: __( 'Tools', 'bws-block-visibility-acf-datetime-extension' ) },
													el( MenuItem, {
														onClick: function() {
															updateRuleSet( ruleSetIndex, Object.assign( {}, ruleSet, { enable: ! ( ruleSet.enable !== false ) } ) );
														}
													},
														ruleSet.enable !== false
															? __( 'Disable', 'bws-block-visibility-acf-datetime-extension' )
															: __( 'Enable', 'bws-block-visibility-acf-datetime-extension' )
													),
													el( MenuItem, {
														onClick: function() {
															duplicateRuleSet( ruleSetIndex );
															onClose();
														}
													}, __( 'Duplicate', 'bws-block-visibility-acf-datetime-extension' ) )
												),
												el( MenuGroup, {},
													el( MenuItem, {
														onClick: function() {
															removeRuleSet( ruleSetIndex );
															onClose();
														}
													}, ruleSets.length > 1
														? __( 'Remove rule set', 'bws-block-visibility-acf-datetime-extension' )
														: __( 'Clear rule set', 'bws-block-visibility-acf-datetime-extension' )
													)
												)
											);
										}
									)
								)
							),
							isEnabled ? ruleSetContent : el( Disabled, null, ruleSetContent )
						);
					} )
				),
				el( 'div', { className: 'control-fields-item__hide-when' },
					el( ToggleControl, {
						label: __( 'Hide when rules apply', 'bws-block-visibility-acf-datetime-extension' ),
						checked: hideOnRuleSets,
						onChange: updateHideOnRuleSets
					} )
				)
			)
		);
	}

	/**
	 * Add control to inspector.
	 */
	addFilter(
		'blockVisibility.addControlSetControls',
		'bws/acf-datetime-control-ui',
		function( ControlSetControls ) {
			return function( props ) {
				const { uniqueIndex } = props;

				return el( Fragment, {},
					el( ControlSetControls, props ),
					el( Fill, { name: 'ControlSetControlsIntegrations-' + uniqueIndex },
						el( AcfDateTimeControl, props )
					)
				);
			};
		},
		15
	);

	/**
	 * Get sub-field (context) options.
	 *
	 * @return {Array} Options array for SelectControl.
	 */
	function getSubFieldOptions() {
		return [
			{ label: __( 'The current post', 'bws-block-visibility-acf-datetime-extension' ), value: 'post' },
			{ label: __( 'The current user', 'bws-block-visibility-acf-datetime-extension' ), value: 'user' },
			{ label: __( 'An options page', 'bws-block-visibility-acf-datetime-extension' ), value: 'option' }
		];
	}

	/**
	 * Filter ACF fields to only date/datetime types, preserving group structure.
	 *
	 * @param {Array} acfFields ACF field groups from BV REST API.
	 * @return {Object} Object with groups array and flat fields array.
	 */
	function filterDateFields( acfFields ) {
		const groups = [];
		const flatFields = [];

		acfFields.forEach( function( group ) {
			if ( group.fields ) {
				const dateFieldsInGroup = [];

				group.fields.forEach( function( field ) {
					if ( field.type === 'date_picker' || field.type === 'date_time_picker' ) {
						const fieldWithGroup = Object.assign( {}, field, {
							groupTitle: group.title,
							groupKey: group.key
						} );
						dateFieldsInGroup.push( fieldWithGroup );
						flatFields.push( fieldWithGroup );
					}
				} );

				if ( dateFieldsInGroup.length > 0 ) {
					groups.push( {
						key: group.key,
						title: group.title,
						fields: dateFieldsInGroup
					} );
				}
			}
		} );

		return { groups: groups, flatFields: flatFields };
	}

	/**
	 * Get grouped field options for react-select.
	 *
	 * @param {Array} groups Field groups with filtered date/datetime fields.
	 * @return {Array} Grouped options array for react-select.
	 */
	function getGroupedFieldOptions( groups ) {
		return groups.map( function( group ) {
			return {
				label: group.title,
				options: group.fields.map( function( field ) {
					return {
						value: field.key,
						label: field.label
					};
				} )
			};
		} );
	}

	/**
	 * Get field type label for display.
	 *
	 * @param {string} fieldType ACF field type.
	 * @return {string} Human-readable field type label.
	 */
	function getFieldTypeLabel( fieldType ) {
		if ( fieldType === 'date_picker' ) {
			return __( 'Date Picker', 'bws-block-visibility-acf-datetime-extension' );
		} else if ( fieldType === 'date_time_picker' ) {
			return __( 'Date Time Picker', 'bws-block-visibility-acf-datetime-extension' );
		}
		return fieldType;
	}

	/**
	 * Find field by key in flat fields array.
	 *
	 * @param {Array} flatFields Flat array of all fields.
	 * @param {string} fieldKey Field key to find.
	 * @return {Object|null} Field object or null.
	 */
	function findFieldByKey( flatFields, fieldKey ) {
		return flatFields.find( function( field ) {
			return field.key === fieldKey;
		} ) || null;
	}
} )();
