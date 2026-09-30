# Issue tracker: hybrid — local specs, GitHub bugs

Two homes, split by ONE question: **must the record outlive the change?** Decision of record: this document plus `CLAUDE.md` §Spec lifecycle. Process decisions live in tracked prose and `git log`, not in an ADR.

| Work | Home | Why |
|---|---|---|
| Bugs; anything someone outside is waiting on; a defect CLASS on its second instance | GitHub Issues (`gh` CLI) | Durable, externally visible |
| A spec (PRD) for one in-flight piece of work | `.scratch/<feature-slug>/spec.md` | Rewritable in place; dies at merge |
| The build tickets it slices into | `.scratch/<feature-slug>/issues/<NN>-<slug>.md` | Numbered per feature from `01`, so they never collide with `#N` |
| A wayfinder effort | `.scratch/<effort>/map.md` + `issues/<NN>-<slug>.md` | Same shape; an effort answers questions rather than building |
| Long-lived design plans | `.scratch/plans/*.md`, finished ones in `plans/archive/` | Outlast any one feature |
| The VISIBLE index over all of the above | `docs/future-work.md`, committed | `.scratch/` is private; without this, non-bug work would be invisible rather than merely unshared |

`.scratch/` is never committed. `.scratch/<feature-slug>/` is one piece of in-flight work and dies at merge; `.scratch/plans/` holds long-lived plans that can outlast many features. A plan is not a feature slug.

## The local half

- One feature or effort per directory: `.scratch/<slug>/`.
- Spec at `.scratch/<slug>/spec.md`; wayfinder map at `.scratch/<slug>/map.md`.
- Tickets one file each at `issues/<NN>-<slug>.md`, `01` up, in **dependency order**. Never one combined file.
- Triage state is a `Status:` line near the top (role strings in `triage-labels.md`; wayfinder tickets carry claim state instead: `open` / `claimed` / `resolved`).
- Wayfinder tickets also carry `Type:`: `research` / `prototype` / `grilling` / `task`.
- Blocking is a `Blocked by: NN, NN` line near the top, in **local** ticket numbers.
- Conversation appends under a `## Comments` heading.
- **Every local item also gets a `docs/future-work.md` item.** Work tracked only in a hidden file is work nobody can see.

## The GitHub half

- Create: `gh issue create --title "..." --body "..."` (heredoc for multi-line)
- Read: `gh issue view <number> --comments`
- List: `gh issue list --state open --json number,title,body,labels,comments --jq '[.[] | {number, title, body, labels: [.labels[].name], comments: [.comments[].body]}]'`
- Comment: `gh issue comment <number> --body "..."`
- Label: `gh issue edit <number> --add-label "..."` / `--remove-label "..."`
- Close: `gh issue close <number> --comment "..."`
- The repo is inferred from `git remote -v`.

**PRs as a request surface: no.** _(Set to `yes` if this repo treats external PRs as feature requests; `/triage` reads this flag.)_ GitHub shares one number space across issues and PRs, so a bare `#42` may be either: resolve with `gh pr view 42`, falling back to `gh issue view 42`.

## IDs never appear bare

Three sequences coexist. Every citation carries its marker:

- `FW-7`: a `docs/future-work.md` tracker item
- `#7`: a GitHub issue
- `<slug>/03`: a local ticket

A bare integer is ambiguous between all three.

## Paths never appear in committed files

`.scratch/` and `.claude/` are unreadable to everyone but their author, so a committed file citing one fails **silently**: it looks like a working pointer.

- A committed file cites a live plan through its **`FW-N` item**.
- It may cite a plan by path only after the plan is finished and **lifted** into `docs/design-history/`. A lifted plan MOVES: no copy stays in `.scratch/plans/archive/`.
- **`docs/future-work.md` is the one file allowed to hold a `.scratch/` path.** Being the index over the private homes is its whole job.
- Naming the convention is fine. A path containing a `<placeholder>` or a `*` is a pattern, not a citation.

Not yet enforced by a script. Check by hand with `git grep -n '\.scratch/\|\.claude/' -- '*.md' ':!docs/future-work.md'`.

## Publication — what survives the merge

A spec dies at merge. **Decide where each part of it lands BEFORE deleting the directory**, or the reasoning goes with it.

**Lifting the finished spec into `docs/design-history/` is the normal path at merge.** Archiving to `.scratch/plans/archive/` is the exception, for a thin slice whose reasoning is fully carried by the homes below. Deleting is not the default: an archived spec costs nothing and a deleted one is unrecoverable. Where the work went through a pull request, the PR body is the second record: it holds the review conversation and what changed under challenge. Write both.

Load-bearing parts also migrate out of the spec:

| Part of the spec | Durable home |
|---|---|
| Load-bearing invariants | PHPDoc on the enforcing code, or a `docs/architecture.md` section |
| The decision and its rationale | the `docs/architecture.md` section that owns the invariant, with a **Rejected** note where it was a real fork |
| The user-facing delta | `CHANGELOG.md` |
| Why this change, now | the commit body |

Rules that bind a lift:

- **A lifted spec MOVES and is frozen.** It records what was true at merge; where it and the code later disagree, the code is what shipped.
- **An INCORRECT identifier is fixed in place; a STALE claim is not.** A wrong version number, commit SHA, issue number or moved path misleads like a typo. A design since moved past or a reversed decision was true when written.
- **Never lift an unbuilt plan.** An unshipped intention in `docs/design-history/` is indistinguishable from a shipped decision.
- **A partial lift** leaves the remainder in `.scratch/plans/archive/`, and the lifted file says it is an extract.
- **Sanitize on lift.** Committed files must not contain absolute local paths or personal email addresses.

## When a skill says "publish to the issue tracker"

- A **spec**: write `.scratch/<feature-slug>/spec.md`.
- **Build tickets**: one file each under `.scratch/<feature-slug>/issues/`.
- A **bug**, or anything whose record must outlive the change: `gh issue create`.
- A non-bug that needs tracking: a `docs/future-work.md` item pointing at its home.
- Unsure: ask. **Do not default to GitHub.**

## When a skill says "fetch the relevant ticket"

A path: read the file. A bare `#42`: `gh issue view 42 --comments`.

## Wayfinding operations

Used by `/wayfinder`. The **map** is a file with one **child** per ticket. **Local only: wayfinding never runs against GitHub Issues here.**

- **Map**: `.scratch/<effort>/map.md` with Destination / Notes / Decisions-so-far / Not-yet-specified / Out-of-scope.
- **Child**: `.scratch/<effort>/issues/NN-<slug>.md`, from `01`, question in the body. `Type:` records `research`/`prototype`/`grilling`/`task`; `Status:` records `open`/`claimed`/`resolved`.
- **Run log**: `.scratch/<effort>/run-log.md`, optional. Create one when an effort starts accruing attempts worth remembering; do not seed an empty one.
- **Blocking**: `Blocked by: NN, NN`. Unblocked when every listed ticket is `resolved`.
- **Frontier**: open, unblocked, unclaimed; lowest number wins.
- **Claim**: set `Status: claimed` and save before any work.
- **Resolve**: append the answer under `## Answer`, set `Status: resolved`, then append a context pointer to Decisions-so-far in `map.md`.
