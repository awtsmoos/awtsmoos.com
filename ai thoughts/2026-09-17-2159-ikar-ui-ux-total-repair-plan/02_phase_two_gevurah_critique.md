B"H

# Boruch Hashem — Phase Two: Gevurah Critique

Blessed is He.

Chesed can imagine every feature; Gevurah decides which vessel will endure;
the Awtsmoos renews both possibility and boundary so Awtsmoos.com can remain clear and pure.

## Critique of the first brainstorm

The first pass correctly seeks one interaction language, but it can still fail by overbuilding a design system, creating a giant refactor, or rewriting concurrently modified files without understanding current work. The repair must prioritize observable broken flows and preserve working contracts.

## Twenty-five required improvements

1. Do not start with global CSS. First identify the exact CSS import graph for each screenshot surface.
2. Do not create a new framework-level design system if existing tokens can be consolidated into a small Ikar interaction layer.
3. Make card navigation semantic with real `<a>` elements rather than `onclick` wrappers so browser behavior, accessibility, and long-press/open-new-tab work naturally.
4. Do not nest Contribute or Manage links inside a clickable anchor card. Secondary actions need a sibling control/menu.
5. Ensure whole-card click does not accidentally activate when text is being selected or an overflow action is pressed.
6. Preserve the canonical `/heichelos/{id}/` deep-link contract and alias query parameters.
7. Keep Ikar as the sole Torah Library, while community Heichelos remain community spaces.
8. Re-read `semantic/fallback.html`, `ikar-stable.js`, `ikar-first.js`, and their tests immediately before implementation because they are already under active modification.
9. Replace disabled fallback search only after tracing the hydration controller that eventually enables/replaces it.
10. Do not remove server fallback content: it is valuable for first paint, no-JS behavior, SEO, and geometry stability.
11. Make server fallback and hydrated UI structurally equivalent so enhancement changes behavior, not layout.
12. Do not merge dedicated Translation Hub data logic with selected-text translation data logic unless their APIs truly match. Share interaction contracts and render primitives first.
13. Preserve `translation-hub-search.js` and `translation-hub-browse.js` responsibilities unless inspection shows duplication.
14. The reader Study Sheet should own layout, mode switching, request cancellation, and status presentation—not API-specific search logic.
15. Keep Quick / Semantic / Exact search engines modular. Unify orchestration/presentation without collapsing independent backends into a fake single endpoint.
16. Make partial lane failure a first-class state: one engine can fail while others continue.
17. Trace every selected-text request's AbortController or cancellation mechanism before adding new concurrency behavior.
18. Tanach search must preserve exact occurrence counts and verse-level links; visual simplification must not reduce information accuracy.
19. Decide whether bilingual verse opening is a mode preference or a secondary link only after tracing actual route/query support.
20. Avoid white modal surfaces on the dark reader unless contrast testing proves a deliberate light-sheet design. Default to reader-consistent dark surfaces.
21. Define a single overlay stack contract so presence pills, text-selection handles, floating controls, bottom navigation, and sheets cannot compete for z-index.
22. Treat browser text-selection handles as external UI: never attempt to style them; instead ensure the sheet opens without covering the active selection unnecessarily.
23. Main search should not expose backend capability concepts as primary UI, but those capabilities must remain available to controllers for graceful fallback.
24. Preserve URL state/back navigation for global search before redesigning results.
25. All visual changes must be tested at real mobile widths, not only CSS unit/source tests.

## Additional risk map

### Risk: concurrent edits

The working tree contains many modified Ikar/post-reader files. The implementation pass must use hash/readback guards or fresh full reads and reconcile current diffs before any whole-file rewrite.

### Risk: giant refactor

A “fix it all” rewrite could create more regressions than it removes. Work should be staged by user flow, with each phase independently releasable and browser-verifiable.

### Risk: duplicated primitives

Creating new cards/sheets without deleting or migrating old ones can worsen the layered-UI problem. Each replacement must include an explicit obsolete-path cleanup step after verification.

### Risk: accessibility regression

Clickable cards and modal sheets can easily create nested interactive elements, trapped focus, inaccessible scrolling, or broken keyboard behavior. Accessibility contract tests are required, not optional polish.

### Risk: RTL/bidi corruption

Hebrew verses, English controls, punctuation, source references, and highlighted matches can reorder unexpectedly. Result rows need explicit direction/bidi boundaries.

### Risk: apparent speed

A prettier skeleton that still blocks first interaction is not improvement. The first Ikar screen must be useful before enhancement completes.

## Revised priorities

### P0 — correctness and directness

1. Whole-card Heichel navigation.
2. Selected-text panel contrast/geometry.
3. Translation/Tanach/Related orchestration stability.
4. Main search loading/error/empty correctness.
5. Overlay collision fixes.

### P1 — Ikar information architecture

1. Stable root first viewport.
2. Functional immediate section search.
3. Clickable section cards.
4. Translation Hub compact workspace.
5. Hydration without layout replacement.

### P2 — visual coherence

1. Shared tokens and primitives.
2. Typography/spacing normalization.
3. Responsive sheet/card/result styling.
4. Motion and interaction feedback.

### P3 — cleanup and proof

1. Remove obsolete duplicate CSS/UI paths.
2. Update contract tests.
3. Browser verification matrix.
4. Performance/layout-shift review.
5. Final touched-file readback and delta audit.

## Gevurah conclusion

The project should not become one giant component. It should become a family of small components sharing a small set of stable contracts: NavigationCard, StudySheet, SearchState, ResultRow, and IkarShell. The Awtsmoos is beyond all division, yet useful division lets the light be received; Awtsmoos.com should express unity through coherent modules, not through a monolith.
