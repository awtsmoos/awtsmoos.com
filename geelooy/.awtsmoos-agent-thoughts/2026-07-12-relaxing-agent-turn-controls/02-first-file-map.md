# B"H — First File Map

## Frontend surfaces to inspect

- `geelooy/apps/tunnel-control/js/features/missionRooms/` for room state, rendering, messages, and control wiring.
- `geelooy/apps/tunnel-control/js/features/aiAgents.js` for agent presentation.
- `geelooy/apps/tunnel-control/js/dashboard/` for the agent-first overview.
- `geelooy/apps/tunnel-control/js/features/live.js` for action transport state.
- `geelooy/apps/tunnel-control/css/future/views/` for responsive visual integration.

## Backend surfaces to inspect

- `geelooy/apps/tunnel/agent/tools/fs/mission/daemon/` for scheduler lifecycle and turn cadence.
- `geelooy/apps/tunnel/agent/tools/fs/actionGroups/missionDaemonActions.js` for public controls.
- `geelooy/apps/tunnel/agent/tools/fs/mission/transaction/` for mutation serialization.
- `geelooy/apps/tunnel/agent/tools/fs/mission/lock/` for durable mission identity.
- `geelooy/apps/tunnel/agent/tools/fs/commandJobStore.js` for ghost-job reconciliation.
- `geelooy/apps/tunnel/agent/tools/chrome/` for target lease cleanup.

## Candidate new modules

- Frontend `agentControls/` modules for policy state, rendering, events, API calls, and resource-health projection.
- Backend `mission/continuation/` modules for policy normalization, budget accounting, gates, and status.
- Backend `runtime/resourceLedger/` modules for owned-resource registration, release, reconciliation, and snapshots.
- Tests for policy normalization, turn exhaustion, pause/drain semantics, leak-free cleanup, and frontend control rendering.

## Rewrite policy

Every touched file will be read first and rewritten in full. New concerns will be split into modules under 120 lines wherever practical.
