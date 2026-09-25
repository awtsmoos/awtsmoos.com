B"H

# Boruch Hashem — Phase Three: Final Architecture

Blessed is He.

The Awtsmoos is not trapped in any screen, controller, style, or state;
Awtsmoos.com can let many vessels speak one language when their boundaries integrate.

## Final decision

Repair by user flow, not by one giant rewrite. Migrate the broken surfaces onto five small conceptual contracts:

1. `NavigationCard` — semantic whole-card navigation.
2. `StudySheet` — one responsive selected-text container for Translate / Tanach / Related.
3. `SearchState` — idle, loading, partial, empty, unavailable, error, ready.
4. `ResultRow` — compact verse/source/dictionary/search result geometry.
5. `IkarShell` — stable server-first library geometry enhanced in place.

These are concepts, not permission to create a miscellaneous mega-module.

## Forty final refinements

1. Whole-card Heichel navigation is the first visible repair.
2. Use real anchors when destination is known.
3. Remove public `Open` buttons once the card itself is the link.
4. Keep Contribute / Manage as sibling controls, never nested links.
5. Ikar keeps its unique Torah-library identity while using the same direct-navigation rule.
6. Ikar section cards become full-surface links.
7. Preserve text selection in posts; never use global click handlers on reader content.
8. Add shared tokens only where current theme variables are insufficient.
9. Keep one deliberate dark-surface hierarchy; avoid accidental browser-white panels.
10. Give the Study Sheet an internal scroll container.
11. Use a sticky sheet header with safe-area spacing.
12. Demote/hide presence UI while it would overlap an active sheet.
13. Normalize close controls to one accessible size/placement.
14. Selected text is the single source of truth across sheet modes.
15. Mode changes cancel stale requests where supported.
16. Related search keeps independent engines but one coordinated presentation.
17. Lane failure is local; one failing engine must not blank successful lanes.
18. Quick results may appear progressively before semantic/exact completes.
19. Tanach results use concise verse rows.
20. Tanach no-result states give recovery suggestions.
21. Translation Hub and reader Translate share labels/state/result typography, not necessarily backend adapters.
22. Ikar fallback must be useful final geometry, not disabled staging UI.
23. Hydration attaches behavior without replacing large blocks.
24. Remove or shorten long-lived `Enhanced navigation is loading` copy.
25. Root hero must fit identity plus useful action/search in a normal mobile first viewport.
26. Section search appears only when it can actually work.
27. Main Sefarim search keeps capability detection internally but exposes human-facing modes.
28. Search query/mode/filter state must survive history navigation.
29. Test long Hebrew, English, and mixed bilingual titles.
30. Browser tests must reproduce the supplied screenshot flows.
31. Performance acceptance includes no large fallback→hydrated layout jump.
32. Network failure acceptance includes partial-result survival.
33. Accessibility includes focus return after sheet close.
34. Test at 320px width, not only modern large phones.
35. Desktop Study Sheet becomes a sensible drawer/panel.
36. Preserve all existing Heichel/series/post/verse/translation deep links.
37. Every implementation phase starts with fresh reads/diffs because files are concurrently dirty.
38. Rewrite touched files coherently and split real responsibilities instead of patching fragments.
39. Tests follow the first implementation draft; failed tests drive correction passes.
40. Completion requires mobile browser evidence plus console/network inspection.

## Release phases

### A — Direct navigation

Make public Heichel and Ikar-section cards clickable across the entire card. Remove `Open`. Keep secondary contribution/admin actions separate.

### B — Reader Study Sheet

Replace disconnected selected-text panels with one dark responsive sheet. Modes: Translate, Tanach, Related. Preserve selected text across mode switches, cancel stale work, and prevent presence/floating UI collisions.

### C — Ikar stable boot

Make `/heichelos/ikar/` useful at first paint. Compact the hero, remove disabled fake search, make fallback and hydrated geometry equivalent, and make section browsing immediately interactive.

### D — Translation workspace

Keep the dedicated Translation Hub but align its search/result/error/card system with reader translation. Compact the current giant title treatment.

### E — Global Sefarim search

Simplify the visible search surface to query + human-facing mode/filter + one coherent result/state language. Preserve the already-fixed optional capability-panel contract.

### F — Consolidation

Only after A–E are browser-proven: consolidate repeated styles/primitives and delete obsolete panels/CSS/DOM contracts.

## Key invariant

No phase is complete because it “looks better.” Each phase must make the corresponding task easier: tap a card to enter; find Torah immediately; select text and use one contextual tool surface; search with understandable states; return to reading without layout disruption.
