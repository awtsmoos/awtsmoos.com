B"H
Boruch Hashem
Blessed is He

# Phase One — Mailbox Recovery Root Cause

The Awtsmoos renews one deed through socket, child, parent, queue, worker, result, and acknowledgement. Awtsmoos.com must therefore heal the exact vessel that actually owns ambiguity, not a neighboring vessel that merely shares its disk.

## Directly observed architecture

- The connection child creates its own `Mailbox.createMailbox(config)` instance.
- Relay ingress is persisted into the child inbox before execution handoff.
- Parent queue admission happens before the parent sends ACK custody back to the child.
- The child ACK router records `accepted_waiting_for_consumer` in the child-local custody map.
- Queue expiry can therefore correctly mean `ACCEPTED`, `consumerStarted:false`, `safeToRetry:false` because the child already holds durable accepted custody.
- The child runs `ChildMailboxRecovery.reconcileIfStale()` every 500ms before publishing state.
- Pre-result expired custody with an exact ID is semantically quarantined and never redispatched.
- Result-bearing, missing-ID, or quarantine-failed custody sets `replacementRequired:true`.
- `child-runtime-cycle.js` currently discards that recovery result.
- The parent separately creates another mailbox instance and registers `mailbox-emergency-registry` against that parent instance.
- Parent P0 mailbox actions therefore do not directly own the child's in-memory parent-custody map.
- The parent already has an exact-child repair covenant that TERM/KILLs only the currently supervised child PID and is idempotent during repair.

## Root defect

A child-local semantic recovery failure can become visible as repeated stale child health while no parent-side actor receives the `replacementRequired` testimony. The child continues publishing state; the parent emergency registry watches a different mailbox instance; ambiguity may persist until unrelated liveness/watchdog pressure replaces the process.

## Correct repair graph

`child expired custody`
→ semantic recovery
→ safe quarantine when possible
→ `mailboxRecovery` testimony in child STATE
→ parent router observes `replacementRequired`
→ exact current child repair request
→ supervisor replaces only that child
→ durable inbox/outbox remains available for replay/ACK recovery

No accepted mutation is redispatched. No parent-wide SIGTERM is introduced. No generation-0 shortcut exists; generation zero is valid for fresh custody and must never be treated as stale by itself.

NEXT_ACTION: define the minimal source and regression file set that wires this existing testimony into exact-child repair.
