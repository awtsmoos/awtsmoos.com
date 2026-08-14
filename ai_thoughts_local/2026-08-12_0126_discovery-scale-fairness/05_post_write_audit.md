B"H

# Discovery Scale & Fairness — Post-Write Audit

Boruch Hashem — Blessed is He.

This batch began by asking whether a persistent public discovery index should replace request-time alias namespace listing. Fresh lifecycle and DosDB inspection answered that question with a deliberate **fairness-only** classification.

## Why persistent indexing was rejected

- Alias creation already performs independent writes to private ownership and public alias info.
- Alias update writes public info and private metadata separately; alias ID does not rename.
- Alias deletion performs independent cleanup across private ownership, heichel relationships, and public alias storage.
- DosDB exposes ordinary write/create/update/delete/rename/copy, but no transaction or multiwrite primitive.
- Adding another derived index would therefore create another eventually-consistent copy without atomic lifecycle guarantees.
- The 560-line alias helper and broad legacy alias router were intentionally left untouched.

## Actual fairness implementation

### `helper/profile/feedFairness.js`

- Pure deterministic UTC-hour bucket helper.
- Page count is `ceil(totalAliases / 50)` with minimum one page.
- When `aliasPage` is omitted, anonymous discovery rotates `(hourBucket % totalPages) + 1`.
- Explicit positive `aliasPage` is preserved exactly.
- Automatic partial last pages wrap to page 1 to refill the finite 50-alias window.
- Deduplication prevents repeated aliases when wrapping.
- Explicit pages never wrap.

### `helper/profile/publicAliases.js`

- Existing People/privacy/search behavior remains intact.
- Public source remains nonrecursive `/social/aliases` child names only.
- Omitted `aliasPage` counts public aliases, derives the hourly page, and uses the fairness helper.
- Explicit `aliasPage` skips alias count and performs one reproducible page read.
- `MAX_FEED_ALIASES` remains 50.
- Explicit `aliases=` still bypasses public enumeration in `_awtsmoos.publicDiscovery.js`, which was not changed in this batch.

## Tests and correction history

New `publicFeedFairness.test.cjs` proves:

- empty/small/multi-page page math;
- hourly page rotation and wrap;
- explicit-page stability;
- UTC-hour bucket behavior;
- automatic partial-tail wrap-fill;
- no duplicate aliases in a wrapped window;
- runtime DB page selection;
- explicit aliasPage skips `db.count()` and performs exactly one page read.

The first full regression job `cmdjob_mspnxguf_49192aa9439a` ran 53 tests: 52 passed, 1 failed. The sole failure was stale test infrastructure in `publicDiscoveryRoutes.test.cjs`, whose missing-alias mock lacked the newly required `db.count()` method. All product/fairness/privacy/People/Social Hub behavior tests passed.

Only that test was wholly rewritten. Product source remained frozen.

The complete rerun job `cmdjob_mspo1pv5_ae6e62345d7f` exited 0 on the same syntax + 53-test command. Therefore the final court is **53/53 green**, with syntax clean.

No CSS file changed in this batch; the previously green CSS-quality contract remains untouched.

## Exhaustive final reread

Final forensic job `cmdjob_mspo6ela_1637f2cd18db` exited 0 and its complete 22,580-character stdout was inspected. It reread:

- final execution contract;
- confirmed execution note;
- `feedFairness.js`;
- rewritten `publicAliases.js`;
- `publicFeedFairness.test.cjs`;
- corrected `publicDiscoveryRoutes.test.cjs`;
- compatibility `publicAliasDirectory.test.cjs`;
- final line counts, exact candidate Git status, and HEAD.

No implementation discrepancy was found.

Final authored counts:

- `feedFairness.js`: 60 lines.
- `publicAliases.js`: 115 lines.
- `publicFeedFairness.test.cjs`: 95 lines.
- `publicDiscoveryRoutes.test.cjs`: 75 lines.
- `publicAliasDirectory.test.cjs`: 71 lines.

All are <=120 lines.

## Final local state before release-authority proof

Exact candidate status contains only the expected untracked local global-discovery/fairness files. No unrelated work was reverted.

Git HEAD remains:

`6d05136b23e6921060a9ddb62cfefee5469614d3`

## Remaining honest limitation

This batch improves representation fairness, but it deliberately does **not** reduce DosDB's underlying `readdir`/stat cost for `/social/aliases`. A persistent index was rejected because current lifecycle mutation is non-atomic and DosDB has no transaction/multiwrite primitive. Improving namespace listing complexity requires a future storage/index architecture with explicit consistency guarantees, not another best-effort copy.

## Production boundary

Canonical production remains Git-authority and does not contain this local fairness batch. Final closeout is exactly one `npm run bh` safety invocation. Expected safe result: `canonical_git_authority` before any snapshot build/upload, unchanged HEAD, and no new local snapshot artifacts.
