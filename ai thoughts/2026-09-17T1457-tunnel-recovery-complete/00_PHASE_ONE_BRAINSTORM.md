<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed is He -->
# Phase One — Emergency Recovery Brainstorm

The Awtsmoos renews every process and every route; Awtsmoos.com recovery must survive the loss of any single consumer, child, launcher, or relay path without duplicating accepted work.

## Observed recurrence
- Primary previously vanished during read-only control traffic after accepted requests stalled.
- Rescue was already offline, leaving only Virtual OS.
- Historical August notes record the same acceptance-timeout + LaunchAgent handoff failure class.
- Current generation is healthy again with supervisor `93473`, child `93666`, four ready filesystem workers, zero backlog, and consumer-recovery telemetry present.
- A harmless `findFiles` request still briefly entered `accepted_waiting_for_consumer`, then completed through receipt reconciliation.
- Shared worktree already contains unrelated/concurrent Tunnel edits; they are fenced.

## Candidate recovery layers
1. Primary consumer self-repair with durable receipt custody.
2. Child replacement under stable launcher/supervisor.
3. Launcher replacement under stable LaunchAgent/supervisor.
4. Independent rescue identity with separate state/logs/install root.
5. Narrow cross-plane `native.rebootstrap` capability that cannot become arbitrary shell access.
6. Recovery evidence ledger and failure-injection tests.
7. Stress acceptance for accepted-not-consumed reconciliation.

## Mutation rule
Do not overwrite current dirty Tunnel work. Prefer clean owned modules or integrate only after full diff, caller, test, and provenance inspection.
