B"H
Boruch Hashem
Blessed is He

# Phase Two — Exact Child Recovery File Plan

The Awtsmoos lets testimony travel upward before force travels downward. Awtsmoos.com will connect existing semantic evidence to existing exact-child repair without inventing another watchdog.

## Source files to rewrite completely

### `child-runtime-cycle.js`
- Preserve the current 500ms cycle.
- Capture `ChildMailboxRecovery.reconcileIfStale(...)` result.
- Publish it as a bounded `mailboxRecovery` field beside the ordinary child snapshot.
- Fresh cycles report attempted false/healthy testimony; replacement-required cycles remain explicit.

### `controller-message-router.js`
- Keep ACK/READY/REQUEST/STATE/TERMINAL/LOG contracts.
- On STATE, inspect only `state.mailboxRecovery.replacementRequired === true`.
- Derive a bounded stable reason from semantic recovery testimony.
- Notify a parent callback after mirroring the state so diagnostics retain the triggering evidence.

### `controller.js`
- Wire `onRecoveryRequired` to the already-owned process supervisor.
- Keep terminal messages distinct: semantic ambiguity requests child repair, not terminal shutdown of the whole controller.

### `controller-process.js`
- Expose one `requestRepair(reason)` façade over the existing `ChildRepair.request` object.
- Preserve exact PID ownership, existing idempotence, TERM/KILL grace, restart backoff, and liveness repair.

## Tests to add after code

- Fresh mailbox recovery testimony never requests repair.
- Safe pre-result quarantine does not request repair.
- `replacementRequired:true` state requests exactly one child repair reason.
- Repeated replacement-required STATE frames do not send duplicate TERM while same PID is repairing.
- Result-bearing stale custody survives semantic quarantine and requests exact-child replacement.
- Quarantine failure requests exact-child replacement.
- Queue-expired accepted work remains non-retryable; this patch does not weaken exactly-once semantics.
- Existing child liveness, exact child repair, mailbox semantic recovery, and watchdog regressions remain green.

## Runtime proof after release

- Induce/test stale pre-result custody: it quarantines without reconnect.
- Induce/test result-bearing ambiguity: only connection child generation changes; parent/tunnel agent process remains alive.
- Confirm old receipt remains durable/replayable where result testimony must survive.
- Confirm no repeated replacement loop inside cooldown.

NEXT_ACTION: critique the bridge for restart-loop, evidence-loss, and process-boundary hazards before source write.
