# ACF Date/Time Control for Block Visibility

WordPress plugin extending [Block Visibility](https://www.blockvisibilitywp.com/) with a date/time control for ACF date and datetime fields: show or hide a block depending on whether the field is before, after, or equal to the current date/time. Requirements and current version are in `readme.txt` and `package.json`.

**Text domain:** `bws-block-visibility-acf-datetime-extension`

## Where things live

- `docs/architecture.md`: how the plugin works, the Block Visibility integration, and rejected approaches. Read the relevant section before changing behavior.
- `docs/future-work.md`: the index of all non-bug work.
- `docs/releasing.md`: version bump checklist and packaging.
- `docs/testing.md`: test environment, checklist, debug logging.

## Development

Test on the local wp-litespeed testbed (https://testbed.test/); its plugin directory is a symlink to this repo, so nothing needs syncing. See `docs/testing.md`.

- `npm run build`: compile `assets/js/editor-control.js` to `build/` (run after any JS change).
- `npm run package`: build, create the zip, add the version to its filename.
- `tests/visibility-check.php`: visibility-logic check. From the wp-litespeed checkout in WSL: `bin/wp.sh testbed eval-file /var/www/vhosts/testbed/html/wp-content/plugins/bws-block-visibility-acf-datetime-extension/tests/visibility-check.php` (details in `docs/testing.md`).

### Conventions

- Follow WordPress PHP coding standards; escape all output.
- Use WordPress i18n functions with the plugin text domain.
- JavaScript imports from `@wordpress/*` packages (not `wp.*` globals), uses `createElement` with no JSX, and `Object.assign` for merging.
- Match Block Visibility's native UI patterns exactly (menu structure, icon shapes) and integrate only through its documented filters.
- Committed files contain no absolute local paths and no personal email addresses.

## Spec lifecycle

Work is split by one question: must the record outlive the change? Bugs and anything an outsider waits on are GitHub Issues. Specs, build tickets and plans live in the private `.scratch/` directory, and every such item also gets a `docs/future-work.md` item. Committed files cite the `FW-N` item, never a `.scratch/` or `.claude/` path. A finished spec is lifted into `docs/design-history/` at merge. IDs are never bare: `FW-N`, `#N` or `<slug>/NN`. Full rules are in `docs/agents/issue-tracker.md`.

## Agent skills

### Issue tracker

Hybrid: bugs in GitHub Issues, specs and tickets as local files under `.scratch/`, indexed in `docs/future-work.md`. See `docs/agents/issue-tracker.md`.

### Triage labels

Default five-role vocabulary, carried as GitHub labels and as a `Status:` line in local tickets. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context. See `docs/agents/domain.md`.
