# Block Visibility ACF Date-Time Extension

Extends [Block Visibility](https://www.blockvisibilitywp.com/) with controls for showing/hiding blocks based on Advanced Custom Fields (ACF) date and datetime field values.

**Created by Claude.ai under the direction of David Mitchell ([Bridge Web Solutions](https://bridgewebsolutions.com))**

## Features

- **Date Comparison Operators**: `before`, `beforeOrOn`, `after`, `onOrAfter`
- **ACF Field Support**: Works with both ACF Date Picker and Date Time Picker fields
- **Multiple Field Contexts**: Supports post fields, user fields, and options page fields
- **Rule Sets**: Create complex visibility rules with AND/OR logic
- **Seamless Integration**: Matches Block Visibility's native UI and workflow
- **Grouped Field Listings**: ACF fields organized by Field Group for easy selection
- **Field Type Display**: Shows whether a field is Date Picker or Date Time Picker

## Requirements

- WordPress 6.5+
- PHP 7.4+
- [Block Visibility](https://wordpress.org/plugins/block-visibility/) 3.0.0+
- [Advanced Custom Fields](https://wordpress.org/plugins/advanced-custom-fields/) (Free or PRO)
- At least one ACF Date Picker or Date Time Picker field

## Installation

### For Users

1. Ensure you have Block Visibility 3.0.0+ and Advanced Custom Fields installed and activated
2. Download the latest release from the [releases page](https://github.com/davidofchatham/bws-block-visibility-acf-datetime-extension/releases)
3. Upload the plugin files to `/wp-content/plugins/bws-block-visibility-acf-datetime-extension/`
4. Activate the plugin through the 'Plugins' menu in WordPress
5. Enable the ACF Date/Time control in Block Visibility > Settings > Visibility Controls

### For Developers

1. Clone this repository:
   ```bash
   git clone https://github.com/davidofchatham/bws-block-visibility-acf-datetime-extension.git
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the plugin:
   ```bash
   npm run build
   ```

4. Activate the plugin in WordPress

## Usage

1. Create or edit a block in the WordPress block editor
2. Open the Block Visibility panel in the block settings sidebar
3. Enable the "ACF Date/Time" control
4. Configure your visibility rules:
   - Select an ACF date or datetime field from the dropdown
   - Choose the field context (Current Post, Current User, or Options Page)
   - Select a comparison operator
   - Add multiple rules and rule sets as needed
5. Save your block

The block will now automatically show or hide based on whether the ACF field value meets your conditions compared to the current date/time.

## Use Cases

- **Event Management**: Show event details only after registration opens
- **Time-Limited Content**: Display countdown blocks before a deadline
- **Automated Cleanup**: Hide expired promotions automatically
- **User-Specific Content**: Show content based on user membership dates
- **Announcements**: Display time-sensitive announcements

## Development

### Build Commands

- `npm run build` - Production build
- `npm run start` - Development mode with watch
- `npm run package` - Create distributable zip file

### File Structure

```
bws-block-visibility-acf-datetime-extension/
├── assets/
│   └── js/
│       └── editor-control.js          # Editor UI component (source)
├── build/
│   ├── editor-control.js              # Compiled editor script
│   └── editor-control.asset.php       # Asset dependencies
├── includes/
│   ├── class-acf-date-time-control.php     # Main control class
│   ├── settings-integration.php            # Settings registration
│   └── frontend/
│       └── visibility-test.php             # Frontend visibility logic
├── bws-block-visibility-acf-datetime-extension.php  # Main plugin file
├── package.json
├── README.md
└── readme.txt
```

### Architecture

This plugin integrates with Block Visibility using its filter-based extension system:

1. **Settings Registration** (`includes/settings-integration.php`):
   - Registers `acf_date_time` control in Block Visibility settings
   - Uses `block_visibility_settings` and `block_visibility_settings_defaults` filters

2. **Editor Control** (`assets/js/editor-control.js`):
   - Registers control metadata via `blockVisibility.controls` filter
   - Adds UI component via `blockVisibility.addControlSetControls` filter
   - Filters ACF fields to show only date/datetime types
   - Provides field selection with grouped listings

3. **Frontend Visibility Test** (`includes/frontend/visibility-test.php`):
   - Hooks into `block_visibility_control_set_is_block_visible` filter
   - Evaluates ACF field values against current date/time
   - Supports AND/OR logic for rule sets

### Date Handling

**ACF Date Picker** (`date_picker`):
- Storage format: `Ymd` (e.g., `20240115`)
- Compared at midnight (00:00:00) for date-only comparisons

**ACF Date Time Picker** (`date_time_picker`):
- Storage format: `Y-m-d H:i:s` (e.g., `2024-01-15 14:30:00`)
- Full datetime comparison

**Timezone**: Uses Block Visibility's `create_date_time()` utility for timezone consistency with WordPress settings.

### UI Implementation Toggle

The editor control supports two UI implementations:

**React-Select** (default - matches Block Visibility exactly):
- Bundle size: ~90KB
- Exact visual match to Block Visibility

**WordPress SelectControl** (fallback):
- Bundle size: ~5.5KB
- Standard WordPress admin styling

Toggle in `assets/js/editor-control.js`:
```javascript
const USE_REACT_SELECT = true; // Change to false for WordPress SelectControl
```

After changing, rebuild with `npm run build`.

## Comparison Operators

| Operator | Description |
|----------|-------------|
| `before` | Field date is before current date/time |
| `beforeOrOn` | Field date is before or equal to current date/time |
| `after` | Field date is after current date/time |
| `onOrAfter` | Field date is equal to or after current date/time |

## Field Contexts

| Context | Description | ACF Function |
|---------|-------------|--------------|
| Current Post | Field value from the current post | `get_field_object($field)` |
| Current User | Field value from the current user | `get_field_object($field, 'user_' . $user_id)` |
| Options Page | Field value from ACF options page | `get_field_object($field, 'option')` |

## Troubleshooting

### Plugin doesn't appear in Block Visibility
- Ensure Block Visibility 3.0.0+ is installed and activated
- Check that ACF is active
- Verify the control is enabled in Block Visibility > Settings

### Fields not showing in dropdown
- Ensure you have created ACF Date Picker or Date Time Picker fields
- Check that fields are assigned to appropriate field groups
- Only date and datetime picker fields appear (not other ACF field types)

### Rules not working on frontend
- Clear all caches (object cache, page cache, etc.)
- Check browser console for JavaScript errors
- Enable WordPress debug mode and check error logs
- Verify the ACF field has a value set

### Debugging

Enable WordPress debugging in `wp-config.php`:
```php
define( 'WP_DEBUG', true );
define( 'WP_DEBUG_LOG', true );
define( 'WP_DEBUG_DISPLAY', false );
```

Add temporary logging in `includes/frontend/visibility-test.php`:
```php
error_log( 'ACF DateTime test called' );
error_log( 'Controls: ' . print_r( $controls, true ) );
```

## Credits

**Created by**: Claude.ai (Anthropic)
**Directed by**: David Mitchell, [Bridge Web Solutions](https://bridgewebsolutions.com)
**Built for**: [Block Visibility](https://www.blockvisibilitywp.com/) by Nick Diego

## License

GPL-2.0-or-later

This program is free software; you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation; either version 2 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

## Support

For issues, questions, or contributions, please use the [GitHub issue tracker](https://github.com/davidofchatham/bws-block-visibility-acf-datetime-extension/issues).

## Changelog

### 0.7.0
- Initial release
- Support for ACF Date Picker and Date Time Picker fields
- Four comparison operators: before, beforeOrOn, after, onOrAfter
- Support for post fields, user fields, and options page fields
- Rule sets with AND/OR logic
- Grouped field listings matching Block Visibility's UI
- Field type display for selected fields
