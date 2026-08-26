B"H
Boruch Hashem
Blessed is He

# Final Mailbox Recovery Implementation Plan

The Awtsmoos lets one accepted deed remain one deed even when its messenger must be reborn. Awtsmoos.com will connect child-owned semantic evidence to parent-owned exact repair with no new broad kill authority.

## Actual source writes

1. Rewrite `child-runtime-cycle.js`.
	- Capture `ChildMailboxRecovery.reconcileIfStale(mailbox)`.
	- Publish a bounded `mailboxRecovery` testimony beside the ordinary child state.
	- Keep the cycle order: recover, inspect parent, snapshot, publish health/state.
2. Rewrite `controller-message-router.js`.
	- Preserve existing protocol handling.
	- Mirror child STATE first.
	- If and only if `state.mailboxRecovery.replacementRequired === true`, call `onRecoveryRequired(reason)`.
	- Normalize reason to a short stable recovery reason.
3. Rewrite `controller.js`.
	- Pass `onRecoveryRequired` into the router.
	- Delegate to `supervisor.requestRepair(reason)`.
	- Keep TERMINAL handling separate because terminal intentionally prevents restart.
4. Rewrite `controller-process.js`.
	- Expose `requestRepair(reason)` as a narrow façade over existing `ChildRepair.request`.
	- Preserve liveness timer, restart backoff, exact PID checks, TERM/KILL grace, and repair reset.

## Test files after implementation

- Add a focused child-state escalation regression with fake router callbacks.
- Extend/add process supervisor regression proving two replacement-required frames cause only one TERM for the same PID.
- Run existing semantic mailbox recovery tests for pre-result quarantine and result preservation.
- Run child liveness/repair and parent watchdog regressions.
- Run queue-expiry tests to prove `ACCEPTED`, `safeToRetry:false`, and reconciliation semantics remain unchanged.

## Release/live evidence

- Regenerate manifest from final source after the active Mitzvah merge closes.
- Install exact pushed main release.
- During soak, stale pre-result custody must disappear without reconnect.
- Result-bearing semantic ambiguity may replace only the connection child; parent PID and tunnel agent process must remain alive.
- Lifecycle history must record exact child PID/reason and must not show parent SIGTERM from this path.
- Repeated evidence during repair must not produce repeated TERM.

## Separate follow-up nodes

- Scheduler admission fairness and P1/P3/P4 starvation remain separate work.
- P0 status should eventually expose child-owned mailbox evidence directly rather than implying parent-local custody is the whole picture.
- Mitzvah preservation merge resumes only after this stability bridge is source-tested.

NEXT_ACTION: resolve repository write instructions for the four runtime files, inspect their exact final bodies/line counts, rewrite all four completely, then test.
