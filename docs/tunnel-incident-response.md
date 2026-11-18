# B"H — Awtsmoos Tunnel Incident and Recovery Runbook

The Awtsmoos sustains the guardian. When a tunnel drops, preserve its identity, trace the real error and prefer recovery over destructive reinstall.

## Severity and initial triage

**SEV1:** users cannot authenticate, cross-account authorization fails, or production data may be exposed. Stop release promotion, preserve logs and obtain a security review. **SEV2:** public installer HTTP fails, a tunnel repeatedly disconnects, or pairing stalls. **SEV3:** one page is missing controls or one device needs an authorized restart.

First verify public endpoints without credentials:

```bash
curl -fsSI --max-time 10 https://awtsmoos.com/apps/tunnel-control/
curl -fsSI --max-time 10 https://awtsmoos.com/api/tunnel/install/unix
```

On the Linux host (authorized admin session only), check `systemctl show awtsmoos-native-supervisor.service -p ActiveState -p Restart -p MainPID` and `systemctl is-active awtsmoos.service`. A process or heartbeat does not prove native command acceptance; test a bounded read-only action through the owning route. Avoid printing keys, cookies or device pairing tokens.

## Offline native agent

Check deliberate stop marker `~/.awtsmoos-tunnel/stop-supervisor`, then its PID and process signature. Inspect redacted supervisor logs. If the native supervisor is truly inactive and an intentional stop is absent, restart **the existing installed supervisor service** under admin authorization and confirm that the *same registered device* reconnects. Do not delete identity files, create a new pairing code, or run a forced reinstall solely because of one missed heartbeat. Preserve backups and timestamps.

On Linux, the intended service policy is `Restart=always` with `ConditionPathExists=!/root/.awtsmoos-tunnel/stop-supervisor` in a systemd drop-in. A healthy unit may still be offline due to network or authorization failures; inspect before acting.

## Failed release or installer promotion

Stop additional releases. Record the intended Git SHA, current public manifest SHA, exact error phase and the installer-controller receipt. Compare the sealed artifact before allowing any promotion. If rollback is indicated, use the tested release-specific rollback process and original protected backup; **do not** blindly copy or remove the production `~/.awtsmoos-tunnel` tree. Confirm restored runtime *and* restored device-binding journal, service readiness, same device ID and end-to-end read-only native command acceptance. The local `unixRollbackIsolation.sh` fixture is a regression test, not an authorization to run destructive faults on live hosts.

## CI and support handling

Pull-request `quality` must pass owner/foreign authorization, bootstrap, rollback and candidate-source browser tests. `deploy` is restricted to a push to `main` after quality passes. Check the exact GitHub workflow result and then public SHA after deployment. Store redacted logs with incident ID, first symptom, effect, host, remediation, last known-good SHA, and pass/fail results. Report any missing real-device tests as blockers. Never solicit passwords or pasted full OAuth tokens through support chat.

## Recovery completion criteria

The recovered route matches the original identity; public app and installer are reachable; no installer process remains stuck; authorization is unchanged; bounded native action succeeds; production-quality suite passes; the operator records incident resolution and assigns a monitoring owner. If any proof is missing, mark the incident mitigated, **not** fully resolved.
