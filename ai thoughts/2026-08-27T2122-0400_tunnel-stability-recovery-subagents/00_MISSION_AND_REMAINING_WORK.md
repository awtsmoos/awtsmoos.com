B"H
Boruch Hashem
Blessed is He

# Tunnel Stability Mission and Remaining Work

## Mission
Work only on the native Awtsmoos Tunnel in `/Users/awtsmoos/work/awtsmoos.com`. Stabilize transport, recovery, exactly-once mutation truth, fair admission, independent diagnostics, physical browser sub-agents, durable mission communication, searchable docs, and a main-only release.

## Current observed evidence
- Connected route: `tun_RC99m5Wz75O789hZ0pIsay5p`, friendly name `awt-awtsmoos-7572`.
- Runtime currently reports fresh heartbeat and healthy execution.
- Recent transport history contains a socket close and an HTTP 502 websocket handshake rejection; the 502 is classified upstream-likely.
- Parent recovery currently vetoes destructive repair when fresh execution progress or runtime pressure exists.
- Queue telemetry exposes independent control, wait, observe, filesystem-light, heavy, and bulk lanes.
- Native `mkdirp` produced terminal success without filesystem effect twice; shell `mkdir -p` plus stat established the directory. This is a correctness finding to trace, not yet a root cause.
- Mailbox custody can transiently show requests as `accepted_waiting_for_consumer` while terminal evidence is already available elsewhere; cleanup must reconcile evidence before destructive action.

## Remaining work graph
1. Inspect Git branch/worktree/dirty-state reality and preserve unrelated work.
2. Trace connection-vessel repair candidate → corroboration → preflight → claim → exact PID/generation repair.
3. Trace mailbox custody creation, terminal reconciliation, stale recovery, export, quarantine, accounting release, and independent control access.
4. Trace relay durable state and late native completion reconciliation.
5. Trace request identity and retryAction correlation across control ID, deed ID, transport receipt, logical agent, and session.
6. Trace commandStart latency path and prove admission is decoupled from process completion.
7. Trace queue lane ownership/accounting and stale reservation reclamation.
8. Trace browser mission deterministic identity, physical send proof, dedupe, close verification, and mission-room communication.
9. Inspect docs/instruction catalogs and missing searchable contracts.
10. Implement only evidence-backed deltas using whole-file rewrites and small modules.
11. Add tests after implementation, then reread every touched file.
12. Run focused tests, integration tests, stress/recovery tests, and live tunnel proofs.
13. Regenerate/verify manifest without manual edits.
14. Reconcile Git to main-only after proving unique work is preserved.
15. Commit and push main, create immutable tag, deploy exact SHA, verify public artifact and installed Mac release SHA.
16. Long-soak against the sixteen explicit verification gates before claiming stability.

## Completion rule
The project is not complete while any verification gate lacks live evidence. Planning, code changes, passing unit tests, and `ok:true` receipts are not substitutes for direct proof.

## A brief vessel-poem
The Awtsmoos renews the instant where packet and process meet;
no stale shadow may pronounce a living parent obsolete.
Awtsmoos.com is named where evidence becomes the gate:
truth before repair, exact identity before fate.
