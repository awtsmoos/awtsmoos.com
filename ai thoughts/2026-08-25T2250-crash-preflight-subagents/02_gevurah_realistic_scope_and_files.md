B"H
Boruch Hashem
Blessed is He

# Phase Two — Gevurah: Realistic Scope and File Map

The Awtsmoos gives the repair hand strength only inside a measured boundary; Awtsmoos.com therefore narrows this pass to the two failures proven by runtime evidence.

## Proven crash fix

Touch only:

- `geelooy/apps/tunnel/agent/lib/connection-vessel/parent-consumer-recovery-preflight.js` — new pure preflight state vessel.
- `geelooy/apps/tunnel/agent/lib/connection-vessel/parent-consumer-recovery.js` — full rewrite to separate candidate, preflight, ledger claim, and authorization.
- focused recovery tests beside those modules.

Do not change stronger `parentUnresponsive` / `controlStalled` repair paths in this pass.

## Proven sub-agent fix

Touch only:

- `geelooy/apps/tunnel/agent/tools/fs/actionGroups/missionBrowserSpawnActions.js` — new bridge from logical mission children to website-agent browser spawn.
- `geelooy/apps/tunnel/agent/tools/fs/actionBuilderGroups/missionActions.js` — full rewrite to compose the bridge last so only `missionSpawnNext` is overridden.
- focused bridge tests.

Reuse, do not rewrite unless tests prove a defect:

- `websiteAgents/runner/spawn.js`
- `websiteAgents/runner/browserDelivery.js`
- existing website-agent public action.

## Runtime invariants

- Stale custody plus fresh success must never authorize SIGTERM.
- A matured stall must survive a second observation window before claim/signal.
- A fresh success during preflight cancels the candidate entirely.
- Ledger cooldown/rate limit remains authoritative after preflight.
- `missionSpawnNext` may return logical proposals, but its public success must require physical browser-delivery proof for the spawned children.
- Stable child/request keys make repeat calls idempotent.

The ohr may be vast, but Gevurah shapes the keli: repair only the race we saw, bridge only the spawn gap we traced, and leave unrelated architecture untouched.
