B"H

# Boruch Hashem — Reality Map and Remaining Work

Blessed is He.

The Awtsmoos renews every screen before the eye can call it old;
Awtsmoos.com should reveal one living Torah language, coherent, useful, clear, and bold.

## Mission

Repair the Ikar / Heichelos / post-reader UX as one system rather than polishing isolated broken widgets. The desired result is mobile-first, fast, high-contrast, direct, bilingual where relevant, and predictable across discovery, section browsing, selected-text tools, translation, Tanach search, and global Torah search.

## Evidence from the supplied screenshots

1. Heichel cards still depend on tiny `Open` footer actions instead of making the card itself the obvious navigation target.
2. The Ikar landing hero is oversized and leaves a large empty first viewport while enhancement loads.
3. Section-list pages are visually repetitive and consume too much vertical space, even though the cards themselves are good candidates for direct navigation.
4. The selected-text related-search panel can become a white / low-contrast surface with nearly unreadable status copy.
5. Related search exposes multiple independent lanes vertically (`Quick library matches`, `Related by meaning`, `Exact Hebrew across corpora`), creating repeated loading/error states.
6. Tanach search uses a separate large white modal with long result cards, duplicated open links, and awkward mobile scrolling.
7. Tanach no-result state is another separate modal geometry.
8. Presence (`2 online`) and reader controls can visually collide with overlays.
9. The translation-library workspace and selected-text translation/search tooling present as separate interaction systems.
10. Search and reader surfaces feel like multiple generations of UI layered together rather than one product.

## Verified code ownership

### Heichel discovery

- `geelooy/heichelos/_awtsmoos.index.html` — discovery orchestration.
- `templates/heichelos/discovery-shell.html` — discovery page shell.
- `templates/heichelos/discovery-results.html` — community result cards/actions.
- `templates/heichelos/ikar-library.html` — canonical Ikar library portal.

### Ikar server fallback / boot geometry

- `geelooy/heichelos/heichel/semantic/fallback.html` emits Ikar root and nested section geometry before enhancement.
- It currently emits a disabled `Search this section` input when enough links exist.
- It emits `Choose what to learn` / `Choose a section` and waits for later enhancement.
- Existing stability tests intentionally assert some of this fallback geometry.

### Dedicated translation workspace

- `geelooy/heichelos/heichel/modules/ui/translation-hub-renderer.js` owns `תרגומים ומילון · Translations & Dictionary`.
- It composes `translation-hub-search.js`, `translation-hub-browse.js`, and shared helpers.

### Selected-text related search

- `geelooy/heichelos/post/functions/ui/context/relatedSearchLanes.js` creates separate Quick, Semantic, and Exact/Tanach lanes.
- `relatedSearchApi.js` owns the lane request adapters.
- The screenshot labels map directly to these lane descriptors.

### Tanach selected-text search

- `geelooy/heichelos/post/functions/ui/context/tanachPanel.js` owns the panel lifecycle/state.
- `geelooy/heichelos/post/functions/ui/context/tanachPanelView.js` owns `Tanach search: “…”` rendering.
- `geelooy/heichelos/post/functions/ui/context/actions.js` connects selected-text actions to definition / Tanach / related Torah flows.

### Main search

- `geelooy/mawgawl/sefarim/*` owns library search.
- A stale capability-panel contract previously caused `undefined.dataset`; the controller was rewritten to make the legacy capability surface optional.
- The next work is UX unification, not merely crash prevention.

## Important concurrency constraint

Many Ikar, post-reader, route, and CSS files are already modified or untracked by active work. Before implementation, every candidate file must be re-read from disk and compared with its current git diff. No plan item authorizes overwriting concurrent edits blindly.

## Remaining work graph

- [ ] Freeze a shared mobile interaction contract: spacing, color, surfaces, cards, sheets, focus, safe areas, z-index.
- [ ] Make every public Heichel card itself navigable; remove dependency on a visible `Open` button.
- [ ] Move Contribute / Manage into secondary contextual controls that do not compete with navigation.
- [ ] Make Ikar landing useful in the first viewport without waiting on enhancement.
- [ ] Make Ikar nested section cards fully clickable and denser without becoming cramped.
- [ ] Ensure section search is either functional immediately or absent until ready; never display a disabled fake search control.
- [ ] Unify selected-text translation, related search, and Tanach search under one responsive study sheet.
- [ ] Replace three vertically independent related-search error/loading lanes with one controlled results workspace.
- [ ] Redesign Tanach exact/no-result views for mobile: bounded scroll, sticky header, compact verse results, clear primary action.
- [ ] Fix contrast and typography in selected-text panels.
- [ ] Give translation hub and selected-text translation the same state vocabulary and visual primitives.
- [ ] Simplify main Sefarim search into one query surface with explicit mode/source filters and one result/error contract.
- [ ] Define overlay/presence/bottom-nav stacking so controls never collide.
- [ ] Preserve Hebrew RTL and mixed Hebrew/English typography.
- [ ] Add regression tests for whole-card navigation, hydration stability, overlay geometry/state, selected-text lane switching, Tanach success/no-results, search error states.
- [ ] Verify at 320, 360, 412px mobile widths plus desktop.
- [ ] Verify no horizontal overflow, console errors, stale request races, inaccessible nested links, or bottom-nav overlap.
- [ ] Remove obsolete duplicate CSS/UI implementations only after replacement paths are proven.

## Completion definition

The task is complete only when the core user flows feel like one application: discover a Heichel by tapping its card; enter Ikar instantly; search/browse a section without half-loaded geometry; select Torah text and move among Translate / Tanach / Related in one stable sheet; run global search with intelligible results/errors; and return without layout jumps or overlapping controls.
