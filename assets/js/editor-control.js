/**
 * ACF Date/Time Control - Editor Component
 *
 * ACF fields are fetched via Block Visibility's REST API.
 *
 * @see block-visibility/includes/rest-api/controllers/class-block-visibility-rest-variables-controller.php
 *
 * @package bws-block-visibility-acf-datetime-extension
 * @since 1.0.0
 * @license GPL-2.0-or-later
 */

import ReactSelect from 'react-select';

( function() {
	if ( typeof wp === 'undefined' || ! wp.hooks || ! wp.element || ! wp.components ) {
		return;
	}

	/**
	 * Feature flag: Set to true to use react-select (Block Visibility style),
	 * or false to use WordPress SelectControl (fallback).
	 */
	const USE_REACT_SELECT = true;

	const { addFilter } = wp.hooks;
	const { __, sprintf } = wp.i18n;
	const { createElement: el, Fragment } = wp.element;
	const { SelectControl, ToggleControl, Button, DropdownMenu, MenuGroup, MenuItem, Fill, Disabled } = wp.components;
	const { SVG, Path } = wp.primitives;
	const { trash } = wp.icons || {};
	const { assign } = lodash;

	// Block Visibility icon definitions
	const plusIcon = el( SVG, { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24' },
		el( Path, { d: 'M11 12.5V17.5H12.5V12.5H17.5V11H12.5V6H11V11H6V12.5H11Z' } )
	);

	const moreVerticalIcon = el( SVG, { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24' },
		el( Path, { d: 'M13 19h-2v-2h2v2zm0-6h-2v-2h2v2zm0-6h-2V5h2v2z' } )
	);

	/**
	 * Custom dropdown indicator for react-select matching Block Visibility style.
	 *
	 * @return {Element} The dropdown indicator element.
	 */
	function CustomDropdownIndicator() {
		return el( 'div', {
				className: 'react-select__indicator react-select__dropdown-indicator',
				'aria-hidden': 'true'
			},
			el( 'svg', {
				width: '24',
				height: '24',
				viewBox: '0 0 24 24',
				fill: 'none',
				xmlns: 'http://www.w3.org/2000/svg',
				'aria-hidden': 'true',
				focusable: 'false'
			},
				el( 'path', {
					d: 'M16 10.8571L12 14L8 10.8571L8.65455 10L12 12.5714L15.2727 10L16 10.8571Z',
					fill: '#1e1e1e'
				} )
			)
		);
	}

	/**
	 * Render a select field using either react-select or WordPress SelectControl.
	 *
	 * @param {Object} props Field properties.
	 * @return {Element} The rendered field element.
	 */
	function renderSelectField( props ) {
		const { label, value, options, onChange, placeholder, fieldId, className, help, hasGroupedOptions } = props;

		if ( USE_REACT_SELECT ) {
			let selectOptions;
			let selectedOption = null;

			if ( hasGroupedOptions ) {
				// Options are already in grouped format: [{ label: 'Group', options: [...] }]
				selectOptions = options;

				// Find selected option within groups
				options.forEach( function( group ) {
					if ( group.options ) {
						const found = group.options.find( function( opt ) {
							return opt.value === value;
						} );
						if ( found ) {
							selectedOption = found;
						}
					}
				} );
			} else {
				// Convert flat options to react-select format
				selectOptions = options.map( function( opt ) {
					return { value: opt.value, label: opt.label };
				} );

				// Find selected option
				selectedOption = selectOptions.find( function( opt ) {
					return opt.value === value;
				} ) || null;
			}

			// Custom styles matching Block Visibility
			const customStyles = {
				control: function( base ) {
					return assign( {}, base, {
						minHeight: '40px',
						borderColor: '#757575'
					} );
				}
			};

			// Custom components to match Block Visibility style
			const customComponents = {
				DropdownIndicator: CustomDropdownIndicator,
				IndicatorSeparator: null // Remove separator
			};

			// Check if label should be visually hidden
			const hasVisuallyHiddenLabel = className && className.indexOf( 'has-visually-hidden-label' ) !== -1;
			const labelClassName = 'components-base-control__label' + ( hasVisuallyHiddenLabel ? ' screen-reader-text' : '' );

			return el( 'div', { className: 'components-base-control' },
				label && el( 'label', {
					className: labelClassName,
					htmlFor: fieldId,
					id: fieldId + '_label'
				}, label ),
				el( 'div', { className: 'block-visibility__react-select ' + ( className || '' ) },
					el( ReactSelect, {
						id: fieldId,
						inputId: fieldId + '_select',
						'aria-labelledby': fieldId + '_label',
						className: 'react-select-container',
						classNamePrefix: 'react-select',
						value: selectedOption,
						options: selectOptions,
						onChange: function( selectedOption ) {
							onChange( selectedOption ? selectedOption.value : '' );
						},
						placeholder: placeholder || __( 'Select…', 'bws-block-visibility-acf-datetime-extension' ),
						isClearable: false,
						styles: customStyles,
						components: customComponents
					} )
				),
				help && el( 'div', { className: 'control-fields-item__help for-select-component' }, help )
			);
		} else {
			// Fallback to WordPress SelectControl
			return el( SelectControl, {
				label: label,
				value: value,
				options: options,
				onChange: onChange,
				help: help
			} );
		}
	}

	/**
	 * Register control metadata.
	 */
	addFilter(
		'blockVisibility.controls',
		'bws/acf-datetime-control',
		function( controls ) {
			controls.push( {
				label: __( 'ACF Date/Time', 'bws-block-visibility-acf-datetime-extension' ),
				attributeSlug: 'acfDateTime',
				settingSlug: 'acf_date_time',
			} );
			return controls;
		}
	);

	/**
	 * ACF Date/Time Control Component.
	 */
	function AcfDateTimeControl( props ) {
		const { enabledControls, controlSetAtts, setControlAtts, variables } = props;

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
			setControlAtts( 'acfDateTime', assign( {}, acfDateTime, { ruleSets: newRuleSets } ) );
		};

		/**
		 * Update hideOnRuleSets toggle.
		 */
		const updateHideOnRuleSets = function( newValue ) {
			setControlAtts( 'acfDateTime', assign( {}, acfDateTime, { hideOnRuleSets: newValue } ) );
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
		 * Update individual rule.
		 */
		const updateRule = function( ruleSetIndex, ruleIndex, newRule ) {
			const newRuleSet = assign( {}, ruleSets[ ruleSetIndex ] );
			const newRules = ( newRuleSet.rules || [] ).slice();
			newRules[ ruleIndex ] = newRule;
			newRuleSet.rules = newRules;
			updateRuleSet( ruleSetIndex, newRuleSet );
		};

		/**
		 * Add new rule.
		 */
		const addRule = function( ruleSetIndex ) {
			const newRuleSet = assign( {}, ruleSets[ ruleSetIndex ] );
			newRuleSet.rules = ( newRuleSet.rules || [] ).concat( [ {} ] );
			updateRuleSet( ruleSetIndex, newRuleSet );
		};

		/**
		 * Remove rule.
		 */
		const removeRule = function( ruleSetIndex, ruleIndex ) {
			const newRuleSet = assign( {}, ruleSets[ ruleSetIndex ] );
			const newRules = ( newRuleSet.rules || [] ).filter( function( _, i ) {
				return i !== ruleIndex;
			} );
			newRuleSet.rules = newRules.length > 0 ? newRules : [ {} ];
			updateRuleSet( ruleSetIndex, newRuleSet );
		};

		return el( 'div', { className: 'controls-panel-item acf-datetime-control' },
			el( 'h3', { className: 'controls-panel-item__header' },
				el( 'span', null, __( 'ACF Date/Time', 'bws-block-visibility-acf-datetime-extension' ) ),
				el( 'div', { className: 'controls-panel-item__header-toolbar' },
					el( Button, {
						icon: plusIcon,
						onClick: addRuleSet,
						label: __( 'Add rule set', 'bws-block-visibility-acf-datetime-extension' ),
						size: 'small'
					} )
				)
			),
			el( 'div', { className: 'controls-panel-item__description' },
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
												icon: trash,
												onClick: function() {
													removeRule( ruleSetIndex, ruleIndex );
												}
											} )
										),
										el( 'div', { className: 'rule__fields' },
											el( 'div', { className: 'fields-container' },
												renderSelectField( {
													label: __( 'Comparison operator', 'bws-block-visibility-acf-datetime-extension' ),
													value: rule.operator || '',
													options: window.bwsAcfDateTimeConfig?.operators || [],
													onChange: function( operator ) {
														updateRule( ruleSetIndex, ruleIndex, assign( {}, rule, { operator: operator } ) );
													},
													placeholder: __( 'Select…', 'bws-block-visibility-acf-datetime-extension' ),
													fieldId: ruleSetIndex + '_' + ruleIndex + '_operator',
													className: 'field__operator has-visually-hidden-label'
												} ),
												hasOperator && renderSelectField( {
													label: __( 'Date/datetime field', 'bws-block-visibility-acf-datetime-extension' ),
													value: rule.field || '',
													options: groupedFieldOptions,
													onChange: function( field ) {
														updateRule( ruleSetIndex, ruleIndex, assign( {}, rule, { field: field } ) );
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
														updateRule( ruleSetIndex, ruleIndex, assign( {}, rule, { subField: subField } ) );
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
									__( 'Rule Set', 'bws-block-visibility-acf-datetime-extension' ) +
									( ruleSets.length > 1 ? ' ' + ( ruleSetIndex + 1 ) : '' )
								),
								el( 'div', { className: 'section-header__toolbar' },
									el( DropdownMenu, {
										icon: moreVerticalIcon,
										label: __( 'Options', 'bws-block-visibility-acf-datetime-extension' ),
										popoverProps: {
											focusOnMount: 'container',
											placement: 'left-start'
										}
									},
										function( props ) {
											const onClose = props.onClose;
											return el( Fragment, {},
												el( MenuGroup, { label: __( 'Tools', 'bws-block-visibility-acf-datetime-extension' ) },
													el( MenuItem, {
														onClick: function() {
															updateRuleSet( ruleSetIndex, assign( {}, ruleSet, { enable: ! ( ruleSet.enable !== false ) } ) );
														}
													},
														ruleSet.enable !== false
															? __( 'Disable', 'bws-block-visibility-acf-datetime-extension' )
															: __( 'Enable', 'bws-block-visibility-acf-datetime-extension' )
													)
												),
												ruleSets.length > 1 && el( MenuGroup, {},
													el( MenuItem, {
														onClick: function() {
															removeRuleSet( ruleSetIndex );
															onClose();
														}
													}, __( 'Remove rule set', 'bws-block-visibility-acf-datetime-extension' ) )
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
					el( Fill, { name: 'ControlSetControls-' + uniqueIndex },
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
		const options = [
			{ label: __( 'The current post', 'bws-block-visibility-acf-datetime-extension' ), value: 'post' }
		];

		// Add portal option as second option if portal system is available.
		if ( window.bwsAcfDateTimeConfig?.hasPortalSystem ) {
			options.push(
				{ label: __( 'The current portal', 'bws-block-visibility-acf-datetime-extension' ), value: 'portal' }
			);
		}

		// Add remaining options.
		options.push(
			{ label: __( 'The current user', 'bws-block-visibility-acf-datetime-extension' ), value: 'user' },
			{ label: __( 'An options page', 'bws-block-visibility-acf-datetime-extension' ), value: 'option' }
		);

		return options;
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
						const fieldWithGroup = assign( {}, field, {
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
