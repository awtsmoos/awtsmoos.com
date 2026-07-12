# B"H — Phase One Theoretical File Map

## Rule

This map is provisional. Existing files must be read before any rewrite. New isolated files may be created only under non-live paths until compatibility and migration gates are proven.

## Candidate isolated architecture root

`/Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com/geelooy/apps/tunnel/agent/next-runtime/`

Potential modules:

- `protocol/identity.js` — immutable identifier validation and canonicalization.
- `protocol/envelope.js` — request, response, stream, error, and receipt builders.
- `protocol/idempotency.js` — normalized payload hashing and conflict rules.
- `protocol/sequences.js` — duplicate, gap, reorder, and replay detection.
- `protocol/states.js` — desired and observed state vocabularies.
- `transport/operationStore.js` — durable operation interface.
- `transport/memoryOperationStore.js` — deterministic unit-test reference.
- `transport/sqliteOperationStore.js` — isolated durable reference if repository dependencies permit.
- `transport/operationCoordinator.js` — coalescing, correlation, timeout, late receipt, reconciliation.
- `transport/connectionEpochs.js` — epoch issuance and stale-frame quarantine.
- `transport/quarantineLedger.js` — bounded mismatch and unsolicited evidence.
- `transport/replayBuffer.js` — bounded acknowledged stream replay.
- `scheduler/priorityLanes.js` — P0–P5 admission, fairness, and caps.
- `scheduler/keyedSerial.js` — per-key serialization without global blocking.
- `scheduler/leases.js` — revisioned claims and expirations.
- `mission/graphSchema.js` — nodes, edges, gates, attempts, and results.
- `mission/missionStore.js` — durable mission interface.
- `mission/memoryMissionStore.js` — deterministic reference.
- `mission/agentRuntime.js` — isolated per-agent inbox, task, action, checkpoint state.
- `mission/coordinator.js` — dependency release and assignment.
- `mission/checkpoints.js` — compact resumable packages.
- `mission/policy.js` — scope precedence and control transitions.
- `resources/resourceLedger.js` — owner and lifecycle contract.
- `resources/reconciler.js` — stale detection, cleanup deadlines, and reports.
- `jobs/jobSchema.js` — durable process receipt.
- `jobs/processIdentity.js` — PID plus birth token abstraction.
- `jobs/supervisor.js` — spawn, heartbeat, process-group cancellation, output caps.
- `jobs/reconciler.js` — startup and periodic orphan reconciliation.
- `browser/browserLease.js` — scope and target ownership.
- `browser/contextSupervisor.js` — per-agent context and per-target session lifecycle.
- `browser/reconciler.js` — stale context and target cleanup.
- `observability/eventLog.js` — structured bounded event sink.
- `observability/snapshot.js` — redacted runtime snapshots.
- `compatibility/legacyEnvelopeAdapter.js` — explicit old-to-new translation.
- `compatibility/legacyActionAdapter.js` — staged action compatibility.
- `index.js` — isolated public surface.

## Candidate isolated tests

`/Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com/geelooy/apps/tunnel/agent/next-runtime/tests/`

- `identity.test.mjs`
- `correlation.test.mjs`
- `idempotency.test.mjs`
- `sequenceReplay.test.mjs`
- `connectionEpoch.test.mjs`
- `priorityLanes.test.mjs`
- `missionGraph.test.mjs`
- `agentRuntime.test.mjs`
- `resourceLedger.test.mjs`
- `jobReconciliation.test.mjs`
- `browserLease.test.mjs`
- `compatibility.test.mjs`
- `crossProcess/relayWorker.mjs`
- `crossProcess/crossProcess.test.mjs`
- `stress/thousandRequests.mjs`
- `stress/hundredsOfMissions.mjs`
- `chaos/transportChaos.mjs`
- `chaos/storageChaos.mjs`
- `leaks/lifecycleLeak.mjs`
- `soak/isolatedSoak.mjs`

## Existing implementation areas to inspect before deciding integration

### Relay

- `/Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com/ayzarim/awtsmoosDynamicServer/websocket/apps/tunnelRelay.js`
- `/Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com/ayzarim/awtsmoosDynamicServer/websocket/apps/tunnelRelay/`
- Server routes that call relay request APIs.
- Existing correlation, timeout, retry, and streaming tests.

### Agent runtime and action dispatch

- `/Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com/geelooy/apps/tunnel/agent/main.js`
- `/Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com/geelooy/apps/tunnel/agent/lib/runtime/`
- `/Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com/geelooy/apps/tunnel/agent/tools/fs/actionRuntime.js`
- `/Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com/geelooy/apps/tunnel/agent/tools/fs/actions.js`
- Action groups, aliases, lane metadata, and response wrapping.

### Mission

- `/Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com/geelooy/apps/tunnel/agent/tools/fs/mission/`
- `daemon/`, `transaction/`, `continuationControl/`, graph, room, claim, checkpoint, and persistence modules.
- Mission action groups and frontend consumers.

### Jobs

- Command actions, worker files, job stores, output paging, cancellation, and process cleanup modules under agent runtime and tools.
- Any test receipts or stale command diagnostics.

### Browser

- `/Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com/geelooy/apps/tunnel/agent/tools/chrome/`
- CDP connection ownership, target selection, lease queue, and cleanup.
- Frontend browser-control modules.

### Frontend

- `/Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com/geelooy/apps/tunnel-control/js/features/missionRooms/`
- `/Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com/geelooy/apps/tunnel-control/js/features/agentControls/`
- Fleet/dashboard, connection, resource, and timeline modules.
- API wrappers and live transport state.

### OS and Code

- `/Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com/geelooy/os/`
- `/Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com/geelooy/apps/code/`
- Process supervisors, VFS mounts, server previews, browser lifecycle, and shared identity usage.

## Candidate documentation

- `docs/architecture/current-state-map.md`
- `docs/architecture/failure-mode-inventory.md`
- `docs/architecture/next-runtime-protocol.md`
- `docs/architecture/mission-runtime.md`
- `docs/architecture/resource-ownership.md`
- `docs/architecture/migration-plan.md`
- `docs/architecture/rollback-plan.md`
- `docs/architecture/readiness-report.md`

These should initially live inside the mission planning directory or isolated runtime docs. Promotion into canonical docs should occur only after review.

## Files forbidden in the first implementation stage

- Live installer scripts.
- Current production routing.
- Current connected agent executable or runtime startup files.
- Public action aliases used by active users.
- Existing production database stores.
- Existing Chrome global target configuration.

## Verification of this plan

The actual file map must be regenerated after source inspection. Any candidate module unsupported by real call paths will be removed. Any hidden dependency discovered from imports, routes, tests, or runtime traces will be added before implementation.
