# B"H — Phase Three: Final Hardening Plan

## Architecture

Use the existing file-backed job store as the compatibility boundary, but replace lifecycle internals with explicit modules:

- admission: active-job caps and structured overload;
- process identity: PID, process group, platform, start token, and safe-match checks;
- process control: spawn group, TERM, grace, KILL, and cleanup receipt;
- transitions: revisioned nonterminal and terminal state rules;
- finalization: exactly-once local finalization and unconditional resource release;
- reconciliation: bounded startup and status-time recovery;
- output accounting: incremental byte/character counters and bounded storage;
- registry: hard active cap plus bounded public snapshots;
- idempotency: command hash and key conflict detection.

## Exact lifecycle

1. Validate command and canonical cwd.
2. Check start admission without blocking status or cancel.
3. Normalize command identity and idempotency.
4. Persist revision-zero intent before spawn.
5. Spawn an isolated process group when supported.
6. Capture process birth identity and persist spawn receipt.
7. Register active ownership and heartbeat.
8. Stream output through serialized bounded writers.
9. On completion, cancellation, timeout, or error, enter one finalization gate.
10. Persist terminal receipt.
11. Stop timers and heartbeat.
12. Release registry and active ownership in `finally`.
13. Trigger terminal-only garbage collection.

## Recovery semantics

- Exact birth identity alive: report or adopt as detached-running.
- PID alive but birth identity unknown or mismatched: do not signal or adopt; mark `identity_unverified` and require reconciliation.
- PID absent: mark stale lost worker.
- Cancellation requested but not cleaned: continue cleanup idempotently.
- Terminal metadata: never return to running.
- Temporary metadata files: remove during reconciliation.

## Test gates

1. Existing command compatibility tests pass unchanged.
2. Deterministic transition and idempotency tests pass.
3. Descendant process cleanup test passes.
4. PID-reuse simulation rejects adoption and signaling.
5. 1,000-command bounded-concurrency stress passes.
6. Concurrent status/output/cancel remains responsive.
7. Agent-process crash and restart reconciliation passes.
8. Repeated start/cancel/complete cycles leave zero active registry entries, timers, owned children, and unexpected files.
9. Output floods remain bounded without whole-file status reads.
10. Short isolated soak reports stable memory, handles, registry size, and latency.

## Migration boundary

Repository source may be updated after isolated proof, but the installed tunnel remains unchanged. A later installation or restart requires an explicit readiness review and rollback plan.

## Readiness rule

The command runtime is not safe for a large fleet until all test gates above have receipts. If any gate remains untested, recommend only low-risk limited agents.
