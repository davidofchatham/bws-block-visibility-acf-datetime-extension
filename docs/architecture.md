# Architecture

How the plugin works and why it is shaped this way. Each section states the rule and, where a real fork was decided, lists what was **Rejected** and why. Cite a section here instead of a spec coordinate; specs are mutable, these anchors are living.

## Overview

The plugin extends [Block Visibility](https://www.blockvisibilitywp.com/) (BV) with an `acf_date_time` control: show or hide a block depending on whether an ACF date or datetime field is before, after, or equal to the current date and time. Editor UI is a compiled React control; the frontend test is a PHP filter callback.

```
bws-block-visibility-acf-datetime-extension/
├── bws-block-visibility-acf-datetime-extension.php  # Main plugin file
├── includes/
│   ├── class-acf-date-time-control.php  # Enqueues editor assets, passes operator config to JS
│   ├── settings-integration.php         # Registers the control in BV's settings schema
│   └── frontend/visibility-test.php     # Frontend visibility evaluation
├── assets/js/editor-control.js          # Editor UI (source)
├── assets/js/settings-panel.js          # BV settings-page panel (source)
└── build/                               # Compiled editor + settings scripts and asset manifests
```

- **Main plugin file:** checks dependencies (BV 3.0+, ACF), defines constants, initializes at priority 20 so it runs after BV at priority 10.
- **Control class:** enqueues the editor script (and the settings-panel script on BV's settings screen) and provides the operators `before`, `beforeOrOn`, `after`, `onOrAfter`.
- **Settings integration:** registers `acf_date_time` through the `block_visibility_settings` and `block_visibility_settings_defaults` filters, default enabled.
- **Frontend test:** namespace `BWS\ACFDateTime`, hooked to `block_visibility_control_set_is_block_visible` at priority 15. The control class requires it directly in its non-admin branch, so it is loaded on REST requests too, where BV also filters `render_block`. BV utilities come in through `use function`, which resolves at call time, so load order against BV does not matter.

**Rejected: deferring the frontend test to the `wp` hook.** Earlier versions did this so BV utilities were loaded first. `wp` never fires on REST requests, so blocks rendered through REST (for example `content.rendered`) ignored their rules.

## Block Visibility integration

The plugin uses only BV's documented filters; nothing patches BV.

- **Editor metadata:** the `blockVisibility.controls` filter pushes `{ label: 'ACF Date & Time', type: 'integration', icon, attributeSlug: 'acfDateTime', settingSlug: 'acf_date_time' }`. `type: 'integration'` makes BV list the control under "Integrations" in the editor menu; `icon` (`calendar` from `@wordpress/icons`) is rendered next to it.
- **Integration active flag:** BV drops any integration control unless `variables.integrations[ settingSlug ].active` is truthy, so PHP filters `block_visibility_rest_variables` to set `integrations.acf_date_time.active` to `function_exists( 'acf' )`. Both halves are required: without the flag the control vanishes from the editor menu and from the settings page's default controls list.
- **Editor UI:** the `blockVisibility.addControlSetControls` filter adds the component.
- **Settings schema:** PHP registers `acf_date_time` under `visibility_controls`. The schema key must match the JS `settingSlug` exactly, or the control disappears from BV's settings.
- **Settings panel:** `assets/js/settings-panel.js` adds an "ACF Date & Time" panel with an enable toggle (`visibility_controls.acf_date_time.enable`, default on) to Settings → Block Visibility → Visibility Controls → Integrations, modeled on BV's own ACF panel. The `Slot` BV renders there (`VisibilityControlsIntegrations`) passes no props to fills, so the script wraps the `blockVisibility.VisibilityControls` component via `addFilter`, which does receive `variables`, `visibilityControls` and `setVisibilityControls`, and renders the panel in a `Fill` from there. The panel renders only while `variables.integrations.acf_date_time.active` is true, the same flag as above. Turning the toggle off makes BV's `getEnabledControls` drop the control from the editor menu, and the frontend test already honors it. The control class enqueues the script from `admin_enqueue_scripts` only when `$_GET['page']` is `block-visibility-settings`, the same check BV uses for its own settings assets. `npm run build` compiles both scripts.
- **Frontend:** the test callback must check `is_control_enabled()` before evaluating.
- **Default Visibility Controls:** the control shows up in BV's "Default Visibility Controls" list automatically because `settingSlug` matches the PHP schema. That list picks which controls new blocks start with; the global on/off switch is the settings panel above.
- **REST:** the editor reads ACF fields from BV's `/wp-json/block-visibility/v1/variables` (`variables.integrations.acf`) and filters to `date_picker` and `date_time_picker`.
- **BV utility used:** `is_control_enabled()`.

**Rejected: positioning the control under "Integrations" via `category: 'integrations'`.** v0.8.0 tried it, plus a `settingSlug` prefixed with `integrations`, plus different filter priorities. None moved the control, and the prefixed slug broke the settings integration. BV splits its menu on `type: 'integration'`, not `category`; see the integration active flag above.

## Editor control

- `@wordpress/*` imports (hooks, i18n, element, components, primitives) instead of `wp.*` globals; `wp-scripts` dependency extraction turns them into `wp-*` script handles in `build/editor-control.asset.php`, so WordPress loads them before the control. `createElement` with no JSX, `Object.assign` for merging. Icons are custom SVG elements built from `@wordpress/primitives`, defined at the top of the file.
- **Field selector:** fields are grouped by ACF Field Group with the group name as the section heading, matching BV's native ACF control. Only date and datetime fields are shown. After selection, the field type appears below the selector ("Field type: Date Picker") using BV's `.control-fields-item__help` styling.
- **UI implementation flag:** `USE_REACT_SELECT` in `assets/js/editor-control.js` picks the select implementation. `true` uses `react-select` with `.block-visibility__react-select` classes and matches BV exactly (~90KB bundle). `false` uses WordPress `SelectControl` (~5.5KB, standard admin styling). Production ships `true`. Rebuild after changing it.

**Rejected: `closeSmall` from `wp.icons` for the delete-rule button.** It does not exist there and the button rendered blank. The button uses a custom SVG with BV's exact path data. Do not assume `wp.icons` has an icon; verify or draw one.

## Rule sets

A control holds one or more rule sets; each rule set holds one or more rules.

```javascript
{
	controls: {
		acfDateTime: {
			ruleSets: [
				{
					enable: true,
					rules: [
						{
							field: 'field_abc123',  // ACF field key
							subField: 'post',       // 'post' | 'user' | 'option'
							operator: 'before'      // 'before' | 'beforeOrOn' | 'after' | 'onOrAfter'
						}
					]
				}
			],
			hideOnRuleSets: false
		}
	}
}
```

Settings schema: `visibility_controls.acf_date_time.enable` (boolean).

- **Operations:** `addRuleSet()` adds an empty set with one blank rule. `removeRuleSet(index)` keeps at least one set. `duplicateRuleSet(index)` deep-copies every rule, always enables the copy, and inserts it at `index + 1`. `updateRuleSet(index, newRuleSet)` replaces one set.
- **Hamburger menu**, matching BV's native pattern: a "Tools" MenuGroup (Enable/Disable, Duplicate) and a separate unlabeled MenuGroup for the destructive item. That item reads "Clear rule set" when only one set exists (resets it to empty) and "Remove rule set" when several exist. Close the dropdown with `onClose()` after each action.
- **Enable means participates.** A disabled set is ignored entirely. It never hides a block.

**Rejected: evaluating disabled rule sets.** The first implementation still processed them, so a disabled set could hide a block. The frontend now skips them in the loop, and returns visible when no enabled set remains.

## Frontend evaluation

`acf_datetime_test( $is_visible, $settings, $controls )`:

1. Return early if the control is disabled in settings.
2. For each enabled rule set, evaluate each rule and combine with **AND**.
3. Combine rule set results with **OR**.
4. Return visible when there are no enabled rule sets (empty results).

A rule that cannot be evaluated is neutral: it is skipped and pushes no result. That covers a missing field or operator, a field that is not found, an empty value, an unparseable date, an unknown operator, and an unsupported field type. A rule set whose rules are all skipped is skipped too, so hide-mode inversion never applies to it and an empty date no longer hides the block. When every set is skipped, step 4 returns visible.

### Field context

`subField` selects where the value comes from:

- `'post'`, current post: `get_field_object( $field )`. Any other value, including the legacy `'true'`, also falls through to the current post.
- `'user'`, current user: `get_field_object( $field, 'user_' . $user_id )`. When nobody is logged in the rule is hidden (inverted in hide mode), matching Block Visibility.
- `'option'`, options page: `get_field_object( $field, 'option' )`

### Date parsing

- **Date Picker (`date_picker`):** stored as `Ymd` (`20240115`); compared at midnight for a date-only comparison.
- **Date Time Picker (`date_time_picker`):** stored as `Y-m-d H:i:s` (`2024-01-15 14:30:00`); compared with full datetime.
- **Timezone:** `wp_timezone()`, so field values and the current time compare in the site's timezone.

## Plugin updates

An installed copy updates itself from GitHub releases through [plugin-update-checker](https://github.com/YahnisElsts/plugin-update-checker) 5.7, so live sites need a manual install only once.

- **Vendored in `libs/plugin-update-checker/`:** unmodified 5.7 copy, no Composer. `package.json` `files` includes `libs/` in the zip; `wp-scripts plugin-zip` would otherwise leave it out.
- **Wired before the dependency returns:** the main plugin file builds the checker right after the `ABSPATH` guard, ahead of the Block Visibility and ACF checks, so updates still arrive when a dependency is missing or too old.
- **Release assets:** `enableReleaseAssets()` with a regex matches `bws-block-visibility-acf-datetime-extension-<version>.zip`, the zip attached to each GitHub release, instead of the branch tip or the auto-generated source archive (whose folder name carries the tag). No token; the repo is public.
- **Slug:** must equal the installed plugin folder name.

## References

- [Block Visibility documentation](https://www.blockvisibilitywp.com/knowledge-base/)
- [Block Visibility on GitHub](https://github.com/ndiego/block-visibility)
- [ACF field types](https://www.advancedcustomfields.com/resources/)
- [WordPress Plugin Handbook](https://developer.wordpress.org/plugins/)
