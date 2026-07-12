# B"H — Phase One: Open Architecture Brainstorm

## Candidate improvements

### Durable command identity

Persist `jobId`, `workerId`, `receiptId`, `controlRequestId`, `clientRequestId`, `idempotencyKey`, `commandHash`, `cwd`, `agentSessionId`, `logicalAgentId`, `missionId`, `processId`, `processGroupId`, and a process birth token. Separate caller identity from process identity and keep both immutable.

### Process supervision options

1. Detached process group per command, with TERM and KILL escalation.
2. Dedicated supervisor subprocess owning all command children.
3. One worker subprocess per command plus a durable parent ledger.
4. Stateless command workers claiming persisted jobs.

The smallest safe step is one detached process group per command, wrapped by a testable process-identity adapter. A dedicated supervisor can follow later if soak evidence shows the main agent still carries too much lifecycle work.

### Store options

1. Existing directory-per-job store with atomic JSON receipts.
2. Append-only JSONL event log plus compacted snapshots.
3. SQLite operation and output-chunk tables.
4. Pluggable store interface with file-backed reference.

The existing directory store is operationally simple and compatible. It should be retained initially, but metadata must become revisioned and output counters must be maintained incrementally rather than by whole-file scans.

### Registry options

1. Process-local active Map with hard admission cap.
2. Durable active index rebuilt at startup.
3. Store-only queries without an active Map.
4. Bounded Map plus durable job store as authority.

Use a bounded active Map for fast status and the durable store as truth. If the active cap is reached, reject new commands with structured overload rather than silently growing.

### Cancellation model

`desiredState=cancelled` is persisted before signaling. The runtime validates process birth identity, signals the process group, waits a bounded grace period, escalates to KILL, records descendant-cleanup evidence, and then writes one terminal receipt. Repeated cancellation returns the same terminal state.

### Startup reconciliation

Scan only nonterminal metadata. For each job:

- validate schema and process identity;
- adopt if the exact process is still alive and adoption is allowed;
- otherwise mark `orphaned` or `stale_lost_worker`;
- request cleanup for a matching process group;
- remove abandoned temporary metadata files;
- rebuild the active registry within its cap.

### Output management

Track bytes and characters in memory and metadata as chunks arrive. Use bounded tail files or chunk files. Never read an entire multi-megabyte file merely to answer status. Record truncation count and original byte total separately.

### Control responsiveness

Status, output paging, cancel, health, and emergency cleanup must remain outside heavy command admission. A command start may be rejected under pressure, but command cancellation and status must remain available.

### Testing universe

- 1,000 short commands with bounded concurrency;
- 100 long commands with concurrent polling;
- reverse-order completions;
- duplicate cancel and status calls;
- parent spawning descendants;
- TERM-resistant descendants;
- process crash before and after each metadata write;
- PID reuse simulation through an injectable identity provider;
- agent restart and startup reconciliation;
- output floods and truncation;
- disk-full and atomic-write failure injection;
- repeated lifecycle cycles with registry, handle, timer, child, and file counts;
- compatibility fixtures for `command`, `commandRun`, `shellCommand`, and job aliases.

## Initial preference

Keep the public command API and file-backed storage, but replace the lifecycle core with small modules for admission, process identity, process groups, terminal transitions, reconciliation, output accounting, and bounded registry ownership.
