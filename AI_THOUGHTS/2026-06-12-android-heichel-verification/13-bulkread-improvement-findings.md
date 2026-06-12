B"H

# Bulkread improvement findings without live view

I read through the active entry files, Home modules, Heichel modules, Reader modules, templates, tests, and visual/beauty JS. This audit is code-grounded only; no live visual inspection was used.

## Overall state
The beauty layer is active in the code:
- Home imports `style/social/home/beauty/index.css` last.
- Heichel imports `style/heichelos/heichel/beauty/index.css` last.
- Reader imports `heichelos/post/styles/reader-beauty/index.css` last.
- Templates are cache-bumped to `beauty-001`.
- Beauty JS is wired in Home, Heichel, and Reader.

## Highest-value improvements found

### 1. Heichel still has duplicated module ownership
`hero.css` still owns topbar, hero stats, hero description clipping, seal, and hero layout, while separate files also own topbar and hero stats:
- `topbar.css`
- `hero-stats.css`
- `kickers.css`
- `responsive.css`

This means the split is not philosophically complete. `hero.css` should only own the hero body. Topbar rules should move fully to `topbar.css`; stat rules should live fully in `hero-stats.css`; label rules should stay in `kickers.css`.

### 2. Heichel imports both old and new responsive systems indirectly
`mobile.css` still exists with responsive rules that mostly duplicate `responsive.css`, but `index.css` currently imports `responsive.css`, not `mobile.css`. This is okay for the active graph, but stale duplication remains and future edits may happen in the wrong file. Either delete/retire `mobile.css` from docs or turn it into a compatibility wrapper importing `responsive.css`.

### 3. Heichel `search.css` and `series-heading.css` duplicate `.series-heading`
Both files style `.series-heading`, `.series-heading h2`, `.series-heading p`. Active import order means `series-heading.css` wins after `kickers.css`, but the ownership is unclear. `search.css` should only own `.series-search-row`, input, and filter chip.

### 4. Heichel still has stale `series-list.css`
The active graph uses `card.css`, `card-media.css`, `card-menu.css`; `series-list.css` remains a large older combined card module. This is dangerous because it contains parallel `.nav-card`, `.nav-card-media`, `.card-menu-panel` rules. It should become a compatibility wrapper or be moved out of the active style directory.

### 5. `bottom-nav.css` and `bulk-actions.css` both define `#bulk-actions-bar`
The same selector exists in both files. Since `bulk-actions.css` imports after `bottom-nav.css`, it wins, but this is needless duplication. `bottom-nav.css` should only own `.geelooy-bottom-nav`; `bulk-actions.css` should own `#bulk-actions-bar`.

### 6. Beauty modules are too thin in some places
A lot of beauty modules are one-rule placeholders. This is okay for architecture, but not full visual potential. The best modules to deepen next are:
- `reader-beauty/title/*`
- `reader-beauty/verses/*`
- `heichel/beauty/cards/*`
- `home/beauty/feed/*`

### 7. Home pointer JS writes CSS vars but CSS does not use them yet
`ambientPointer.js` sets `--home-pointer-x` and `--home-pointer-y`, but no CSS uses those vars. Add a small `home/beauty/atmosphere/pointer-light.css` module that uses these variables, or remove the JS until it has visual effect.

### 8. Reader progress spine can rebuild too often
`postLogic.js` runs beauty repeatedly at delayed intervals. `manifestProgressSpine()` does `replaceChildren()` every time. That is safe but inefficient for long sefarim. Add a tiny signature cache: if chunk count and ids are unchanged, skip rebuilding markers.

### 9. Reader current-section tracking can bind multiple observers
`bindCurrentSectionTracker()` has no idempotency guard. Since `runReaderBeauty()` runs repeatedly, it can create multiple IntersectionObservers. Add a root dataset guard or store cleanup in `window.__awtsmoosReaderBeauty` and call it before rebinding.

### 10. Heichel beauty reruns override `window.__awtsmoosHeichelBeauty`
`bindScrollHeroState()` is guarded, so it does not attach repeated scroll listeners. But each run overwrites `window.__awtsmoosHeichelBeauty` with a new no-op unbind. Not fatal, but sloppy. Return existing beauty state if already active.

### 11. Visual diagnostics can be expensive
`detectScrollBlockers()` scans `body *` and calls `getBoundingClientRect()` and `getComputedStyle()` on each node. `postLogic.js` runs diagnostics repeatedly. For long post pages, this can be expensive. Add throttling or only run blocker detection once after final delayed repair.

### 12. Tests are broad, but not deep enough
Tests check imports, budgets, syntax, no obvious traps. Missing tests:
- ensure `runReaderBeauty()` does not create duplicate observers
- ensure progress spine does not rebuild unchanged markers
- ensure Home pointer variables are used by CSS
- ensure Heichel split ownership avoids duplicate selectors across active modules
- ensure no active module still defines selectors from another module family

### 13. Reader beauty `type-*` modules are currently future-only
They depend on `data-awtsmoos-kind`, but sections may not receive that attribute. Either add classification in `VesselArchitect.manifestSection()` or remove these until real metadata exists.

### 14. Reader section numbering may overlay text
`.scroll-chunk > .section::before` places a large number at `.65rem` top/left. Without added left padding or opacity/position testing, it may collide with text. Safer next: position outside with logical inset, or add padding-inline-start.

### 15. Body pseudo-elements may stack globally
Home beauty uses `body::after`; reader beauty uses `.post-reader...::before/after`; this is probably okay, but global body pseudo-elements from multiple pages can conflict if nav/page wrappers also use body pseudo-elements. Prefer page-root pseudo-elements over `body::after`.

### 16. `awtsmoos-scroll-sovereignty.css` is still too broad
It globally sets all buttons and links to `touch-action: manipulation`. This can affect components outside Home/Heichel/Reader. Better: move broad button/link touch rules into a class-scoped selector or page-specific modules.

### 17. Old revived partial CSS still loads in Heichel templates
Heichel templates still import many `revamped-partials/*` before the split Heichel CSS. This is safe because split imports later, but it is still a CSS war. Long-term: either remove these template imports or create a dedicated legacy compatibility layer.

### 18. Reader main still imports old reborn comment modules only
This is deliberate for comments, but the reader beauty/commentary modules are thin and do not fully style all comment paths. Next audit should bulkread `ideal/reborn/comments.css`, `comment-composer.css`, `inline-comments.css`, and related JS.

### 19. Modal beauty is purely decorative
The modal UX still lacks step/wizard behavior; `beauty/modal/steps.css` exists, but no actual step DOM. Either implement a real wizard or remove the placeholder class to reduce confusion.

### 20. The biggest next non-live improvement
Do a cleanup pass that removes duplicate ownership without changing visual intent:
- rewrite `hero.css` to hero-only
- rewrite `search.css` to search-only
- rewrite `bottom-nav.css` to bottom-nav-only
- rewrite `series-list.css` as compatibility wrapper
- rewrite `mobile.css` as compatibility wrapper
- add idempotency to reader beauty JS
- add pointer-light CSS or remove home pointer JS
- add duplicate-selector tests for active CSS modules

## Suggested next implementation pass

### Phase A: CSS ownership cleanup
Touch:
- `geelooy/style/heichelos/heichel/hero.css`
- `geelooy/style/heichelos/heichel/search.css`
- `geelooy/style/heichelos/heichel/bottom-nav.css`
- `geelooy/style/heichelos/heichel/series-list.css`
- `geelooy/style/heichelos/heichel/mobile.css`

### Phase B: JS idempotency cleanup
Touch:
- `geelooy/heichelos/post/logic/beauty/currentSectionTracker.js`
- `geelooy/heichelos/post/logic/beauty/progressSpine.js`
- `geelooy/heichelos/post/logic/beauty/index.js`
- `geelooy/heichelos/post/logic/visual/scrollBlockerDetector.js`
- `geelooy/heichelos/post/postLogic.js`

### Phase C: Home pointer actualization
Touch:
- `geelooy/style/social/home/beauty/atmosphere/pointer-light.css`
- `geelooy/style/social/home/beauty/atmosphere/index.css`

### Phase D: Tests
Touch/create:
- `geelooy/style/test/heichelNoDuplicateOwnership.test.mjs`
- `geelooy/style/test/homePointerContract.test.mjs`
- `geelooy/heichelos/post/logic/beauty/test/idempotency.test.mjs`

## Bottom line
The current implementation is active and coherent enough, but the code bulkread shows the next ceiling: eliminate duplicated ownership and make beauty JS idempotent. That will improve stability before any live pixel-tuning.
