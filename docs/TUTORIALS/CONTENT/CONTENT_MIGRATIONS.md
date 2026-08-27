B"H
Boruch Hashem
Blessed is He

# Content Migrations

Social carries several storage/model generations, so migrations are first-class operational behavior.

## Observed migration surfaces

Post-v2 dry-run/run routes, packed-content migrations/repair, node-OS migrations, compatibility post/series paths, and newer rich/unified object models.

## Safe migration workflow

1. Identify source/target path contracts.
2. Run dry-run/read-only reporting first.
3. Snapshot/backup affected data.
4. Verify idempotency/re-run behavior in source/tests.
5. Execute narrowly.
6. Reconcile indexes/manifests/references.
7. Validate old/new read paths as required by compatibility promises.

Generated route presence alone is never authorization to run a migration.
