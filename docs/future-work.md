# Future work

The visible index over all non-bug work. This is **not a roadmap**: nothing here carries a committed timeline. Bugs do not go here; they are GitHub Issues. An item duplicates no detail; its detail home holds that. Cross-references use ids, and ids are permanent.

## Index

- [Feature ideas](#feature-ideas): new comparisons and field types.
- [Architecture](#architecture): refactors that deepen modules without changing behavior.
- [Closed / retired](#closed--retired): shipped or withdrawn items.

## Item shape

An item is a `#### FW-N — <title>` heading, one to three sentences on what the item IS (stable, not current state), then labeled lines:

- `Detail home:` where the detail lives.
- `Progress:` always present, even if just "Not started."
- `Open:` what is undecided or unbuilt; omitted when there is no real done/open split.
- `Blocked by:` and `Interacts with:` share one line. `—` means unblocked.

Blocker types: `row:FW-N` (clears when that item is Closed), `ship:X.Y.Z` (clears when that version is released), `code:<condition>` (clears when the condition holds; say what was checked in Progress), `decision:<what>` (an open human choice, never auto-cleared). A blocker states a code fact, never a scheduling preference; a preference belongs in the description.

An item is startable when `Blocked by:` is `—` or every `row:`/`ship:`/`code:` gate is satisfied. `Interacts with:` never blocks.

## Progress, not status

Progress may state only what stays true forever once true ("agreed, not started", "half shipped in 0.9.0"). It never says "phase 2 of 3" or a percent. It is a few sentences, not a build log.

## Trackers

### Feature ideas

#### FW-3 — Custom comparison date

Compare a field against a date the editor types in, instead of only the current date and time.

Detail home: none yet.

Progress: Not started.

Blocked by: —  •  Interacts with: FW-4, FW-8

#### FW-4 — Relative date comparisons

Rules such as "within 7 days" or "more than 30 days ago".

Detail home: none yet.

Progress: Not started.

Blocked by: —  •  Interacts with: FW-3, FW-8, FW-10

#### FW-5 — ACF date range fields

Support ACF date range fields.

Detail home: none yet.

Progress: Not started.

Blocked by: —  •  Interacts with: FW-8, FW-10

#### FW-6 — Time-only comparisons for datetime fields

Compare only the time-of-day portion of a datetime field.

Detail home: none yet.

Progress: Not started.

Blocked by: —  •  Interacts with: FW-8, FW-10

#### FW-7 — Field-to-field comparison

Compare one ACF field against another (field A before field B).

Detail home: none yet.

Progress: Not started.

Blocked by: —  •  Interacts with: FW-3, FW-8, FW-9

### Architecture

#### FW-8 — Deepen the date comparison module

One module owns parsing per field type, date versus datetime granularity, and the operators, and receives the moment to compare against instead of reading the clock itself. Every date-semantics feature (FW-3 to FW-7) lands here, so it is best done alongside the first of them rather than on its own.

Detail home: none yet.

Progress: Not started. The visibility check covers every operator, today's date and datetime fields, so the current behavior is pinned before any refactor.

Blocked by: —  •  Interacts with: FW-3, FW-4, FW-5, FW-6, FW-7, FW-10

#### FW-9 — Rule-set evaluation behind a field-value seam

Separate the visibility semantics in `acf_datetime_test()` (neutral rules, logged-out users, hide mode, AND within a set, OR across sets) from the ACF reads, behind a seam with two adapters: ACF in production, an in-memory table in tests. The semantics could then be tested without a live WordPress; the gain is speed and reach, since the current check already runs against real ACF.

Detail home: none yet.

Progress: Not started.

Blocked by: —  •  Interacts with: FW-7

#### FW-10 — One home for the control's vocabulary

PHP owns the operators, the supported field types and the defaults, and hands them to the editor and settings scripts, so adding an operator or field type is one edit instead of three across two languages. Includes deleting the localized `controlSlug`, which no script reads.

Detail home: none yet.

Progress: Not started.

Blocked by: —  •  Interacts with: FW-4, FW-5, FW-6, FW-8

#### FW-11 — Rule-set editing out of the editor render

Move the rule-set editing operations (add, remove, duplicate, clear, and their at-least-one invariants) out of the editor control's render into their own module, tested with the Jest runner `@wordpress/scripts` ships. Worth doing when a bug shows up there; until then it moves complexity more than it concentrates it.

Detail home: none yet.

Progress: Not started.

Blocked by: —  •  Interacts with: —

## Closed / retired

| ID | Item | Outcome | Landed / detail home |
|---|---|---|---|
| FW-1 | v0.9.0 fixes and plugin-update-checker | Fixed the logged-out user rule, empty-value handling, REST-time test loading and JS dependency extraction, and added self-update from GitHub releases through plugin-update-checker. | 0.9.0 |
| FW-2 | v1.0.0 Block Visibility integration | Made the control a first-class BV integration: listed under Integrations in the editor menu as "Advanced Custom Fields Date/Time" with a calendar icon, a global enable toggle on BV's settings page, and a tooling upgrade to `@wordpress/scripts` 35 and Node 22. | 1.0.0; `docs/design-history/v1.0.0-integration.md` |

## Maintenance

- **Order is by id.** Items within a section and rows in the ledger sit in ascending `FW-N` order. A new item goes at the end of its section; a closing row slots in by number.
- **Ids are permanent.** A new item is the highest live id or highest retired id, plus 1. A retired id is never reused.
- **Ships →** move the item to Closed / retired, collapse description and progress into one Outcome cell, and point Landed at the changelog version. Then append ` (closed)` to its id wherever a live item's `Interacts with:` names it.
- **`Interacts with:` is recorded on both sides.**
- **Cut work retires too.** A withdrawn item moves to the ledger with its outcome; a deleted item reads as an id that never existed.
- **Every local item gets an item here.** See `docs/agents/issue-tracker.md`.

<!-- `.scratch/` paths in this file are intentional: this file is the one committed place allowed to hold them. Do not "fix" them. -->
