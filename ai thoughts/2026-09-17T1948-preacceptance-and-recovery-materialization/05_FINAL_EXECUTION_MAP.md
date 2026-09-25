<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed is He -->
# Final Execution Map

## Lane A — Installer recovery protection
Whole-file rewrite candidates after final status check:
- `geelooy/apps/tunnel/downloads/unix-recovery-lane-install-success.sh`
- focused behavioral test(s) under `geelooy/apps/tunnel/downloads/tests/`

Required behavior:
- install every declared local recovery lane;
- verify every declared lane materially after installation;
- return nonzero/incomplete when protection cannot be materialized;
- never print fully guarded success after a warning-only failure;
- preserve existing primary if recovery protection fails.

## Lane B — Pre-acceptance route recovery
Read first:
- server control-request acceptance ledger/timer;
- route registry/socket close logic;
- request identity/idempotency ledger;
- acceptance timeout tests.

Then split into small modules if necessary:
- acceptance-recovery policy: pre-timeout threshold and request classification;
- route recovery actuator: fence stale socket and await same-identity registration;
- reconciliation: preserve original control/client request IDs and forbid blind mutation replay;
- focused tests for late acceptance, reconnect-before-timeout, mutation ambiguity, and terminal fallback.

## Verification and rollout
1. Syntax/line count/diff checks.
2. Installer lane materialization tests.
3. Server acceptance timeout/reconnect/reconciliation tests.
4. Exactly-once mutation tests.
5. Clean-source integration matrix.
6. Explicit-path commit with protected index verification.
7. Deterministic next manifest/release.
8. Upgrade primary only.
9. Prove four recovery services loaded and command acceptance stable.
10. Inject route/child/launcher failure while rescue stays old/healthy.
11. Upgrade rescue only after primary is proven.
12. Run real browser successor Shliach Mission continuation acceptance.
