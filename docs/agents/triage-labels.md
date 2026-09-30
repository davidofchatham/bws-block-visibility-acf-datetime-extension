# Triage Labels

The skills speak in terms of five canonical triage roles. This file maps those roles to the actual label strings used in this repo's issue tracker.

| Label in mattpocock/skills | Label in our tracker | Meaning                                  |
| -------------------------- | -------------------- | ---------------------------------------- |
| `needs-triage`             | `needs-triage`       | Maintainer needs to evaluate this issue  |
| `needs-info`               | `needs-info`         | Waiting on reporter for more information |
| `ready-for-agent`          | `ready-for-agent`    | Fully specified, ready for an AFK agent  |
| `ready-for-human`          | `ready-for-human`    | Requires human implementation            |
| `wontfix`                  | `wontfix`            | Will not be actioned                     |

When a skill mentions a role (e.g. "apply the AFK-ready triage label"), use the corresponding label string from this table.

## The same five roles carry in both homes

This repo's tracker is split (`docs/agents/issue-tracker.md`): bugs are GitHub Issues, specs and build tickets are local files under `.scratch/`. The roles above are **one vocabulary with two carriers**. Do not invent a second set for local tickets.

| Home | How the role is recorded |
|---|---|
| GitHub Issue | a label, exactly as spelled above |
| Local ticket (`.scratch/<slug>/issues/NN-*.md`) | a `Status:` line near the top, carrying the same string |

So "apply the AFK-ready triage role" means `gh issue edit <n> --add-label ready-for-agent` on a GitHub issue, and `Status: ready-for-agent` in a local ticket.

**Wayfinder tickets are the one exception.** They track claim state rather than triage state, so their `Status:` carries `open` / `claimed` / `resolved`. See `issue-tracker.md` under Wayfinding operations.
