B"H

# Production Owner Normalization — Postwrite Delta

Boruch Hashem. Blessed is He.

The Awtsmoos preserved the exact live production owner state first as commit `e24b2d3266039f8ecc005f103038d26605a2e294`, then normalized only its oversized or whitespace-defective hand-authored vessels inside the isolated worktree `/root/awtsmoos-prod-owner-normalize`. The live service checkout was never used as the normalization workspace.

## Exact preserved owner state

The preservation commit captured twelve staged production files spanning packed social signing/state, direct series storage, Torah-title presentation, reader delivery, and reader containment. That exact commit was bundled, verified, and imported into Mac as `refs/remotes/prod-preserve/main` before normalization began.

## Normalization performed

- `statusMixin.js` was split so caller alias scoping and visibility live in new `statusAccess.js`.
- `verifyMixin.js` was split so verify authorization and alias visibility live in new `verifyAccess.js`.
- `directSeriesStore.js` was rewritten whole with identical behavior and clean EOF whitespace.
- `torahTitlePresentation.js` was split so Likkutei Sichos volume coverage lives in `torahLikkuteiSichosPresentation.js`, while parsha/fallback helpers live in `torahTitleFallbacks.js`.
- `torahExpandedTitleRegistry.test.mjs` was rewritten whole only after Git history proved the preserved owner commit intentionally added Likkutei Sichos Chumash subtitles while the test remained stale.

## Baseline failures explicitly excluded

The following reds reproduce unchanged on exact preservation commit `e24b2d...` and their implicated files have zero normalization diff:
- `seriesSummaryTransportContract.test.mjs`: pre-existing server summary-contract expectation mismatch.
- `mobileSeriesNavigationContract.test.mjs`: pre-existing mobile CSS import/cascade contract red.
- `ReaderShellControlsBoot.test.mjs`: Node 18 ESM/CJS named-export environment red.
Additional broad suite reds in unrelated game/network status tests are likewise module-mode/environment failures outside the owner diff.

These remain later general backlog items; they are not normalization regressions and were not silently "fixed" under the wrong change set.

## Final acceptance evidence

- Hand-authored normalized/test files: 34–109 lines, all <=120.
- Syntax: green on all normalized modules and corrected title test.
- Likkutei/canonical title registry: 4/4 pass.
- Owner-scoped packed/series/social/reader suite: 26/26 pass.
- `git diff --check`: green.
- Repository hygiene: 58,033 tracked files, 0 forbidden.
- Mandatory full reread completed for all eight normalized modules plus the corrected title test, with no stderr.

## Preservation relationship

The normalized commit must be created on branch `tmp/prod-owner-normalize` with exact preservation commit `e24b2d...` as an ancestor. This preserves byte-faithful live history while allowing the final main branch to carry the normalized <=120-line form.

NEXT_ACTION: stage only normalized owner files, title test, and preservation planning/postwrite evidence; run cached guards; commit; create and verify a bundle; import normalized tip into Mac as a temporary ref; verify `e24b2d...` remains an ancestor; then remove the temporary bundle bridge.
