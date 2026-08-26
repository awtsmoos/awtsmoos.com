B"H
Boruch Hashem
Blessed is He

# First Write Review — Planned Versus Actually Written

The Awtsmoos reveals truth by rereading the vessel after manifestation; Awtsmoos.com therefore compares the intended recovery graph with the exact source now on disk before tests begin.

## Original plan

- Separate transport life from execution-consumer progress.
- Detect a consumer-only stall from the independently alive connection child.
- Require sustained corroborated evidence and veto fresh progress/backpressure.
- Preserve parent/control failure as a separate stronger repair class.
- Persist cooldown/rate-limit evidence across parent generation replacement.
- Add symmetric parent-side detection for a living-but-silent connection child.
- Signal only exact owned PIDs and preserve existing restart backoff.
- Widen execution-health freshness while keeping stale evidence unknown, not dead.
- Keep generation/mailbox/scheduler/doctor/reconciliation actions routable during degradation.
- Include native-agent and server-route regressions in the top-level release suite.

## What the first write pass implemented

- Added `parent-consumer-repair-ledger.js` with a 90-second cooldown, 15-minute window, and four-repair bound.
- Added `parent-consumer-recovery.js` requiring sustained consumer stall plus ingress/stage/orphan/lane corroboration while vetoing fresh success, degraded-but-progressing custody, backpressure, and parent/control-owned failure.
- Rewrote `parent-watchdog.js` so consumer recovery can authorize the existing exact-parent repair actuator without restoring the old `consumerStalled => kill parent` shortcut.
- Added `controller-child-liveness.js` with startup grace, IPC-age evidence, parent-event-loop-delay veto, and restart cooldown.
- Added `controller-child-repair.js` with exact-child TERM/KILL ownership and lifecycle logging.
- Rewrote `controller-process.js` to supervise child IPC liveness in addition to child exit.
- Rewrote `controller.js` so status exposes child-liveness/repair evidence.
- Rewrote child health composition/publication to expose bounded consumer-recovery state without request identity.
- Added `tunnelExecutionHealth.js` with a 60-second default freshness window and kept stale testimony three-valued/unknown.
- Rewrote `tunnelClient.js` around the focused execution-health module.
- Added `controlRouteActions.js` and rewrote `liveDevices.js` so generation, scheduler, mailbox, server/runtime, history, doctor, cancellation, and instruction actions remain routable through a live transport while execution is degraded.
- Rewrote the top-level tunnel regression runner to discover native-agent, fs-vessel, and full relay tests.

## Audit discoveries requiring a second pass

1. `parent-consumer-repair-ledger.status()` currently rereads the recovery JSON synchronously. Because the independent child snapshots every 500 ms, that would introduce periodic disk I/O into the heartbeat/recovery vessel. The ledger must hydrate once per process and remain memory-backed between rare repair claims.
2. After a cooldown/rate-limit claim denial, `parent-consumer-recovery` keeps the same mature candidate and can recheck the ledger every 500 ms. Candidate state must reset after every claim attempt so denied repair cannot become a tight filesystem polling loop.
3. `parent-watchdog.js` has accumulated assessment, consumer-recovery policy, repair actuation, and snapshot composition in one file. The second pass must split assessment/policy into focused modules rather than compress comments or logic.
4. The new child-liveness policy is in-memory, which is appropriate because its parent process owns exactly one child generation; existing exponential restart backoff plus its 30-second cooldown prevents a local restart storm.
5. Public execution-health freshness is now safer, but focused tests must prove fresh explicit unhealthy still blocks ordinary work while stale/unknown stays routable and repair actions bypass the block.
6. The release runner now discovers source-scattered tests, but the new tests themselves still need to be written after this corrective source pass.

## Second-pass mandate

Complete only the three proven source corrections above, then freeze architecture and enter tests. Do not add speculative process-management machinery. The test pass must prove transient pressure does not repair, sustained corroborated stall does, cooldown prevents storms, child IPC lag is handled safely, stale telemetry cannot self-lock recovery, and exact accepted work survives repair/reconciliation without redispatch.
