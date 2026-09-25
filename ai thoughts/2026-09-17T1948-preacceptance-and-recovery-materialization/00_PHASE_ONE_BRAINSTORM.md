<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed is He -->
# Phase One — Pre-Acceptance and Recovery Materialization Brainstorm

The Awtsmoos renews connection and command separately; Awtsmoos.com must therefore refuse to call a heartbeat-only vessel healthy when commands cannot cross into native custody.

## Directly observed failure loop
- Native heartbeat and execution telemetry may remain fresh while a new relay request remains `dispatched_pending_acceptance`.
- The relay may emit `device_request_acceptance_timeout` before the native agent finally consumes the same request.
- The native socket then closes with `4001: Acceptance recovery`, reconnects, and late native success may reconcile after the relay timeout.
- Therefore transport liveness and command-acceptance liveness are distinct.
- 1.0.620 fixed false lease renewal after acceptance, but not this pre-acceptance split.

## Installer reality
- `complete_install_experience()` does call `activate_local_recovery_lanes()`.
- `activate_local_recovery_lanes()` deliberately converts recovery-lane installation failure into a warning and returns success.
- Live 1.0.620 installation completed with no recovery-lane plists/services materialized.
- Therefore installer success is currently weaker than the user-visible claim “verified and guarded.”

## Candidate fixes
1. Make recovery-lane activation a verified postcondition, not a warning-only best effort.
2. Verify every declared lane label/plist after install, including `guardian`.
3. Keep rollback/safety: failed recovery-lane activation must not corrupt a healthy incumbent, but install must report failure/incomplete rather than success.
4. Move acceptance recovery ahead of the relay timeout using bounded native evidence.
5. Preserve exactly-once control-request identity through forced reconnect.
6. Never redispatch a mutation whose acceptance state is ambiguous.
7. Preserve rescue as independent rollback lane while primary is repaired.
