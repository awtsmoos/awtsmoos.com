# B"H — Phase One Open Brainstorm

## Purpose

This pass deliberately explores the widest safe design space before choosing implementation. It does not authorize live changes.

## Transport possibilities

### A. Durable multiplexed operation ledger

Every request becomes a durable operation row keyed by `controlRequestId`, with a normalized payload hash, immutable identity envelope, lifecycle state, connection epoch, stream offsets, receipts, and waiter registrations. WebSocket connections become delivery channels rather than truth stores. Reconnect asks the ledger what remains.

### B. Per-connection in-memory actor with replicated journal

Each tunnel connection owns an actor mailbox and bounded request table. The actor appends intent and receipts to a durable journal. This reduces shared locking but requires careful actor recovery and journal replay.

### C. Brokered transport core

A local or embedded broker separates producers, tunnel delivery, response correlation, and replay. Subjects partition by tunnel and request. This offers high concurrency and explicit backpressure but introduces broker operations, migration cost, and another failure domain.

### D. Append-only event log plus materialized views

All request, transport, stream, and lifecycle transitions append immutable events. Queryable views derive pending operations, active sessions, and replay windows. Auditability is excellent, but compaction and view consistency become significant responsibilities.

### E. Hybrid control plane and data plane

P0/P1 controls use a tiny independent control channel and store. Normal and heavy work use multiplexed data channels with explicit quotas. This protects Pause, Stop, Drain, Status, and cleanup from browser, filesystem, build, and model load.

## Mission-runtime possibilities

### 1. Actor per logical agent

Each logical agent owns an inbox, scheduler, state machine, lease set, and checkpoint stream. Mission nodes are assigned to actors. Actor isolation prevents one mutable global agent, while a mission coordinator schedules graph dependencies.

### 2. Durable work graph with stateless workers

Workers claim graph nodes by revisioned lease, execute one action, persist receipts, and release. Agents become durable identities and policies rather than long-lived processes. Recovery is simple, but interactive continuity must be reconstructed from checkpoints.

### 3. Hierarchical actors

Fleet -> project -> mission -> room -> agent -> action actors. Each parent enforces caps and policy; each child owns resources. This maps well to control scope but risks too many actor types and complex supervision semantics.

### 4. Transactional state machine service

Every state transition is a command validated against a revision and persisted atomically. Schedulers poll or subscribe for runnable nodes. This is simple to reason about but needs partitioning to avoid a global serialization bottleneck.

## Identity model possibilities

Use immutable composite identities rather than overloaded IDs:

- Transport identity: `tunnelName`, `connectionId`, `connectionEpoch`, `transportSessionId`.
- Request identity: `controlRequestId`, `clientRequestId`, `idempotencyKey`, `nonce`, `requestHash`.
- Execution identity: `actionId`, `attemptId`, `jobId`, `streamId`, `sequenceNumber`.
- Mission identity: `missionId`, `roomId`, `nodeId`, `turnId`, `logicalAgentId`, `agentSessionId`.
- Resource identity: `resourceId`, `resourceType`, `ownerType`, `ownerId`, `resourceOwnerId`.
- Filesystem identity: canonical `root`, canonical `cwd`, normalized resource path, revision.

Every response should carry the immutable expected request envelope and a response receipt. Correlation validation should be pure, deterministic, and shared across relay, client, tests, and diagnostics.

## Desired and observed state

All long-lived entities should expose:

- `desiredState` controlled by human or policy;
- `observedState` reported by the responsible runtime;
- `revision` for optimistic concurrency;
- `lastTransitionAt` and `transitionReason`;
- `health` separated from lifecycle;
- `actor` recording who changed desired state.

This prevents a mission labeled `paused` from concealing an action still finishing, and prevents a browser labeled `stopped` from concealing a leaked CDP session.

## Resource ownership possibilities

A resource ledger can be:

1. In-memory with periodic snapshots: fast but weak after crashes.
2. SQLite-backed: simple transactions and recovery, suitable for one host.
3. Append-only JSONL plus compacted snapshots: inspectable and portable, weaker concurrent mutation.
4. Pluggable store interface with SQLite reference: strongest staged path.

The ledger should never store secrets or raw handles. It stores birth identity, ownership, desired/observed state, heartbeat, cleanup contract, and bounded metadata.

## Control-lane scheduling

A six-lane scheduler should use strict admission and weighted fairness:

- P0 emergency: reserved capacity, never waits behind lower lanes.
- P1 human: low latency, bounded work units.
- P2 coordination: mission graph and claims.
- P3 normal: typical actions.
- P4 heavy: builds, scans, browsers, commands.
- P5 maintenance: compaction, cleanup, telemetry.

P0 may preempt admission but not corrupt an action mid-write. Stop should move an action to a defined cancellation boundary, then escalate cleanup by deadline.

## Command-job possibilities

- Dedicated process supervisor per root.
- One supervisor process with process groups and durable SQLite receipts.
- Worker subprocess per job with a parent-owned watchdog.
- Platform abstraction for process birth identity: PID plus process start token.

Every job start must persist intent before spawn, persist a birth receipt immediately after spawn, heartbeat, collect output through bounded ring buffers or files, and reconcile at startup.

## Browser possibilities

- Shared browser, per-agent contexts, per-target CDP sessions.
- Dedicated browser process per mission for high isolation.
- Pool of browser processes with explicit lease scopes.
- Remote browser provider adapter under the same lease protocol.

Default should be per-agent browser context and per-target CDP session. Shared browsing must be explicit and visible.

## Frontend possibilities

- Fleet board with scoped controls and honest lifecycle states.
- Connection inspector with epochs, pending operations, buffers, and mismatches.
- Resource ledger with cleanup progress and caps.
- Timeline sourced from immutable events.
- Policy presets that expand into concrete values before application.
- Dry-run preview for every multi-agent mutation.

## Failure universe

Transport: crossed responses, stale epochs, replay, duplicate frames, missing final frame, overflow, reconnect storms.

Mission: stale claims, duplicate execution, graph deadlock, unbounded retries, lease loss, human-message races, checkpoint drift.

Jobs: stale PID reuse, detached descendants, lost exit receipt, output overflow, cancellation race, disk full.

Browser: target theft, context leakage, stale CDP session, cookies crossing agents, orphan process, screenshot misattribution.

Frontend: stale local truth, destructive scope ambiguity, hidden partial failure, reconnect fan-out, listener leaks.

Storage: partial writes, corrupted snapshot, schema mismatch, clock skew, compaction loss, full disk.

## Initial preference

The strongest staged candidate is a hybrid: durable operation ledger + keyed mission graph + actor-like per-agent runtimes + pluggable resource ledger + isolated process and browser supervisors + an independent control lane. The next phases must try to disprove this preference.
