# Block Visibility ACF Date-Time Extension

Extends [Block Visibility](https://www.blockvisibilitywp.com/) with controls for showing/hiding blocks based on Advanced Custom Fields (ACF) date and datetime field values.

**Created by Claude.ai under the direction of David Mitchell ([Bridge Web Solutions](https://bridgewebsolutions.com))**

## Features

- **Date Comparison Operators**: `before`, `beforeOrOn`, `after`, `onOrAfter`
- **ACF Field Support**: Works with both ACF Date Picker and Date Time Picker fields
- **Multiple Field Contexts**: Supports post fields, user fields, and options page fields
- **Rule Sets**: Create complex visibility rules with AND/OR logic
- **Rule Set Management**: Enable/disable, duplicate, and remove rule sets via hamburger menu
- **Seamless Integration**: Matches Block Visibility's native UI and workflow
- **Grouped Field Listings**: ACF fields organized by Field Group for easy selection
- **Field Type Display**: Shows whether a field is Date Picker or Date Time Picker
- **Default Visibility Controls**: Available in Block Visibility's global settings
- **Automatic Updates**: New versions arrive from GitHub releases

## Requirements

- WordPress 6.6+
- PHP 7.4+
- [Block Visibility](https://wordpress.org/plugins/block-visibility/) 3.0.0+
- [Advanced Custom Fields](https://wordpress.org/plugins/advanced-custom-fields/) (Free or PRO)
- At least one ACF Date Picker or Date Time Picker field
- Block Visibility's ACF integration enabled (Block Visibility > Settings > Visibility Controls); otherwise the control lists no fields

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

- `npm run build` - Production build
- `npm run start` - Development mode with watch
- `npm run package` - Create distributable zip file

How the plugin works is in [docs/architecture.md](docs/architecture.md), testing in [docs/testing.md](docs/testing.md), and the release process in [docs/releasing.md](docs/releasing.md).

## Comparison Operators

| Operator | Description |
|----------|-------------|
| `before` | Field date is before current date/time |
| `beforeOrOn` | Field date is before or equal to current date/time |
| `after` | Field date is after current date/time |
| `onOrAfter` | Field date is equal to or after current date/time |

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

Enable `WP_DEBUG` and `WP_DEBUG_LOG` in `wp-config.php` and check `wp-content/debug.log`. To confirm the frontend filter runs, see [Debug logging](docs/testing.md#debug-logging).

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

See [CHANGELOG.md](CHANGELOG.md).
