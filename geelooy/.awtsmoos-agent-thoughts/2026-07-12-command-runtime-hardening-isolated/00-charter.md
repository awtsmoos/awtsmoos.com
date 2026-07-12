# B"H — Command Runtime Hardening Charter

## Safety boundary

The connected tunnel process remains untouched until an isolated replacement path proves safer. No installer, restart, routing change, live-agent replacement, production-store mutation, or live command-path swap is authorized by this mission.

## Goal

Make command execution reliable for many agents while preventing old jobs, stale responses, worker processes, output files, timers, and in-memory registries from growing without bound.

## Required invariants

1. Every command request, worker, process, output stream, and receipt has explicit identity.
2. A response can resolve only the exact command request that created it.
3. Starting the same canonical command with the same idempotency key coalesces.
4. Reusing an idempotency key with a different command conflicts.
5. Old completed jobs are retained only within explicit count, byte, and age limits.
6. Running jobs are never silently evicted.
7. Missing workers are reconciled after restart.
8. PID alone is never sufficient process identity.
9. Cancellation targets a verified process group and descendants.
10. Output is bounded, paged, and truncation is explicit.
11. Control and status operations remain responsive under heavy command load.
12. Every registry and timer returns to baseline after lifecycle tests.

## Evidence gate

The result is safe for isolated testing only after deterministic, concurrency, process-crash, stale-response, cancellation, retention, restart-reconciliation, resource-leak, and short-soak tests pass. Live migration remains failed until a written rollback plan and longer soak exist.
