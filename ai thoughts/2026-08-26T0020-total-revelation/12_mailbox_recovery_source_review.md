B"H
Boruch Hashem
Blessed is He

# Mailbox Recovery Source Review

The Awtsmoos lets a repair become trustworthy only after the written vessel is reread against the original need. Awtsmoos.com now carries child-owned semantic ambiguity upward as bounded testimony while exact-child repair remains the sole authority that may signal a process.

## Planned

- Preserve durable acceptance and non-retryable accepted queue expiry.
- Let child-local semantic recovery remain the first healer.
- Publish only bounded recovery testimony across IPC.
- Mirror child state before requesting repair.
- Delegate only explicit `replacementRequired:true` to existing exact-child repair.
- Introduce no parent-wide SIGTERM path.
- Keep every source vessel at or below 120 lines without removing documentation.
- Preserve exact child PID ownership and prevent late old-child exits from controlling a newer generation.

## Actual source

- `child-mailbox-recovery-view.js`: 72 lines.
- `child-runtime-cycle.js`: 46 lines.
- `controller-recovery-testimony.js`: 39 lines.
- `controller-message-router.js`: 81 lines.
- `controller-stats-publisher.js`: 45 lines.
- `controller-process-watchdog.js`: 54 lines.
- `controller-process-restart.js`: 54 lines.
- `controller-process.js`: 120 lines.
- `controller.js`: 119 lines.
- No merge markers in the nine-file recovery graph.
- Every JS file passes `node --check`.
- Every new helper and rewritten controller module loads successfully through Node require smoke.

## Architectural delta

The first process-supervisor rewrite remained 125 lines. Instead of compressing it, restart timer/backoff ownership was extracted into `controller-process-restart.js`. This creates a stronger final shape:

- `controller-process-watchdog.js` owns liveness cadence.
- `controller-process-restart.js` owns restart cadence/count.
- `controller-child-repair.js` remains the exact-PID repair authority.
- `controller-process.js` owns generation identity and orchestration only.

The exit callback now captures the exact spawned child object and ignores a late exit from an older generation, preventing stale child events from scheduling a restart over a newer child.

## Behavioral obligations created by success

- Prove bounded recovery view maps quarantine/preservation/failure correctly.
- Prove ordinary child STATE never requests repair.
- Prove explicit result-bearing ambiguity requests one stable exact-child repair reason after mirror.
- Prove repeated ambiguity cannot signal the same PID twice while repair is already active.
- Prove late exit from an old child cannot schedule restart over a newer child.
- Re-run semantic mailbox recovery, child liveness, exact repair, parent watchdog, and queue-expiry contracts.
- Preserve accepted queue-expiry semantics exactly as before.

NEXT_ACTION: inspect the closest existing test harnesses, write focused bridge regressions as complete files, then run the focused and compatibility suites.
