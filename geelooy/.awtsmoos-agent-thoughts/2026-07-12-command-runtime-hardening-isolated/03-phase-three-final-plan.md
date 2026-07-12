# B"H — Phase Three Final Execution Plan

## Inspection first

Read the current command action registration, command-job store, worker process, process identity, output paging, status, cancellation, retention, startup reconciliation, and tests. Confirm actual imports and module boundaries before creating isolated code.

## Candidate isolated root

`/Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com/geelooy/apps/tunnel/agent/command-runtime-next/`

## Files planned after inspection

- `protocol/commandIdentity.js` — canonical identity and idempotency contract.
- `protocol/commandLifecycle.js` — revisioned lifecycle transitions.
- `store/memoryCommandStore.js` — bounded deterministic reference.
- `store/atomicCommandStore.js` — isolated single-writer durable reference.
- `output/outputLedger.js` — byte counters, truncation, stable pages.
- `process/processIdentity.js` — PID plus birth token validation.
- `process/processGroup.js` — spawn and verified group cancellation.
- `supervisor/admission.js` — per-root and per-owner caps.
- `supervisor/commandSupervisor.js` — intent, spawn, receipt, cleanup.
- `supervisor/reconciler.js` — startup and periodic orphan reconciliation.
- `retention/retentionPolicy.js` — age, count, and byte bounds.
- `observability/snapshot.js` — redacted status and leak metrics.
- `index.js` — isolated exports only.

All modules must remain below 120 lines. Larger responsibilities must be split before testing.

## Test plan

- deterministic acceptance and idempotency;
- duplicate request coalescing;
- stale and mismatched receipt quarantine;
- terminal-state immutability;
- owner-aware admission and status responsiveness;
- output truncation and page stability;
- retention under tens of thousands of completed jobs;
- no eviction of running jobs;
- process birth-token mismatch rejection;
- process-group descendant cancellation;
- worker crash at each lifecycle boundary;
- parent restart and stale-job reconciliation;
- 1,000 concurrent short commands in isolated workers;
- repeated status polling without timer or waiter growth;
- 5,000 start/finish/cleanup cycles;
- short soak with memory, handles, process count, registry size, output bytes, and latency percentiles.

## Migration gate

No live integration until the isolated suite passes and an explicit compatibility, migration, and rollback plan exists. If any requirement remains untested, the final verdict must say so.
