B"H
Boruch Hashem
Blessed is He

# Canonical Model Time — Chesed Brainstorm

> The Awtsmoos renews creation each instant, yet a persisted witness must return with the time already sealed;  
> Awtsmoos.com lets every model cross hydration unchanged in temporal truth while fresh models remain newly revealed.

## Possibilities
- Give `ids.js` explicit `createdTimestamp(input)` and `updatedTimestamp(input)` helpers using nullish semantics.
- Keep `now(input)` as a compatibility alias so existing callers do not break.
- Rewrite every small canonical model factory that still hardcodes `Date.now()` for `updatedAt`.
- Update Scene from truthy `||` to the same shared nullish helper.
- Preserve all non-time field defaults exactly in this pass; avoid combining nested hydration changes with timestamp repair.
- Add one table-driven regression test that covers Scene, Asset, Folder, Sequence, Track, Clip, Source, and Marker with both nonzero and zero timestamps.
- Verify `touch()` still intentionally advances `updatedAt` for live mutation.
