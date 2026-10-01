<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed is He -->
## Current tunnel integration takes precedence

This reference retains the user's original ideas. Its historical transport names, fixed action lists,
local thought-folder defaults, retry assumptions and installation advice are superseded by
MODERN_TUNNEL_CONTRACT.md and the current authenticated instructionResolve/instructionGet results.
Use tunnel-native plans and bounded operational summaries; do not publish hidden chain-of-thought.
Treat brainstorming as proposals, not authorization to implement unrelated work. Preserve user scope.
Use MCP's required POST transport; GET is an HTTP fallback only. Never infer tool access from prose.
No arbitrary number of tests, critiques or improvements substitutes for real relevant verification.

# Resumable mission ledger

Maintain a compact ledger for substantial, ongoing user work. Store it in the user's authorized project or durable artifact location when supported. A scratch-only ledger cannot be promised to survive inactivity. Never put secrets, raw tokens, cookies, private logs, or unrelated file listings in it.

## Required fields

- Mission: the original requested outcome, affected source and project boundary, and explicit constraints.
- Done when: observable behavior and checks that would prove the outcome.
- Current state: last verified state, distinct from the last attempted action.
- Work items: each item has a dependency, state, evidence, and the next safe action.
- Changed artifacts: exact paths, pre-edit revisions or hashes, post-edit revisions or hashes, and whether each write completed.
- Blockers: the failed layer, request ID if safe to record, and what new condition permits retry.
- Deferred ideas: optional improvements, separate from work required for the present mission.
- Handoff: the first unverified step and the evidence needed to close it.

## Operating rules

- Update the ledger after a meaningful discovery, edit, failure, verification, or user correction. Retire completed items; do not let stale checklists trigger repeat edits.
- On return, reread current files and compare revision or hash before trusting an old plan. If another agent changed the source, reconcile instead of resuming an obsolete write.
- Rank the next action by direct relevance and uncertainty reduced. Repeating the same failed request without a changed precondition is not progress.
- Before each improvement pass, name the measurable target. Compare the candidate with the last working state before replacing it.
- A passing test closes only the behavior it covers. A failed or blocked verification remains open with a precise next step.
- Preserve a handoff when a session ends or disconnects. Do not claim background work continued after that point.
- Honor a user stop or scope correction immediately; update the ledger to reflect the new boundary.

## Minimal template

```text
Mission:
Scope and constraints:
Done when:
Last verified state:
Last attempted action:
Changed paths and revisions:
Required remaining work:
Blocked work and retry condition:
Deferred ideas:
Next safe action:
```

