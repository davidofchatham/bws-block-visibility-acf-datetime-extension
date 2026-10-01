# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0]

### Added

- Global enable toggle for the control under Settings → Block Visibility → Visibility Controls → Integrations

### Changed

- The control is listed under Integrations in Block Visibility's editor menu, labeled "Advanced Custom Fields Date/Time" with a calendar icon, and stays in the Default visibility controls list; existing blocks keep their settings
- Build tooling upgraded to `@wordpress/scripts` 35 and Node 22, matching Block Visibility 3.8
- Editor control matches Block Visibility's own controls: calendar icon, info popover and "ACF Date/Time" title in the panel header, editable rule set titles, and BV's select markup and dropdown arrows
- Header info popover and description follow Block Visibility's "Enable editor notices" setting

## [0.9.0] - 2026-09-30

### Added

- Updates arrive from GitHub releases automatically (plugin-update-checker)

### Changed

- The editor script loads WordPress packages through dependency extraction instead of globals
- Requires WordPress 6.6 or higher, matching Block Visibility 3.8.0
- Block Visibility's ACF integration must be enabled or the control lists no fields

### Removed

- The unused "portal" field context; saved blocks that used it fall back to the current post

### Fixed

- A user-context rule now hides the block when nobody is logged in (it previously showed it)
- Empty, unparseable or missing field values, unknown operators and fields that cannot be found are now skipped instead of counting as visible, so they no longer hide blocks in "hide" mode
- Visibility rules now also apply to REST requests (for example server-side block renders in the editor)

## [0.8.0] - 2026-01-21

### Added

- Duplicate button in the rule set hamburger menu
- "Clear rule set" option for single rule sets (vs "Remove rule set" for multiple)

### Changed

- The hamburger menu now matches Block Visibility patterns exactly
- The Delete Rule button uses Block Visibility-style close icon (X)

### Fixed

- Disabled rule sets are now properly ignored in visibility evaluation

## [0.7.0] - 2026-01-19

Initial feature-complete beta release.

### Added

- Support for ACF Date Picker and Date Time Picker fields
- Four comparison operators: before, beforeOrOn, after, onOrAfter
- Support for post fields, user fields, and options page fields
- Rule sets with AND/OR logic
- Grouped field listings matching Block Visibility's UI
- Field type display for selected fields

[Unreleased]: https://github.com/davidofchatham/bws-block-visibility-acf-datetime-extension/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/davidofchatham/bws-block-visibility-acf-datetime-extension/compare/v0.9.0...v1.0.0
[0.9.0]: https://github.com/davidofchatham/bws-block-visibility-acf-datetime-extension/compare/v0.8.0...v0.9.0
[0.8.0]: https://github.com/davidofchatham/bws-block-visibility-acf-datetime-extension/compare/v0.7.0...v0.8.0
[0.7.0]: https://github.com/davidofchatham/bws-block-visibility-acf-datetime-extension/releases/tag/v0.7.0
