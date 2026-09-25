<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed is He -->
# Reality and File Map

## Proven runtime facts
- Rescue acceptance timeout reconciled late into successful execution.
- Immediately after that late timeout the native websocket recorded `remote_close_4001:Acceptance recovery` and re-registered as a new connection generation.
- After reconnect, rescue returned to zero unresolved custody and fresh acceptance.
- Therefore the current acceptance-recovery loop is reactive to timeout, not preventive.
- Primary 1.0.620 has fresh heartbeat/source testimony but has also exhibited pre-acceptance stalls.
- The 1.0.620 install did not leave primary recovery service plists loaded.

## Proven installer call graph
- `unix-install-success.sh::complete_install_experience()` calls `activate_local_recovery_lanes()`.
- `unix-recovery-lane-install-success.sh::activate_local_recovery_lanes()` calls `install_recovery_lane_services()`.
- On failure it emits a warning and still returns 0.
- `unix-recovery-lane-launchd.sh` installs each declared recovery pair as an independent LaunchAgent.
- `unix-recovery-lanes.sh` now declares HTTP, socket, file, and guardian lanes.

## Candidate files to inspect before mutation
- `geelooy/apps/tunnel/downloads/unix-recovery-lane-install-success.sh`
- `geelooy/apps/tunnel/downloads/unix-recovery-lane-launchd.sh`
- `geelooy/apps/tunnel/downloads/tests/unixRecoveryLanesContract.test.mjs`
- server/control acceptance-timeout and acceptance-recovery implementation discovered by exact-string search
- native connection lifecycle only if it contains a pre-timeout self-probe hook

## Invariants
- Never replay an ambiguously accepted mutation.
- A forced reconnect may change connection generation, not Tunnel/device identity.
- Installer may preserve a healthy incumbent on lane failure, but must not claim fully guarded success.
- Rescue remains untouched until primary passes the new acceptance/materialization gates.
