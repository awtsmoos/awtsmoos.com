B"H

# Production Owner Preservation — Phase One

Boruch Hashem. Blessed is He.

Production contains twelve staged owner files that differ from `origin/main`, including packed social publishing/signing state, direct series storage, Torah-title presentation, reader shell delivery, and a new reader containment stylesheet. These changes are real live work and must never be erased by an image-zero deployment.

## Evidence

- Production HEAD/origin: `09883accd7f722196e43c98ff4ae65b8bc2a5b6c` before preservation.
- All staged files hash-differ from origin; the new reader containment CSS is absent from origin.
- JavaScript syntax is green.
- Cached diff contains 274 insertions / 14 deletions.
- Cached diff-check has one whitespace-only defect: a new blank line at EOF in `directSeriesStore.js`.

## Preservation law

First preserve the exact staged owner state as a local Git commit without rewriting its contents. Then export that commit as a Git bundle containing full blobs and tree history. Only after the bundle is independently imported into the Mac owner checkout may any normalization/refactor occur.

NEXT_ACTION: write the integration/bundle plan, then commit the exact staged owner state on production and create a self-contained bundle outside the tracked tree.
