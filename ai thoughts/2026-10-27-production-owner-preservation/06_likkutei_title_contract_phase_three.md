B"H

# Likkutei Sichos Title Contract — Phase Three

Boruch Hashem. Blessed is He.

The final title test must prove both the new owner-visible subtitle and the old canonical-title protections.

## Acceptance

- Full test file remains <=120 lines and syntax-clean.
- `torahExpandedTitleRegistry.test.mjs` passes 4/4.
- Normalized title modules remain <=120 lines and syntax-clean.
- Owner-scoped packed/social tests remain 26/26.
- `git diff --check` and repository hygiene remain green.
- Exact preservation commit `e24b2d...` stays as an ancestor; the stale test update is a normalization follow-up, not a rewrite of preserved history.

After the test is green, reread all eight normalized modules plus the test, write the owner-normalization postwrite delta, stage the normalized changes and plans, and commit on `tmp/prod-owner-normalize`.
