B"H
Boruch Hashem
Blessed is He

# Awtsmoos Tunnel Stability Covenant

> The Awtsmoos preserves one deed through every vessel, generation, queue, and line;
> Awtsmoos.com keeps each witness distinct, so recovery never mistakes old shadow for current sign.

## Why this file exists

On September 1, 2026 the native tunnel repeatedly appeared transport-alive while executable work degraded or disappeared. Live evidence showed requests whose child custody stayed `accepted_waiting_for_consumer` beyond the 30-second lease while the parent runtime already reported `lane_running`, `command_handler_started`, or `executor_worker_assigned`. Health then became `consumer_degraded` / `consumer_stalled`, the route became unroutable, and the supervisor reincarnated it.

Do not simplify the identity/custody/recovery code without rereading this covenant and running the named regressions below.

## Request lifecycle

1. Server reserves one canonical request and records dispatch generation.
2. Connection child durably accepts it into inbox custody.
3. Parent receives the request together with the accepting `childIncarnationId`.
4. Parent queues the same request and mirrors `queued` custody back to that exact child.
5. Runtime advances `worker_starting` then `running` and mirrors those phases back.
6. Terminal result is durably persisted before response delivery.
7. Child custody advances to `result_waiting_for_ack`.
8. Server durably finalizes the response and sends terminal acknowledgement.
9. Native acknowledgement removes exact inbox/outbox evidence.

If any step loses exact identity, stale custody can outlive real execution and poison health.

## Identity taxonomy — never collapse these

- **Physical device identity**: stable machine/device ownership across process rebirth.
- **Runtime incarnation**: one launcher/runtime birth.
- **Child incarnation**: one connection-child process birth; must be globally unique enough to fence stale IPC.
- **Connection/socket generation**: local transport sequencing; it may restart at a small number after process replacement.
- **Registration generation**: server-side generation of a registered route; used for reconnect redelivery safety.
- **Request ID / transport receipt ID**: one canonical request envelope identity.
- **controlRequestId**: idempotency/dedup identity for the requested operation.

A PID, socket generation, or registration generation is never a substitute for `childIncarnationId`.

## Stability invariants

- Parent queue admission must retain the accepting child incarnation.
- Parent execution telemetry alone does not renew child custody; progress must cross IPC.
- Delayed progress from a superseded child must be ignored.
- Parent custody count proves persistence, not execution ownership.
- Mailbox health grace requires exact, non-stale custody in active execution phases.
- Terminal persistence does not mean server ACK exists; preserve `result_waiting_for_ack` until acknowledgement.
- Reconnect redelivery reuses the exact saved envelope and exact IDs.
- Automatic redelivery requires stable `controlRequestId` and a strictly newer registration generation.
- Same-generation recovery observes; it does not redispatch.
- A dead command PID gets bounded terminal-evidence grace before `stale_lost_worker`.
- Identity mismatch receives no such grace; recycled-process protection remains strict.
- Heartbeat/transport health and executable acceptance health are separate planes.
- A gateway 502 or observation timeout never authorizes replay of an uncertain mutation.
- Chrome renderer/CDP pressure is separate from native execution-consumer health.

## Files that own these invariants

- `lib/connection-vessel/controller-message-router.js`
- `lib/connection-vessel/child-custody-progress.js`
- `lib/connection-vessel/child-active-execution-grace.js`
- `lib/connection-vessel/proxy.js`
- `lib/runtime/main-queue.js`
- `lib/runtime/main-run-progress.js`
- `lib/runtime/main-run-result.js`
- `tools/fs/commandJob/reconcile.js`
- `tools/fs/commandJob/reconcileExitEvidence.js`
- server relay `requestDispatchRecovery.js` and `requestDispatchRedelivery.js`

## Regressions that must remain green

- `lib/connection-vessel/custodyProgressBridge.test.cjs`
- `lib/connection-vessel/mailboxCustodyIdentity.test.cjs`
- `lib/connection-vessel/childMailboxRecovery.test.cjs`
- relay `dispatchRestartSafety.test.cjs`
- `testing/commandReconcileExitEvidence.test.cjs`
- `testing/commandExitedBeforeReap.test.cjs`
- `testing/detachedAndStaleWorkerRecovery.test.cjs`
- `testing/workerStaleHeartbeatPreservesLiveProcess.test.cjs`
- `testing/workerReaperProcessGroup.test.cjs`

## Release covenant

A source change is not complete when tests pass. Rebuild the tunnel release artifacts, verify checksum/bundle closure, activate one exact SHA, reinstall exactly once, then prove live custody advancement under >60-second work, >90-second observation, child reincarnation, and reconnect-between-dispatch-and-acceptance. Search logs for `consumer_stalled`, false `stale_lost_worker`, duplicate execution, repeated socket-reset loops, and identity failures.

If a future agent cannot explain why each identity above is different, that agent must not refactor this path yet.
