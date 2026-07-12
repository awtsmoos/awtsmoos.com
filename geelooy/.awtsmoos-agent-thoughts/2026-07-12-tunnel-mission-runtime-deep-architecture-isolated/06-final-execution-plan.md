# B"H — Final Execution Plan Before Source Inspection

## Safety scope

- Keep `awt-awtsmoos-2113` running and untouched.
- Use it only as a filesystem and isolated-command vessel.
- Do not modify installer, startup, production relay routing, action alias registration, live database, live Chrome profile, or current agent runtime entrypoints.
- Run all commands from repository paths against isolated files, temporary directories, and separate processes.

## Inspection order

1. Map relay exports, imports, request acceptance, pending storage, response handling, retries, streaming, cleanup, and tests.
2. Map agent request dispatch, lane selection, response envelope creation, command-job lifecycle, and runtime registries.
3. Map mission load/mutate/save boundaries, transaction keys, daemon scheduler, graph, claims, checkpoints, agent controls, and persistence.
4. Map Chrome connection, target selection, leases, queueing, context lifecycle, and cleanup.
5. Map Tunnel Control data fetching, reconnect behavior, mission room lifecycle, agent controls, and resource views.
6. Map OS and Code process supervisors and shared tunnel identities.
7. Enumerate mutable module globals, Maps, Sets, timers, intervals, listeners, workers, child processes, sockets, EventSources, and browser handles.
8. Enumerate every status string and classify whether it conflates intent, observation, health, or progress.
9. Enumerate locks and identify any held across external awaits.
10. Enumerate retries, cancellations, timeouts, late responses, and orphan reconciliation.

## Initial isolated implementation paths

Create only after inspection confirms compatibility:

- `/Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com/geelooy/apps/tunnel/agent/next-runtime/protocol/identity.js`
- `/Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com/geelooy/apps/tunnel/agent/next-runtime/protocol/canonicalJson.js`
- `/Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com/geelooy/apps/tunnel/agent/next-runtime/protocol/envelopes.js`
- `/Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com/geelooy/apps/tunnel/agent/next-runtime/protocol/lifecycle.js`
- `/Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com/geelooy/apps/tunnel/agent/next-runtime/transport/memoryOperationStore.js`
- `/Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com/geelooy/apps/tunnel/agent/next-runtime/transport/quarantineLedger.js`
- `/Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com/geelooy/apps/tunnel/agent/next-runtime/transport/operationCoordinator.js`
- `/Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com/geelooy/apps/tunnel/agent/next-runtime/scheduler/keyedSerial.js`
- `/Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com/geelooy/apps/tunnel/agent/next-runtime/scheduler/priorityLanes.js`
- `/Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com/geelooy/apps/tunnel/agent/next-runtime/mission/graph.js`
- `/Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com/geelooy/apps/tunnel/agent/next-runtime/mission/agentRuntime.js`
- `/Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com/geelooy/apps/tunnel/agent/next-runtime/resources/resourceLedger.js`
- `/Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com/geelooy/apps/tunnel/agent/next-runtime/index.js`

Every production module should remain below 120 lines; if a module approaches that limit, split validation, state transitions, and storage helpers into separate files.

## Initial test paths

- `.../next-runtime/tests/helpers/fakeClock.mjs`
- `.../next-runtime/tests/helpers/ids.mjs`
- `.../next-runtime/tests/identity.test.mjs`
- `.../next-runtime/tests/correlation.test.mjs`
- `.../next-runtime/tests/idempotency.test.mjs`
- `.../next-runtime/tests/priorityLanes.test.mjs`
- `.../next-runtime/tests/missionGraph.test.mjs`
- `.../next-runtime/tests/agentRuntime.test.mjs`
- `.../next-runtime/tests/resourceLedger.test.mjs`
- `.../next-runtime/tests/crossProcess/worker.mjs`
- `.../next-runtime/tests/crossProcess/crossProcess.test.mjs`
- `.../next-runtime/tests/stress/thousandRequests.mjs`
- `.../next-runtime/tests/leaks/lifecycleLeak.mjs`

## Request call stack to prove

1. Adapter or native caller submits an immutable request envelope.
2. Identity validator rejects missing or inconsistent identifiers.
3. Canonicalizer normalizes supported payload values and produces `requestHash`.
4. Operation coordinator asks store for existing idempotency and request identities.
5. Same key and hash coalesces; same key and different hash conflicts.
6. New operation persists `created` then `accepted` before outbound delivery is requested.
7. Connection epoch and transport session are attached to the delivery attempt.
8. Response handler validates tunnel, epoch, operation, request, nonce, action, job, stream, and canonical roots as applicable.
9. Mismatch enters bounded quarantine and cannot resolve waiters.
10. Valid stream events pass sequence checks and enter bounded replay storage.
11. Valid final receipt persists before waiters resolve.
12. Late retry reads the durable result without resending.
13. Cleanup evicts only according to explicit retention and emits an expiration or compaction event.

## Mission action call stack to prove

1. Coordinator persists node intent.
2. Agent runtime atomically consumes One Turn credit or validates running policy.
3. Revisioned task and resource claims are acquired.
4. External action starts outside the mission transaction.
5. Action and resources heartbeat independently of transport.
6. Completion receipt persists with result or failure reference.
7. Checkpoint persists before claims release.
8. Claims release idempotently.
9. Dependency release is revisioned and idempotent.
10. Human controls enter P0/P1 and can change desired state without waiting behind heavy work.

## Test order

1. Syntax checks.
2. Deterministic pure unit tests.
3. 1,000-request in-process stress with reverse, duplicate, wrong-first, and conflicting-key cases.
4. Cross-process worker test with process kill at defined boundaries.
5. Priority-lane responsiveness under saturated heavy work.
6. Mission graph concurrency and stale-claim tests.
7. Resource start/stop leak cycles.
8. Temporary-store restart and recovery tests.
9. Targeted chaos injection.
10. Bounded soak subset if runtime permits; otherwise provide the runner and mark long-duration evidence not yet tested.

## Planned documentation outputs

Inside this planning directory:

- `07-current-state-map.md`
- `08-failure-mode-inventory.md`
- `09-protocol-schema.md`
- `10-mission-and-agent-schema.md`
- `11-resource-job-browser-design.md`
- `12-frontend-component-plan.md`
- `13-migration-and-rollback.md`
- `14-test-evidence.md`
- `15-planned-vs-actual.md`
- `16-readiness-report.md`
- `17-remaining-work.md`

## Stop condition

This mission may stop with live migration still failed. It may not stop before the isolated work is read back, tests are recorded, missing evidence is explicit, and the next safe work is preserved.
