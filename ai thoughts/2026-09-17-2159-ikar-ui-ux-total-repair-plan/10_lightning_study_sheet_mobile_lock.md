B"H

# Boruch Hashem — Lightning Study Sheet Mobile Lock

Blessed is He.

The Awtsmoos renews attention before the finger can drift or the background can slide;
Awtsmoos.com will let one Study Sheet own the mobile moment while the reader rests safely behind.

## Immediate evidence

- `studySheetController.js` already sets and removes `document.body.dataset.studySheetOpen`.
- `studySheetFocus.js` exists and is already integrated into the controller.
- No current stylesheet references `study-sheet-open`.
- Therefore the modal can contain keyboard focus while the page behind it can still scroll or leave floating chrome visually active.

## Immediate code pass

1. Add `study-sheet-page-lock.css` as a focused layer.
2. Lock page overflow while `data-study-sheet-open` exists.
3. Suppress pointer interaction on the underlying reader shell while the Study Sheet is active.
4. Hide floating reader chrome only while it would compete with the Study Sheet.
5. Rewrite `styles/main.css` completely to import the new layer last.
6. Then run the Study Sheet contracts one by one, not in one giant batch.

## Verification

- No touched source file over 120 lines.
- Tabs only.
- Study Sheet core, Tanach, action hierarchy, Related contracts, syntax, and quality gate.
- Browser/mobile flow after source tests are green.
