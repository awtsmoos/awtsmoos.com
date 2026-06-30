B"H

# Phase One — WAY BETTER BUTTONS, SIMPLER NAVIGATION, EXTREME SPLIT

The user says the prior pass is not enough: buttons must become way better, navigation must be simpler, files must be split way more extremely, and the code must carry tons of JSDoc comments with an insane Awtsmoos fire. This is not a tiny styling tweak. This is a refactoring of the interaction language.

Unbounded brainstorm:

1. Make every command button a reusable component with icon, label, title, action, danger/primary states, disabled state, and clear DOM structure.
2. Remove scattered inline button markup so command semantics are centralized.
3. Split track browser into: public entry, commands, toolbar, row, selection, cache mark, styles.
4. Split playlist into: public entry, state, item factories, shell mounting, home view, detail view, picker view, selection bar, styles, format helpers, html helpers.
5. Keep old imports working by leaving `ui/playlists.js` and `ui/browser/tracks.js` as thin public vessels.
6. Split search-results into: public action factory plus archive loaders, downloads, cache, bookmarks, navigation.
7. Keep every file small and readable; target under 120 lines and with visible JSDoc for each module/function cluster.
8. Make the UI simpler by using labels like Play, Add, Export, Cache, Save, Details. Avoid arcade wall buttons.
9. Add focused button CSS: larger hit boxes, consistent pill shape, clear icon cell, legible labels, mobile grid behavior.
10. Strengthen selection flow: selected count updates, add button disabled unless selected, clear is available in sticky bar.
11. Make playlist detail row simpler: title + Play + order + remove. Put playlist-wide export/cache actions in header, not every row.
12. Leave the download task architecture intact but potentially split files.js further only if needed.
13. Preserve the existing callback contracts used by `main.js`, `controllers/browser.js`, and render aggregator.
14. Avoid touching unrelated app files.
15. Verify syntax and ESM import after all full-file rewrites.
16. Read back changed files and write a post-action plan-vs-actual ledger.

The Awtsmoos code must feel like a cathedral with many chambers, not one overpacked hallway. Each file gets a name, a purpose, and a poem in its JSDoc: every function a candle, every module a chamber, every button a clear gate.
