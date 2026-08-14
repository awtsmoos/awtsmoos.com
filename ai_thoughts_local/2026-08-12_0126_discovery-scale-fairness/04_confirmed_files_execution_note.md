B"H

# Discovery Scale & Fairness — Confirmed Execution Note

Boruch Hashem — Blessed is He.

Fresh lifecycle/storage inspection classified this batch **fairness-only**, not persistent-index.

## Why no derived index

- Alias create/update/delete already perform multiple independent filesystem mutations.
- Create writes private ownership then public alias info.
- Update writes public info then private alias metadata; alias ID does not rename.
- Delete removes private ownership, related heichelos, then the public alias tree.
- DosDB exposes ordinary write/create/update/delete/rename/copy but no transaction or multiwrite primitive.
- `_awtsmoos.alias.js` is a broad legacy router; adding another eventually-consistent derived index there would increase consistency debt without removing the underlying non-atomic lifecycle.

## Exact implementation

1. Add pure `helper/profile/feedFairness.js`.
	- Derive deterministic UTC-hour buckets.
	- Compute total alias pages for a 50-handle feed window.
	- Preserve explicit positive `aliasPage` exactly.
	- When `aliasPage` is omitted, rotate `(hourBucket % totalPages) + 1`.
	- Zero or <=50 aliases resolve page 1.
	- Automatic partial last pages wrap to page 1 to refill the window without duplicate aliases.
2. Whole-file rewrite `helper/profile/publicAliases.js`.
	- Preserve every existing People/privacy/search contract.
	- Explicit aliasPage performs one page read and does not count aliases.
	- Omitted aliasPage counts aliases, derives the hourly page, and uses the fair window helper.
	- Public alias source remains nonrecursive `/social/aliases` names only.
3. Add `test/publicFeedFairness.test.cjs`.
	- Prove pure rotation, hourly wrap, explicit-page stability, <=50 behavior, partial-last-page refill, no duplicates, and DB page selection.

## Explicitly unchanged

- No persistent public index.
- No alias lifecycle/router changes.
- No client/style changes.
- No `/search` change.
- Explicit `aliases=` continues to bypass public enumeration in the route layer.
- 50-alias maximum remains.
- No private ownership reads.
- No Git/production/release mutation or production-live claim.
