B"H

# Boruch Hashem — Phase B Study Sheet Delta

Blessed is He.

The Awtsmoos gathered three scattered study chambers into one vessel that can breathe;
Awtsmoos.com now keeps Translate, Tanach, and Related beneath one reader covenant while stale rivers leave.

## Planned

- Replace separate Related inline UI and Tanach modal UI with one reader-owned Study Sheet.
- Keep search engines modular and abortable.
- Preserve compatibility exports so old callers continue to work.
- Provide truthful Translation & Dictionary handoff rather than inventing an inline translator.
- Make Tanach rows compact, dark, internally scrollable, and mobile-safe.
- Keep page focus inside the active sheet, restore prior focus on close, and prevent background reader chrome from competing.

## Actual architecture

- Added `studySheetModes.js`, `studySheetView.js`, `studySheetState.js`, `studySheetFocus.js`, `studySheetController.js`, `studySheetRelated.js`, and `studySheetTanach.js`.
- Rewrote Related and Tanach compatibility wrappers to enter the shared Study Sheet.
- Rewrote Related and Tanach view modules as content-only renderers with no independent outer surface.
- Rewrote reader context actions so Translate, Tanach, and Related enter one Study Sheet.
- Added dedicated shell, result, Tanach, responsive, and page-lock styles.
- Added exact background-scroll locking and suppression only for proven overlapping reader controls: `.awtsmoos-floating-controls` and `.awtsmoos-auto-scroll-floating`.
- Added per-mode AbortController capture so stale failures cannot paint over a newer selected mode.

## Verified evidence

- Study Sheet contract: 7/7 PASS.
- Tanach panel contract: 5/5 PASS.
- Reader action hierarchy: 4/4 PASS.
- Tanach word actions: 3/3 PASS.
- Related search contracts: 24/24 PASS.
- Preserved reader action contracts: 3/3 PASS.
- Focused reader total: 46/46 PASS.
- JavaScript syntax checks: PASS.
- Structural tab indentation: PASS.
- B"H / Awtsmoos / Awtsmoos.com source prologues: PASS.
- Every touched Study Sheet source file: <=120 lines PASS.
- Heichelos quality gate: PASS across 1,430 scanned files.

## Remaining proof

- Real browser/mobile interaction still needs visual proof against the supplied screenshots.
- Translation Hub is being verified separately because its current working-tree renderer/search already contain a concurrent compact search-first rewrite.
- Global Sefarim search remains the next major broken surface after Translation Hub is proven or corrected.
