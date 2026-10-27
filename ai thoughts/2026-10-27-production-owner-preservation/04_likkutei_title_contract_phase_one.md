B"H

# Likkutei Sichos Title Contract — Phase One

Boruch Hashem. Blessed is He.

The preserved production owner commit `e24b2d3266039f8ecc005f103038d26605a2e294` deliberately enriches Likkutei Sichos volume titles with the Chumash coverage of each volume. The existing `torahExpandedTitleRegistry.test.mjs` was not changed in that commit and therefore still asserts the pre-owner English strings without subtitles.

## Evidence

- Base `09883acc...` has no coverage-subtitle helper.
- Preserved owner commit `e24b2d...` adds `likkuteiSichosSubtitle()` and wraps the final English title through `withLikkuteiSichosBooks()`.
- Exact preserved `e24b2d...` fails the unchanged test with `Vol. 1 (Bereishis–Vayikra)` and `Vol. 10 (Bereishis)` as actual values.
- Normalization only extracts that same logic into a focused <=120-line helper; it does not invent the behavior.

NEXT_ACTION: define exact subtitle expectations for numbered-family and stable-ID tests, preserving all non-Likkutei assertions unchanged.
