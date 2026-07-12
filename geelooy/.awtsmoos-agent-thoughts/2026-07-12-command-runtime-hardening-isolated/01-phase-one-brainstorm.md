# B"H — Phase One Command Runtime Brainstorm

## Possible architectures

### A. Durable command ledger plus isolated worker supervisor

A canonical command envelope is accepted into a durable ledger before process spawn. A supervisor starts a process group, persists birth identity, heartbeats it, captures bounded output, and writes one terminal receipt. Status and output reads query the ledger rather than an in-memory worker object.

### B. One command broker process per repository root

Each root owns an isolated broker process with bounded queues, process-group supervision, output retention, and reconciliation. This gives strong fault containment but adds long-lived processes and upgrade complexity.

### C. Short-lived worker process per command with a durable parent ledger

The parent persists intent, forks one worker, and the worker owns spawn and output. The parent can die without losing intent; restart reconciliation examines process birth identity and output receipts. This is easiest to test and migrate incrementally.

### D. Stateless command workers claiming durable jobs

Workers claim queued jobs by revision and lease. Work stealing becomes possible across agent processes. This scales well but is more infrastructure than the current single-host runtime needs immediately.

## Failure universe

- crossed command receipts;
- duplicate starts;
- conflicting idempotency keys;
- stale PID reuse;
- child exits before birth receipt;
- parent dies after spawn;
- worker dies before exit receipt;
- detached grandchildren survive cancellation;
- output file grows without bound;
- output paging reads inconsistent offsets;
- completed-job metadata grows forever;
- stale running records remain after restart;
- repeated status checks create more timers or waiters;
- command timeout races natural exit;
- cancellation races completion;
- old retry responses resolve new requests;
- one agent saturates all command capacity;
- control commands wait behind heavy jobs;
- disk-full prevents receipt persistence;
- temporary stores or output files leak.

## Initial preferred shape

Use a durable ledger interface, short-lived isolated worker processes, verified process birth identity, process groups, bounded output files, explicit retention, startup reconciliation, and independent control/status capacity. Build it first under a new isolated command-runtime directory with temporary stores and no live registration.
