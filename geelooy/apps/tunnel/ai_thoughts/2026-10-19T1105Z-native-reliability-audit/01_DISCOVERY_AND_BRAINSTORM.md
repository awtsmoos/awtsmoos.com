B"H
# Phase One — Discovery and brainstorm
2026-10-19 UTC. No production change authorized until phase three.
## Identity
Remote Mac tool device Yackovs-MacBook-Air.local (MacBookAir7,2; darwin x86_64), installed config tunnelName=awt-awtsmoos-2184. Canonical repo /Users/awtsmoos/work/awtsmoos.com, branch main, HEAD bde3c07c7. No Linux access used.
## Immutable baseline findings
- Repo source genericCognitionReport.js hash 309a2f67..., installed copy 9d6b49e7...; direct diff shows installed handler returns ok:true for inspection-only actions while uncommitted source fails honestly.
- Repo dirty state already existed: modified cognition report, untracked cognitionHonestFallback.test.cjs and unrelated ayzarim/glyph-engine/. Preserve all.
- ps exposes normal supervised launcher PID 80943 and additional older unparented temporary-reinstall launcher PID 10232. Liveness/ownership of each has not been established.
- Native awt status command took 2269 ms, exited 0, reported version 1.0.681 tier=5 supervisor=75332 child=80943. This is CLI total elapsed, not direct API latency.
- Existing STABILITY_COVENANT.md documents parent/child incarnation fencing, queue custody, result ACK and recovery guarantees. Never bypass these guarantees.
## Architecture to map
Control HTTP -> auth -> registration owner -> queue/recovery -> WebSocket relay -> connection child -> parent main queue -> executor worker -> job durability -> child outbox -> server ACK -> client poll. Auxiliary watchdog/recovery lane processes and Merkava browser runtime require independent trace.
## Candidate defects / explanations (not assertions)
Duplicate launcher; stale registration owner; 1012 reconnect losing exact child incarnation; missing progress IPC; stalled worker; serialized queue; event-loop backpressure; slow CLI startup; redundant manifest or filesystem scans; terminal persistence/ack race; polling cadence; oversized payload; browser CDP startup; VM CommonJS/ESM mismatch; falsely positive fallback; source/package/install drift; old archive guardian restoring files.
## Strategies
Capture action stage events with monotonic timings. Prefer deterministic fault injection and readonly live receipts. Compare installed/runtime hashes and process executable roots. Repair isolated confirmed defects in small whole-file modules. Use guarded release with rollback to installed manifest generation. Do not kill processes or reinstall before identifying active owner. Tests must assert actual side effects and terminal receipts, not just positive JSON.
