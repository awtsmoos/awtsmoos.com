# B"H — Remaining Work and Honest Boundaries

## 1. Individual agent queues

The current daemon advances the mission's shared durable next action. Room agents have identities, leases, claims, and message queues, but the daemon does not yet maintain a separate authoritative next-action cursor for every agent. True per-agent Pause/Resume/One Turn requires a runner built around each agent runtime and queue, not merely another UI selector.

Recommended next architecture:

- Persist continuation policy under mission plus agent ID.
- Key scheduler state by mission plus agent.
- Advance the selected agent's own inbox/claim/submission queue.
- Preserve mission-level serialization for shared writes.
- Show shared-mission and individual-agent controls as separate scopes.

## 2. Fleet controls

Pause All, Resume Selected, Drain All, and Stop All remain brainstormed rather than implemented. They should use a bounded server-side batch with preview, idempotency keys, per-mission receipts, concurrency caps, and explicit partial-failure reporting.

## 3. Broader resource ledger

The frontend currently shows scheduler and transaction evidence. A complete leak ledger should also attribute and reconcile:

- command jobs and child processes,
- browser targets and CDP sockets,
- WebSockets and EventSources across every pane,
- pending HTTP requests,
- preview servers and ports,
- Node workers and Blob URLs,
- database handles and temporary files.

## 4. Command-job orphan reconciliation

A previous live run showed a command receipt reporting `running` after its OS child had disappeared. That store still needs child-liveness reconciliation, orphan finalization, bounded retention, and a startup cleanup sweep.

## 5. AwtsmoosDB startup doctor

During this pass, an isolated mission persistence probe initially failed because `core/verifier/index.js` was absent, then succeeded after that file appeared on disk. A startup doctor should verify the complete database module graph before accepting long-running missions.

## 6. Tunnel restart

The connected tunnel process predates these source changes. The frontend files may be served fresh, but new backend action names, scheduler behavior, and routing priority require restarting or refreshing the Awtsmoos Tunnel agent before live use.

## 7. Visual browser review

The panel passed isolated DOM, CSS-import, responsive-source, and syntax tests. A dedicated desktop/tablet/mobile browser screenshot review remains useful after restarting the agent and serving the latest frontend.

## Completion boundary

This pass completes durable shared-mission turn policy, calm frontend controls, revision-safe human mutations, one-turn execution, per-mission scheduler isolation, hidden-pane cleanup, 1,000-cycle leak testing, and compatibility verification. It deliberately does not mislabel shared mission continuation as fully independent per-agent execution.
