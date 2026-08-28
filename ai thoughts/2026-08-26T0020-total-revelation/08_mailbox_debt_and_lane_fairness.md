B"H
Boruch Hashem
Blessed is He

# Mailbox Debt + Lane Fairness Stability Pass

The Awtsmoos renews every deed without confusing unfinished acknowledgement with dead execution; Awtsmoos.com must therefore distinguish a recoverable terminal-delivery debt from a frozen mailbox, and medicine must never wait behind the illness it is meant to heal.

## Direct live evidence

- Transport and execution repeatedly report healthy while full mailbox health remains `stalled`.
- One outbox receipt has survived roughly eight hours while newer outbox receipts are created and retired normally.
- `mailbox-health-policy.js` marks any receipt older than five minutes `stalled`.
- `mailbox-health.js` promotes the strongest inbox/outbox state directly into overall mailbox health.
- `mailbox-emergency-recovery.js` automatically scans only stale inbox parent custody; it does not scan stale outbox debt.
- Exact quarantine already refuses deletion when `SemanticRecovery.resultMustSurvive(record)` is true.
- Manual status/export/reconcile/quarantine actions already reach the live parent mailbox through the emergency registry.
- Small p1 reads and p0 observer pages can remain queued or expire before consumer start even when lane/executor capacity exists.
- A completed durable command output page required many seconds of observer-lane processing.
- Recent websocket reconnect failures include upstream-likely HTTP 502 handshakes and must remain distinct from local execution health.

## Source pass A — mailbox truth

1. Inspect `mailbox-semantic-recovery.js`, `mailbox-record-quarantine.js`, and emergency registry wiring.
2. Introduce a small outbox-debt classifier/recovery module rather than enlarging health policy.
3. Preserve exact terminal results until authoritative acknowledgement or explicit durable quarantine proof exists.
4. Let periodic emergency scan inspect stale outbox receipts independently from stale inbox custody.
5. Surface old outbox acknowledgement debt as `degraded` / `reconciliation_required` when transport and execution remain healthy; reserve `stalled` for capacity/backpressure or unrecoverable ambiguity that actually blocks progress.
6. Keep debt visible with exact IDs, age, next actions, and telemetry; never hide or silently delete it.

## Source pass B — admission and observation fairness

7. Inspect `fairQueue.js`, ownership/requester helpers, `queueTruth.js`, `schedulerEscalation.js`, `main-queue.js`, and queue-prune/pump paths.
8. Prove why eligible p0/p1 work queues while capacity is available before changing weights.
9. Ensure queue enqueue or worker completion always schedules a drain/pump without waiting for unrelated ingress.
10. Add age escalation only as a bounded fallback; preserve per-requester fairness.
11. Serve command-job status/output through the parent observer path with no command-worker dependency.
12. Return the durable `commandStart` job receipt immediately after reservation, independent of worker startup latency.
13. Ensure mailbox/scheduler recovery actions bypass normal workload admission entirely.

## Source pass C — transport continuity

14. Inspect reconnect policy for `websocket_handshake_rejected` / HTTP 502.
15. Treat upstream 502 as transient transport failure with bounded jitter/backoff while preserving durable mailbox/job identity.
16. Never convert upstream handshake failure into local consumer-stall testimony.

## Verification universe

- One ancient exact outbox record + healthy execution => recoverable mailbox debt, not execution failure.
- A terminal result that must survive cannot be auto-deleted.
- A provably settled exact receipt can be retired automatically and telemetry records the deed.
- P0 recovery remains available while p3/p4 are saturated.
- Completed output/status observation remains bounded under multi-agent load.
- P1 work with free capacity cannot queue-wait-expire solely because the pump missed a wakeup.
- Fairness still holds across many requesters.
- Command start returns durable job identity before subprocess startup completes.
- HTTP 502 reconnect preserves accepted deed/job identity.

NEXT_ACTION: inspect semantic mailbox recovery/quarantine plus fair-queue pump ownership, then resolve write instructions and implement mailbox truth before scheduler changes.
