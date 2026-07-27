B"H
Boruch Hashem
Blessed is He

# Phase Two Improved Plan

1. Rewrite `unix.sh` so exact invocation `$PWD` survives the pipeline and Git discovery disappears.
2. Rewrite `unix-install-core.sh` so every invocation downloads, verifies, stages, and activates a fresh candidate.
3. Rewrite `unix-package-config.sh` so only durable fields survive while `root` always becomes override or invocation directory.
4. Rewrite `unix-install-readiness.sh` so workspace health is diagnostic while runtime, registration, and supervision remain gates.
5. Rewrite `unix-activation-rollback.sh` so missing workspace cannot trigger or block recovery.
6. Add isolated project-root, reinstall, identity, and rollback tests.
7. Run syntax, unit, integration, startup, migration, and related suites.
8. Read back every touched file and close deltas.
9. Compare production fingerprints.
10. Create and push a repair branch only after green evidence.
