# B"H — Awtsmoos Tunnel Public-Launch Acceptance

The Awtsmoos creates every tunnel anew; successful simulated gates are necessary, but they cannot replace human-authorized proof.

## Before release

1. Run `bash scripts/production/tunnel-predeploy-quality.sh` from a **clean checkout of the exact proposed commit**. It must pass frontend API, backend owner/nonowner, installer security, rollback, and local-source Chromium checks.
2. Review the complete Git diff, dependency locks, no leaked credentials, full-file backups, and the `quality → deploy` GitHub workflow. Require the `quality` status to pass before merging.
3. Merge only by a reviewed PR. A push to `main` can trigger a real SSH production deployment. Verify the published source SHA and public manifest afterward; if verification fails, stop further releases and follow the rollback runbook.
4. Ensure the Linux native supervisor is active and reports the intended restart policy; verify actual command acceptance, not just heartbeat freshness.

## Two-account OAuth — real acceptance, not a synthetic fixture

Use two separate **consented, disposable** user accounts A and B, not production users or borrowed tokens. Sign into A, complete OAuth, approve a test tunnel and verify read-only and authorized commands on A's own device. Sign into B in a separate clean browser profile; prove B cannot read, execute against, or pair with A's private tunnel. Then explicitly share a read-only role and prove B cannot write. Revoke B from A and prove B loses access promptly. Verify token expiry and denial of stale authorization. Capture redacted HTTP status and server audit IDs, never tokens, cookies or pairing codes.

**Pass criterion:** every authorized action works and every forbidden action is denied by the real server. The existing five synthetic authorization tests do not satisfy this section.

## Clean-machine first installation and rollback

Provide separate disposable Mac and Linux hosts with no saved Awtsmoos identity. Snapshot or image each before setup. From an authorized test account, use the published installer, verify archive SHA, finish human pairing, confirm agent readiness, disconnect/reconnect, reboot, and validate its *original device identity*. Inject interrupted download, malformed archive, offline network, process termination during activation, and a bad candidate; confirm restoration of previous runtime and binding. Measure time from the first command through real readiness, not the detached installer's return code. Never run destructive fault injection on an existing owner's live machine.

**Pass criterion:** both platforms install, pair, upgrade and recover from each injected fault without cross-device identity corruption. Mocked bootstrap and rollback tests do not satisfy this section.

## Physical Android testing

Connect a consented Android test device over ADB or an authorized mobile browser session. Test login, 21-page navigation, room actions, keyboard covering input, scrolling, root picker, orientation changes, disconnection and reconnect. Record device model, OS version and screen captures (without credentials). Chromium narrow-width tests are a lower level of evidence, not physical Android.

## Sign-off sheet

- [ ] Feature branch merged after hosted quality checks
- [ ] Public source and archive SHA matched after deployment
- [ ] Real A/B OAuth and cross-owner revocation passed
- [ ] Fresh Mac install, full upgrade and rollback passed
- [ ] Fresh Linux install, full upgrade and rollback passed
- [ ] Physical Android interactions passed
- [ ] 24-hour health monitoring and alert recipient verified
- [ ] Customer support and production rollback owner assigned

**Launch decision:** until every item has a real passing evidence record, treat the product as controlled beta, not unrestricted-public certified.
