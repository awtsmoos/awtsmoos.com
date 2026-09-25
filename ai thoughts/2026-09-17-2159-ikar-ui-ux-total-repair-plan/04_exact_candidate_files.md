B"H

# Boruch Hashem — Exact Candidate File Map

Blessed is He.

The Awtsmoos turns intention toward the exact vessel instead of guessing at the wall;
Awtsmoos.com will re-read every living file before changing any of them at all.

## Mandatory pre-write gate

Before implementation: refresh git status, re-read each candidate completely, inspect direct imports/exports/call sites/tests, reconcile concurrent diffs, then finalize touched files. No candidate below is permission to overwrite a dirty file blindly.

## A — whole-card navigation

Confirmed:

- `templates/heichelos/discovery-results.html`
- `templates/heichelos/ikar-library.html`
- `templates/heichelos/discovery-shell.html` only if secondary-action layout needs shell support
- `geelooy/heichelos/test/heichelosGateway.test.mjs`

Still trace from current Ikar imports: the exact section-card renderer beneath `geelooy/heichelos/heichel/modules/ui/`.

Contract: real anchor card; no public `Open`; Contribute/Manage as sibling controls; no nested interactive elements.

## B — selected-text Study Sheet

Confirmed:

- `geelooy/heichelos/post/functions/ui/context/actions.js`
- `geelooy/heichelos/post/functions/ui/context/relatedSearchLanes.js`
- `geelooy/heichelos/post/functions/ui/context/relatedSearchApi.js`
- `geelooy/heichelos/post/functions/ui/context/tanachPanel.js`
- `geelooy/heichelos/post/functions/ui/context/tanachPanelView.js`
- direct related-result view/controller imports found during full trace
- owning post styles under `geelooy/heichelos/post/styles/ideal/` and `styles/reborn/`

Possible new focused modules only if the call graph proves these boundaries:

- `study-sheet-controller.js` — open/close/mode/request lifecycle
- `study-sheet-view.js` — sheet shell/header/modes
- `study-sheet-state.js` — explicit status transitions
- `study-result-row.js` — compact results

Contract: one selected-text surface; Translate/Tanach/Related modes; stale requests cannot overwrite newer selection; partial lane failure survives; internal mobile scrolling; no presence/floating-control overlap.

## C — Ikar stable first paint

Candidates requiring fresh reconciliation because they are actively dirty/untracked:

- `geelooy/heichelos/heichel/semantic/fallback.html`
- `geelooy/heichelos/heichel/ikar-stable.js`
- `geelooy/heichelos/heichel/ikar-first.js`
- `geelooy/heichelos/heichel/ikar-accessibility.js`
- current section/search modules beneath `geelooy/heichelos/heichel/modules/ui/`
- `geelooy/heichelos/heichel/modules/test/ikarStableGeometryContract.test.mjs`
- related stability/accessibility tests

Contract: useful compact first paint; no disabled fake search; compatible fallback/hydrated geometry; full-card section navigation; no large layout jump.

## D — Translation Hub

Confirmed:

- `geelooy/heichelos/heichel/modules/ui/translation-hub-renderer.js`
- `geelooy/heichelos/heichel/modules/ui/translation-hub-search.js`
- `geelooy/heichelos/heichel/modules/ui/translation-hub-browse.js`
- `geelooy/heichelos/heichel/modules/ui/translation-hub-shared.js`

Conditional after route trace:

- `geelooy/heichelos/routes/heichel/translations/page.js`

Contract: compact heading; immediate search; clickable browse cards; same loading/empty/error/result vocabulary as reader Translate; data adapters remain separate when APIs differ.

## E — global Sefarim search

Candidates:

- `geelooy/mawgawl/sefarim/SearchApp.js`
- `geelooy/mawgawl/sefarim/SearchDiscoveryController.js`
- `geelooy/mawgawl/sefarim/searchView.js`
- `geelooy/mawgawl/sefarim/searchGroupingView.js`
- `geelooy/mawgawl/sefarim/searchDom.js`
- `geelooy/mawgawl/sefarim/searchApi.js` only if behavior requires it
- matching intent/view styles and Node tests

Contract: one obvious query surface; human-facing modes/filters; coherent result state; empty differs from unavailable/error; URL history preserved; keep optional capability-panel fix.

## F — cleanup

Only after A–E are browser-proven: locate unreachable old panels/selectors, remove duplicate UI paths, consolidate genuinely shared card/sheet/state styles, and audit CSS specificity/z-index/safe area/RTL/focus/reduced-motion.

## Execution order

A → B → C → D → E → F.

First remove interaction friction, then repair the reader tools shown broken in the screenshots, then stabilize Ikar boot, then harmonize Translation Hub, then simplify global search, and only afterward delete obsolete systems.
