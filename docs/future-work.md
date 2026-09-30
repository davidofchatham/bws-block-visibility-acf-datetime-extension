# Future work

The visible index over all non-bug work. This is **not a roadmap**: nothing here carries a committed timeline. Bugs do not go here; they are GitHub Issues. An item duplicates no detail; its detail home holds that. Cross-references use ids, and ids are permanent.

## Index

- FW-1: v0.9.0 fixes and plugin-update-checker
- FW-2: v1.0.0 Block Visibility integration
- FW-3: Custom comparison date
- FW-4: Relative date comparisons
- FW-5: ACF date range fields
- FW-6: Time-only comparisons for datetime fields
- FW-7: Field-to-field comparison

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

### Releases

#### FW-1 — v0.9.0 fixes and plugin-update-checker

Correctness fixes found in an assessment against Block Visibility 3.8.1 (logged-out user rule, empty-value handling, REST-time test loading, JS dependency extraction), plus vendoring plugin-update-checker so later versions reach live sites automatically.

Detail home: `.scratch/plans/v0.9.0-fixes-and-updater.md`, sliced into tickets under `.scratch/v0.9.0/issues/`

Progress: Agreed and sliced into nine tickets; test harness (ticket 01), logged-out user-rule fix (ticket 02), neutral empty/unparseable values (ticket 03) and REST-time test loading (ticket 04) `@wordpress/*` imports for the editor JS (ticket 05) and version headers with ACF-integration readme note (ticket 06) plugin-update-checker wiring (ticket 07) and the CI release workflow with `build/` untracked (ticket 08) built.

Blocked by: —  •  Interacts with: FW-2

#### FW-2 — v1.0.0 Block Visibility integration

Make the control a first-class BV integration: listed under "Integrations" in the editor menu, "ACF Date & Time" label and icon, a global enable toggle in BV's settings screen, and a tooling upgrade. Release as 1.0.0 if it works cleanly.

Detail home: `.scratch/plans/v1.0.0-integration.md`

Progress: Agreed, not started.

Blocked by: ship:0.9.0  •  Interacts with: FW-1

### Feature ideas

#### FW-3 — Custom comparison date

Compare a field against a date the editor types in, instead of only the current date and time.

Detail home: none yet.

Progress: Not started.

Blocked by: —  •  Interacts with: FW-4

#### FW-4 — Relative date comparisons

Rules such as "within 7 days" or "more than 30 days ago".

Detail home: none yet.

Progress: Not started.

Blocked by: —  •  Interacts with: FW-3

#### FW-5 — ACF date range fields

Support ACF date range fields.

Detail home: none yet.

Progress: Not started.

Blocked by: —  •  Interacts with: —

#### FW-6 — Time-only comparisons for datetime fields

Compare only the time-of-day portion of a datetime field.

Detail home: none yet.

Progress: Not started.

Blocked by: —  •  Interacts with: —

#### FW-7 — Field-to-field comparison

Compare one ACF field against another (field A before field B).

Detail home: none yet.

Progress: Not started.

Blocked by: —  •  Interacts with: FW-3

## Closed / retired

| ID | Item | Outcome | Landed / detail home |
|---|---|---|---|

## Maintenance

- **Order is by id.** Items within a section and rows in the ledger sit in ascending `FW-N` order. A new item goes at the end of its section; a closing row slots in by number.
- **Ids are permanent.** A new item is the highest live id or highest retired id, plus 1. A retired id is never reused.
- **Ships →** move the item to Closed / retired, collapse description and progress into one Outcome cell, and point Landed at the changelog version. Then append ` (closed)` to its id wherever a live item's `Interacts with:` names it.
- **`Interacts with:` is recorded on both sides.**
- **Cut work retires too.** A withdrawn item moves to the ledger with its outcome; a deleted item reads as an id that never existed.
- **Every local item gets an item here.** See `docs/agents/issue-tracker.md`.

<!-- `.scratch/` paths in this file are intentional: this file is the one committed place allowed to hold them. Do not "fix" them. -->
