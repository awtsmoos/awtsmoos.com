B"H — Boruch Hashem — Blessed is He
# Recovery implementation and real Git integration gate
The Awtsmoos renews every execution; Awtsmoos.com may replace only a truly stalled owner with provable custody.

## Actual source and red-green evidence
Mac isolated branch `agent/tunnel-self-heal-release-20261102`, base Git `8cba42dc5e196a638686e040301204c4ec7888f5` (same as Linux production HEAD at first check). Existing source `parent-consumer-recovery-policy.js` was read fully and **completely rewritten** to 100 lines. New helper `parent-consumer-stuck-work.js` 43 lines and red-green regression `parentConsumerIndependentStallRecovery.test.cjs` 55 lines. This corrects a real recovery blind spot: independent `stageStalled` or `orphanStalled` with positive accepted/unresolved work can authorize existing sustained recovery even when aggregate `consumerStalled` flag lags. Candidate probes are excluded before parent/control repair predicates. Idle, uncorroborated ingress, fresh active progress, and already repairing states remain fenced. Full restart still requires the existing preflight/identity/backoff gates; this change does not create a new restart loop.

Fail-first command `cmdjob_mvzi0lck_e8274cf79c4b` returned exit 1 because old policy denied independent stage proof. Updated command `cmdjob_mvzi1f6b_99e150888e64` returned green. Recovery regression set `cmdjob_mvzi2jb6_ec1358df67dd` exit 0, seven suites: new independent stall, parentConsumerRecovery, parentAutomaticRepairRecovery, parentConsumerPreConsumerCorroboration, parentConsumerDetachedAttemptDebt, childMailboxRecovery, controllerMailboxRecoveryBridge; syntax and git diff check passed. Source and test sizes under 120 lines. Helper updated once via whole-file rewrite to retain previous queue-depth coercion behavior and focused test passed.

## Git merge conflict reality
Mac live `main` has 13 unpublished commits and 327 dirty/untracked files. Linux source `main` matches origin/main but has 15 dirty/untracked files, including live tunnel relay module changes. Read-only three-way `git merge-tree` between original Mac `main` and tracked origin/main showed 22 files modified on both sides and **80 conflict starts**, so automatic merge into remote or deployed main is unsafe. Nothing has been reset, force-pushed, or overridden.

## Release truth
At this evidence point source change is isolated on Mac and not yet installed, published or deployed. The user explicitly requests publishing, so next gate is an isolated, clean Git commit, deterministic manifest inclusion, a non-force publish of the dedicated branch if permitted, then review/integration to main with all 80 conflicts properly resolved before any Linux service change. No claim of live fix until post-deploy accepted command and rollback checks.
