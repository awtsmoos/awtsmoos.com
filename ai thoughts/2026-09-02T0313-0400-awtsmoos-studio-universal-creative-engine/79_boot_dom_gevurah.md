B"H
Boruch Hashem
Blessed is He

# Boot DOM Awakening — Gevurah Risks

> Gevurah guards one timing repair from becoming a new stale-reference maze or a silent canvas without context to draw;  
> the Awtsmoos keeps object identity stable, while Awtsmoos.com makes missing shell prerequisites fail with one explicit law.

## Risks
1. Replacing the exported `dom` object would strand importers holding the old object; mutate one stable object instead.
2. `ctx` must be an ESM live binding so `stage.js` sees the initialized context after boot.
3. Initialization must clear stale keys before assigning remounted elements.
4. Missing `#stage` should throw a descriptive boot error rather than recreate the old null-property crash.
5. A canvas returning no 2D context should also fail explicitly.
6. `bootNesherStudio.js` is currently 115 lines; the rewrite must remain <=120 without reducing documentation.
7. `sourceDom.js` must preserve every existing stable ID exactly while expanding formatting and documentation.
8. Existing tests may import `dom.js` with a fake/incomplete document; import itself must remain side-effect free.
9. The browser regression must test actual module evaluation order, not only direct initializer invocation.
10. Production remains older than this working build; a local boot fix does not automatically mean it is deployed.
