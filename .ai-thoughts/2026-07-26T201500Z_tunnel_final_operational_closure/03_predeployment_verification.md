B"H
Boruch Hashem
Blessed is He

# Predeployment Verification

## Final Operational Source

- Physical stale-binding retention is account-scoped, conservative, dry-run capable, auditable, and preserves current authority, active grants, pins, recent history, and a bounded ordinary audit tail.
- Durable mailbox health exposes count, bytes, utilization, age, degraded/full state, explicit backpressure, redacted evidence export, corrupt-file quarantine, and confirmed exact-ID acknowledgement.
- Transport endings are classified into DNS, network, reset, timeout, proxy, certificate, protocol, configuration, liveness, and unknown categories with bounded failure history.
- Windows installation now stages and verifies before stopping the current runtime, captures manifest-scoped rollback, health-gates normal activation, and automatically restores the prior release on failure.

## Frozen-Tree Evidence

- Manifest version: `1.0.404`.
- Manifest file count: 1,802.
- Syntax, tab indentation, executable mode, 120-line ceiling, manifest freshness, and `git diff --check` passed.
- Nine focused operational closure tests passed together.
- Focused self-preservation completed with exit code 0.
- Relay, binding, discovery, response-contract, Unix route, Termux, HTTP bootstrap, release closure, and packaged startup were exercised; the only combined-gate failure was a nonexistent optional Windows test path, not a source assertion.
- Windows transactional ordering/rollback contract passed directly.

## Old Runtime Interference

The old deployed agent experienced a 56.7-second event-loop stall and repeatedly dropped during final verification. Its stale-worker reaper sent SIGTERM to the full-release and reliability test subprocesses despite their valid long deadlines. Those interrupted jobs are not counted as passing or failing source evidence. They will be rerun after deployment on the independent connection-process runtime.
