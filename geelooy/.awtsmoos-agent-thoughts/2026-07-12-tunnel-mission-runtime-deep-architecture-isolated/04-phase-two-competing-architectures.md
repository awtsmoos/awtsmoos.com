# B"H — Phase Two Competing Architectures

## Proposal A — Durable operation ledger with keyed state machines

### Shape

A single-host reference runtime persists operation, mission, agent, resource, job, and browser records through store interfaces. Coordinators are pure state machines. Concurrency is partitioned by keys such as tunnel, mission, resource, root, provider, and browser context. External work occurs outside transactions; intent and receipts bracket every side effect.

### Strengths

- Smallest conceptual jump from the current codebase.
- Strong deterministic testing with memory stores and fake clocks.
- Explicit idempotency, correlation, restart recovery, and resource ownership.
- Can begin without a broker or external service.
- Natural compatibility adapters around existing action envelopes.

### Weaknesses

- One host still carries persistence and scheduling responsibility.
- Store design must avoid hidden global contention.
- Event replay and cross-host expansion require later work.

### Operational cost

Low to moderate. SQLite or an existing repository store can be introduced after memory-backed semantics are proven.

### Migration risk

Moderate. Legacy actions can be shadow-adapted one class at a time.

## Proposal B — Hierarchical actor runtime with append-only journals

### Shape

Fleet, project, mission, room, agent, and action actors own mailboxes and append commands and events to journals. Supervisors restart children, rebuild state from snapshots plus journals, and apply scoped control messages.

### Strengths

- Natural independent per-agent runtimes.
- Clear ownership and control precedence.
- Excellent fit for hundreds of agents and work stealing.
- Failure containment and supervision are first-class.

### Weaknesses

- More runtime machinery than the current repository likely needs immediately.
- Actor persistence, mailbox replay, poison-message handling, and supervision semantics are substantial.
- Debugging requires strong actor tracing tools.

### Operational cost

Moderate to high.

### Migration risk

High. Existing action aliases and direct mutation functions do not map cleanly without a broad adapter layer.

## Proposal C — Embedded broker with event-sourced control plane

### Shape

An embedded or external broker carries request, response, stream, mission, control, and resource events. Consumers build materialized views and workers process partitioned subjects. Durable consumer offsets provide replay and reconnect.

### Strengths

- Strong horizontal concurrency and backpressure.
- Natural independent streams, replay, and fan-out.
- Excellent observability and future multi-host scaling.

### Weaknesses

- Introduces broker lifecycle, retention, compaction, and operational dependencies.
- Exactly-once claims remain false without idempotent consumers.
- Harder local installation and debugging.
- Migration touches relay, agent, server, frontend, and persistence together.

### Operational cost

High.

### Migration risk

Very high.

## Proposal D — Stateless workers over a transactional mission database

### Shape

A durable database is the sole coordinator. Workers poll or subscribe for runnable graph nodes, claim by revision, execute one action, and persist results. Agent identity is durable policy plus checkpoints rather than a long-lived process.

### Strengths

- Simple crash recovery and work stealing.
- Easy to scale worker count.
- No long-lived in-memory agent required.
- Claims and graph transitions are transactional.

### Weaknesses

- Interactive human steering and streaming require extra channels.
- Browser and command resources remain long-lived and need supervisors.
- Frequent polling can become expensive or slow without subscriptions.

### Operational cost

Moderate.

### Migration risk

Moderate to high.

## Comparison

| Criterion | A: Ledger + keyed machines | B: Hierarchical actors | C: Broker + events | D: Stateless workers |
|---|---:|---:|---:|---:|
| Understandability | High | Medium | Medium-Low | High |
| Initial implementation complexity | Low-Medium | High | Very High | Medium |
| Request correlation safety | High | High | High | Medium-High |
| Per-agent independence | Medium-High | Very High | High | Medium |
| Restart recovery | High | High | High | Very High |
| Operational simplicity | High | Medium | Low | Medium-High |
| Future multi-host scale | Medium | High | Very High | High |
| Compatibility migration | High | Medium-Low | Low | Medium |
| Frontend truth model | High | High | High | High |
| Test determinism | Very High | High | Medium | High |

## Selection

Select Proposal A as the staged foundation, but borrow:

- actor-style ownership from Proposal B for independent agent runtimes;
- append-only events from Proposal C for audit and timeline, without requiring a broker;
- claim-and-execute boundaries from Proposal D for mission graph nodes.

## Selected staged design

1. Pure protocol and lifecycle schemas.
2. Memory-backed bounded operation, mission, and resource stores.
3. Keyed serial coordinators with parallelism across unrelated keys.
4. Per-agent runtime objects with durable state snapshots and inboxes.
5. Explicit control-lane scheduler.
6. Process and browser supervisors behind ownership interfaces.
7. Append-only redacted event sink.
8. Compatibility adapters that are not wired into live routing.
9. Cross-process workers using temporary directories and stores.
10. Evidence matrix before any shadow or canary proposal.

## Rejected immediate choices

- No broker in the first isolated reference implementation.
- No global actor hierarchy in the first isolated reference implementation.
- No direct rewrite of live relay or agent startup.
- No dual-write into production stores.
- No claim of exactly-once external side effects.
