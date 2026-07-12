# B"H — Remaining Work

## Known remaining defects

1. The command-job store can report a job as running after the operating-system child has disappeared. This was observed directly during the aggregate virtual-OS run. Its module output could not be read reliably through the same stale tunnel session, so it was not rewritten by guess.
2. The legacy `missionActions.js` contains an internal promise-lock path for direct builder callers. Normal tunnel execution is protected by the new outer transaction queue, but direct test or library callers should be migrated to the common transaction boundary.
3. The connected tunnel process has not reloaded the new source. Restarting the Awtsmoos Tunnel agent is required before live testing `chromeTargetAcquire`, `chromeTargetRelease`, the new command aliases, and the updated scheduler lanes.
4. Chrome is now honestly serialized because the underlying CDP client still owns one global page socket. True parallel browser automation needs one CDP connection per leased target or browser context.
5. The virtual OS received process supervision, canonical tunnel mounts, mobile CSS splitting, and startup-service support. A complete visual rewrite of every OS program remains larger than this verified pass.
6. The stale aggregate command receipt prevented a trustworthy single-line claim that every virtual-OS smoke completed in one uninterrupted run. Focused subsystem tests were used instead.

## Safe next actions

- Restart the tunnel agent, reacquire a scoped Chrome target, and run a two-agent live crossover test.
- Repair command-job reconciliation by checking child liveness, finalizing orphaned records, and bounding retained receipts.
- Add a multi-process stress harness that launches hundreds of tunnel requests across separate Node processes rather than only concurrent promises.
- Add database-backed mission-room end-to-end tests with two browser clients, blocking human messages, Continue, replay, and daemon recovery.
- Continue the OS visual redesign program-by-program using the same future-only cascade and small-module constraints.

## Completion boundary for this pass

This pass closes the verified transport, mission transaction, daemon scheduler, truthful Tunnel Control home, scoped browser queue, supervised OS process, canonical tunnel mount, and Code Node lifecycle work. It does not conceal the command receipt, live-restart, or multi-CDP limitations above.
