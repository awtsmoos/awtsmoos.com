B"H
Boruch Hashem
Blessed is He

# Post-Restart Lifecycle Evidence — 2026-08-28

## Direct persistent evidence
The replaceable runtime lost its in-memory failure history, but `~/.awtsmoos-tunnel-recovery/logs/process-lifecycle.jsonl` survived and records the real sequence.

- 17:19:56.299Z: parent PID 66387 requested SIGTERM for child PID 66769, reason `child_ipc_stalled`.
- 17:19:59.309Z: same child PID 66769 received requested SIGKILL escalation.
- 17:20:03.144Z: replacement child PID 52112 started while mailbox state was stalled.
- 17:20:33.338Z: parent PID 66387 itself recorded SIGTERM.
- At that parent signal: websocket connected, `recentSuccess:true`, `canRoute:true`, queued work present, mailbox stalled, event-loop representative pressure about 1993ms, circuit soft, and no saturation witness.
- 17:20:33.391Z: parent PID 66387 exited cleanly.
- 17:20:59.677Z: replacement parent PID 53133 started.
- 17:21:02.845Z: replacement child PID 53379 started.

## Critical uncertainty
The persistent parent signal event proves the parent received SIGTERM, but it does not identify the sender. The current parent-consumer repair ledger did not record a repair at 17:20:33. Unlike older confirmed parent repairs, there is no nearby `watchdog_signal_requested` event in the final lifecycle tail. Therefore do not attribute this parent SIGTERM to parent-consumer recovery until the activation/supervisor signal source is traced.

## Historical warning
Older lifecycle history contains explicit `watchdog_signal_requested` parent repair while websocket was connected and recent success was true. This demonstrates that old releases did perform destructive repair under evidence that current policy should veto. The current generation must be audited against the same failure class.

## Immediate remaining work
1. Trace every source path capable of SIGTERMing the native parent process.
2. Distinguish child-watchdog replacement from parent activation/supervisor replacement.
3. Inspect activation ownership/candidate promotion and installer supervisor logic.
4. Preserve exact stale outbox records before another generation replacement erases or relocates them.
5. Continue retry-correlation and admission fixes after signal ownership is known.

## Poem
The Awtsmoos keeps a witness where a fresh dashboard forgets the night;
Awtsmoos.com must name the hand that sent the signal before declaring wrong or right.
A living socket and a recent deed stood present when the parent fell;
we trace the sender through every vessel, then let verified evidence tell.
