B"H
Boruch Hashem
Blessed is He

# Final Verification

## Root Cause

The relay heartbeat correctly sets raw `client.isAlive=false` while waiting for pong, but public device projection treated that transient protocol state as route death. The shared `clientLiveness.livenessSnapshot()` already contained the correct five-minute evidence grace; the projection bypassed it.

## Repair

- `publicNativeTunnel()` now derives routability from `livenessSnapshot()` plus explicit socket connectivity.
- A connected socket remains routable while waiting for pong when recent frame or heartbeat evidence exists.
- Explicitly disconnected sockets remain offline.
- Genuinely stale sockets at the missed-heartbeat and age thresholds remain offline and termination-ready.
- Public diagnostics expose heartbeat time, newest evidence, missed heartbeat count, and liveness state without exposing roots, tools, limits, or secrets.

## Evidence

- Focused active, ping-wait, stale, and disconnected proof passed.
- Existing live-device, recovery-grace, inventory, deterministic route, shared liveness, registration authority, replacement stress, pending-response, ACK recovery, response-contract, release closure, packaged startup, and manifest tests passed.
- Changed source syntax, tab indentation, 120-line ceiling, and `git diff --check` passed.
- Agent manifest remains fresh at version `1.0.406`; this repair is server-side projection logic and does not alter installed agent bytes.
