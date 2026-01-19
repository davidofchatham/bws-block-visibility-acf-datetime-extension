=== Block Visibility ACF Date-Time Extension by BWS ===
Contributors: bridgewebsolutions, davidofchatham
Tags: block visibility, acf, advanced custom fields, block editor, gutenberg
Requires at least: 6.5
Tested up to: 6.7
Requires PHP: 7.4
Stable tag: 0.7.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Extends Block Visibility with controls for showing/hiding blocks based on ACF date and datetime field values.

== Description ==

Block Visibility ACF Date-Time Extension adds powerful date and datetime comparison controls to the [Block Visibility](https://www.blockvisibilitywp.com/) plugin, allowing you to show or hide blocks based on Advanced Custom Fields (ACF) date and datetime picker field values.

= Key Features =

* **Date Comparison Operators**: before, beforeOrOn, after, onOrAfter
* **ACF Field Support**: Works with both ACF Date Picker and Date Time Picker fields
* **Multiple Field Contexts**: Supports post fields, user fields, and options page fields
* **Rule Sets**: Create complex visibility rules with AND/OR logic
* **Seamless Integration**: Matches Block Visibility's native UI and workflow

= Use Cases =

* Show event details only after registration opens
* Display countdown blocks before a deadline
* Hide expired promotions automatically
* Show user-specific content based on membership dates
* Display time-sensitive announcements

= How It Works =

1. Create or edit a block in the WordPress block editor
2. Open the Block Visibility panel
3. Enable the "ACF Date/Time" control
4. Select an ACF date or datetime field
5. Choose a comparison operator (before, after, etc.)
6. The block will automatically show/hide based on the current date/time

= Requirements =

* WordPress 6.5 or higher
* Block Visibility 3.0.0 or higher
* Advanced Custom Fields (free or PRO)
* At least one ACF Date Picker or Date Time Picker field

= About This Plugin =

Created by Claude.ai under the direction of David Mitchell ([Bridge Web Solutions](https://bridgewebsolutions.com)).

== Installation ==

1. Ensure you have Block Visibility 3.0.0+ and Advanced Custom Fields installed and activated
2. Upload the plugin files to `/wp-content/plugins/bws-block-visibility-acf-datetime-extension/`
3. Activate the plugin through the 'Plugins' menu in WordPress
4. The ACF Date/Time control will automatically appear in Block Visibility settings
5. Enable the control in Block Visibility > Settings > Visibility Controls

== Frequently Asked Questions ==

= What versions of Block Visibility are supported? =

This plugin requires Block Visibility 3.0.0 or higher.

= Does this work with ACF Free or only ACF PRO? =

It works with both ACF Free and ACF PRO. You just need the Date Picker or Date Time Picker field types.

= What date formats are supported? =

The plugin automatically detects ACF's storage formats:
* Date Picker fields: Ymd format (e.g., 20240115)
* Date Time Picker fields: Y-m-d H:i:s format (e.g., 2024-01-15 14:30:00)

The display format in your ACF field settings doesn't matter - only the storage format.

= Can I compare against a custom date instead of the current date? =

Not in version 1.0.0. Currently, all comparisons are made against the current date/time. Custom date comparisons may be added in a future release.

= Does this support ACF date range fields? =

Not currently. Only standard Date Picker and Date Time Picker fields are supported in version 1.0.0.

= What timezone is used for comparisons? =

The plugin uses Block Visibility's `create_date_time()` utility, which respects your WordPress timezone settings.

= Can I use multiple date field conditions? =

Yes! You can create multiple rule sets with AND/OR logic, just like other Block Visibility controls.

== Screenshots ==

1. ACF Date/Time control in the block editor
2. Field selector showing grouped ACF date fields
3. Operator selection dropdown
4. Rule sets configuration with multiple conditions

== Changelog ==

= 1.0.0 =
* Initial release
* Support for ACF Date Picker and Date Time Picker fields
* Four comparison operators: before, beforeOrOn, after, onOrAfter
* Support for post fields, user fields, and options page fields
* Rule sets with AND/OR logic
* Grouped field listings matching Block Visibility's UI
* Field type display for selected fields

== Upgrade Notice ==

= 1.0.0 =
Initial release of Block Visibility ACF Date-Time Extension.

== Development ==

This plugin was created by Claude.ai under the direction of David Mitchell at Bridge Web Solutions.

**GitHub Repository**: https://github.com/davidofchatham/bws-block-visibility-acf-datetime-extension

**Built With**:
* WordPress Scripts (@wordpress/scripts)
* React-Select for field dropdowns
* Block Visibility filter system

== Credits ==

* **Created by**: Claude.ai (Anthropic)
* **Directed by**: David Mitchell, Bridge Web Solutions
* **Built for**: Block Visibility by Nick Diego
