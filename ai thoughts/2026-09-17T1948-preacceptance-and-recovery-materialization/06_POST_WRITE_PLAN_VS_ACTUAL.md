<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed is He -->
# Post-Write Plan Versus Actual

The Awtsmoos keeps one deed through changing vessels; Awtsmoos.com now gives a missing native ACK a bounded recovery window before terminal failure while refusing to call an installation guarded when its recovery doors are absent.

## Planned relay behavior
- Add a pre-terminal recovery point below the 15-second device-acceptance timeout.
- Retire only the exact stale registration generation.
- Preserve the same pending request, stored envelope, control/client identity, and nonce.
- Redeliver only through the existing strictly-newer registration recovery covenant.
- Bound retries and preserve the old terminal timeout as final fallback.
- Cancel early-recovery timers on ACK and every terminal finalization.

## Actual relay behavior written
- `requestDispatchPreAcceptanceRecovery.js` retires the exact owned unaccepted route generation only.
- Default pre-recovery delay is 7 seconds; terminal acceptance remains 15 seconds per armed generation.
- One registration generation may be retired once; one request may request at most two route recoveries.
- `requestDispatchRecovery.js` remains unchanged and redelivers the same stored envelope only on a strictly newer registration generation.
- ACK clears both pre-recovery and acceptance timers.
- Terminal finalization clears expiry, pre-recovery, acceptance, and consumer timers.

## Planned installer behavior
- Make local recovery protection a material success condition.
- Accept complete launchd protection or complete portable fallback protection.
- Preserve a healthy incumbent on failure but never print fully guarded success.

## Actual installer behavior written
- `activate_local_recovery_lanes()` returns 1 on incomplete materialization instead of warning + success.
- `complete_install_experience()` calls `install_fail` when recovery lanes cannot materialize.
- Contract tests now exercise both successful and failed activation paths.

## Verification completed so far
- All eight touched files are <=120 lines.
- JS/shell syntax and `git diff --check` pass.
- Focused relay/restart matrix: 6/6 pass.
- Full shared-tree relay acceptance/recovery matrix: 32/32 pass.
- Installer recovery-lane contract passes, including negative materialization case.
- Shared-tree `recoveryLaneIndependence` failure is unrelated concurrent `agentWorkspaceActions.js` contamination (`missing_logical_agent_id`) and is being replayed on pristine committed source with only these eight files overlaid.
- First pristine replay proved relay behavior but omitted one server API dependency; second pristine replay includes `geelooy/api` and is the decisive clean gate.

## Live evidence that motivated the change
- Relay previously emitted `device_request_acceptance_timeout` before native `4001: Acceptance recovery` closed the stale socket.
- A timed-out request later reconciled to successful native execution, proving a terminal-failure / late-execution ambiguity.
- Both primary and rescue have recovered their same identities across route drops during this pass.

## Remaining before release
- Terminal clean-source matrix.
- Full touched-file reread completion.
- Fresh upstream/protected-index check.
- Explicit eight-file commit and non-force push.
- Deterministic 1.0.621 manifest/release, primary-first rollout, fault injection, rescue rollout, then live Shared-Chrome Mission continuation acceptance.
