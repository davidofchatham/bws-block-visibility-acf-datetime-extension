# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

Layout: **single-context**.

## Before exploring, read these

- **`docs/architecture.md`**: how the plugin works and the decisions behind it. Each section states the rule and, where the rule was a real fork, lists what was **Rejected** and why. Read the sections that touch the area you are about to work in.
- **`CONTEXT.md`** at the repo root, if it exists: the glossary of domain terms.
- **`docs/adr/`**, if it exists: read ADRs that touch your area.

If any listed file does not exist, **proceed silently**. Don't flag its absence or suggest creating it upfront. `/domain-modeling` creates `CONTEXT.md` and ADRs lazily when terms or decisions are actually resolved.

## Authority split

| Concern | Authority |
| --- | --- |
| How the plugin works, and why | `docs/architecture.md` |
| Per-function enforced invariants | PHPDoc on that code |
| Non-bug work | `docs/future-work.md` (`FW-N` items); private `.scratch/` homes carry the detail |
| Release and test procedure | `docs/releasing.md`, `docs/testing.md` |
| Version history | the changelog in `README.md` and `readme.txt` |
| Finished specs worth keeping | `docs/design-history/`, lifted at merge, then left alone |

Cite a decision by its `docs/architecture.md` section, never a spec coordinate: spec sections are mutable and archivable, sections here are living. `CLAUDE.md` is tracked and is the operative rule for agents.

## Flag conflicts with a recorded decision

If your output contradicts a `docs/architecture.md` section, surface it explicitly rather than silently overriding:

> _Contradicts `docs/architecture.md` §Rule sets (a disabled rule set is ignored entirely), but worth reopening because…_

Check the section's **Rejected** note first. If your proposal is already there, reopening needs an argument against that rebuttal, not a restatement of the option.
