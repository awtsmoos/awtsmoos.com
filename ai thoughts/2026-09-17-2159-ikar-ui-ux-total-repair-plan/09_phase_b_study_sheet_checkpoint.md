B"H

# Boruch Hashem — Phase B Study Sheet Checkpoint

Blessed is He.

The Awtsmoos gathers many study motions into one readable vessel without confusing their sources;
Awtsmoos.com lets Translate, Tanach, and Related share one sheet while each engine keeps its truthful courses.

## Fresh evidence

- `relatedSearchPanel.js` injects an inline panel after selected reader text.
- `tanachPanel.js` mounts a separate body-level dialog/backdrop.
- `ReaderPortalSurface.js` already provides reader-owned z-index and font tokens for body-mounted UI.
- `menuRenderer.js` already proves a body-mounted mobile sheet pattern exists.
- Related and Tanach request paths already support independent abort/lifecycle handling and should remain modular.
- Selected-text translation currently opens `/heichelos/ikar/series/torah-language-tools?lookup=...`; there is no equivalent clean inline translation adapter in this context layer.
- `post/styles/main.css` is the canonical clean stylesheet import spine.
- Several responsive/floating reader CSS files are concurrently dirty; do not overwrite them.

## First implementation boundary

1. Add `studySheetView.js`: one reader-owned backdrop/dialog, selected-text header, mode controls, scrollable body, close action.
2. Add `studySheetController.js`: one active sheet, focus restore, Escape/backdrop close, mode switching, stale-request abortion.
3. Add `studySheetModes.js`: mode metadata and internal Translation/Dictionary destination.
4. Add focused Related and Tanach study-mode modules that render into a supplied sheet body.
5. Rewrite `relatedSearchPanel.js` and `tanachPanel.js` as compatibility wrappers around the shared Study Sheet.
6. Rewrite `relatedSearchView.js` and `tanachPanelView.js` as content renderers without outer-surface ownership.
7. Rewrite `actions.js` so selected text enters Study Sheet modes instead of separate UI systems.
8. Add clean `study-sheet.css` and import it from clean `post/styles/main.css` after legacy context styles.
9. Write focused tests only after the first code draft.

## Honest Translation contract

Translate mode will provide one primary action into Awtsmoos' existing `torah-language-tools` route with the selected query encoded. It will not claim an inline translation result until a real reader-safe translation adapter is proven. Phase D can deepen this mode without changing the Study Sheet contract.

## Acceptance

- Only one Study Sheet exists at a time.
- Related and Tanach no longer create independent outer panels.
- Switching modes aborts stale work from the prior mode.
- Selected query persists across modes.
- Tanach results scroll inside the sheet and use compact result rows.
- Related lanes render inside the sheet, never inline after selected text.
- Translation stays entirely on Awtsmoos.com.
- Escape/backdrop/close restore previous focus.
- New and touched source files remain below 120 lines.
