B"H

Boruch Hashem

Blessed is He

# Global UI System Improved Plan

The Awtsmoos is beyond import order and selector ownership, yet the browser can only reveal the UI through the finite stylesheets actually loaded. The first global brainstorm is now narrowed by direct inspection of the real flagship owners.

## Measured revelations from the current tree

1. `style.css` is currently stale: it does not import `thread-identity.css`.
2. It also omits `mobile-list-density.css`.
3. It also omits `mobile-message-rhythm.css`.
4. It also omits `mobile-room-motion.css`.
5. This directly explains the live browser state where `aria-expanded=false` but computed `max-height:none` on room identity detail.
6. `components.css` still contains `.messaging-thread-heading` selectors although the semantic room header now uses `.messaging-thread-identity`.
7. `responsive.css` also still contains stale `.messaging-thread-heading small` ownership.
8. Base components have hover rules unguarded by pointer capability, so touch devices may retain sticky hover styling.
9. Existing focus-visible is good but incomplete: native `summary` and some class-driven clickables need explicit coverage.
10. Theme tokens do not yet expose focus/danger/warning/touch/elevation tiers.
11. `modal.css` already has a solid mobile sheet foundation but does not account for very short-height landscape/keyboard viewports.
12. Modal actions are 46px on phone, but the base desktop minimum is only 42px and should align with the 44px minimum interaction covenant.
13. Details close is 44px on phone but only 40px base.
14. Details drawer safe-area handling is top-only in its detail stylesheet.
15. `layout.css` gives details internal overflow, which is correct and should be preserved.
16. `responsive.css` still assumes width is the only constraint.
17. `accessibility-motion.css` is appropriately global and must remain the final import.
18. `theme.css` provides solid backgrounds before translucent surfaces in most component owners; new system rules should continue that fallback pattern.
19. Rail hover is unguarded by pointer type.
20. The active rail already has a non-color indicator, which should be preserved and strengthened under forced colors rather than redesigned again.

## Thirty improvements to the original brainstorm after inspection

1. Make import-graph repair the first implementation step, not the last.
2. Keep `style.css` as the only flagship root import graph; do not add nested imports to solve runtime ownership.
3. Add a tiny `interaction-system.css` owner for focus-visible, hover-capability, active press, disabled/busy cursor, selection/caret/accent behavior.
4. Add a tiny `accessibility-contrast.css` owner for `forced-colors` and `prefers-contrast` rather than bloating components.css.
5. Add a tiny `short-height.css` owner for landscape/keyboard-height behavior.
6. Keep `accessibility-motion.css` final after every other style owner.
7. Rewrite `components.css` to remove dead `.messaging-thread-heading` selectors and leave structural headers/core buttons only.
8. Rewrite `responsive.css` to remove dead selectors and remain tablet-width ownership only.
9. Rewrite `theme.css` with explicit `--msg-focus`, `--msg-danger`, `--msg-warning`, `--msg-touch`, radius/elevation tokens.
10. Use the focus token consistently rather than reusing accent implicitly.
11. Include `summary:focus-visible` and `.messaging-list-row.is-clickable:focus-visible` in global focus coverage.
12. Include Public Torah result cards only when they are actually keyboard-focusable; do not create fake focus styles for non-focusable nodes.
13. Guard all purely hover visual treatment under `(hover:hover) and (pointer:fine)` in the new global owner.
14. Do not remove component-specific hover rules blindly; global owner should normalize only common surfaces while owners retain semantic accents.
15. Add active press only to safe button-like surfaces, not text inputs/selects.
16. Make disabled buttons `cursor:not-allowed`; reserve `cursor:progress` for explicit busy states.
17. Keep readonly fields visually readable instead of over-fading them.
18. Add `::selection` and caret-color using the accent token for coherent text interaction.
19. Add `forced-color-adjust:auto` globally and explicit Canvas/CanvasText/Highlight-style system colors where needed.
20. Under forced colors, restore visible borders for active nav, selected source result, modal, details, error, and reconnect surfaces.
21. Under increased contrast, strengthen muted text and line tokens without changing layout.
22. Add max-height<=620 rules for mobile rail, special header, modal, More sheet, composer, and details padding.
23. Add landscape safe-area padding to bottom rail and fixed drawers via left/right env insets.
24. Keep five navigation columns; short-height should reduce vertical padding, not collapse destinations.
25. Keep the composer textarea cap unchanged at 112px for normal portrait, but reduce it further under short-height to around 88px so history remains visible when the keyboard/landscape shrinks the viewport.
26. Keep modal sheet max-height near 88dvh in short height rather than the current 72dvh, because a keyboard-height phone needs usable form space more than decorative backdrop.
27. Add a short-height More sheet cap and smaller bottom safe-area reserve while preserving the nav rail beneath it.
28. Keep details full-width phone geometry but add safe-area-aware padding and a sticky close backdrop.
29. Preserve existing modal focus-trap/controller behavior; styles only.
30. Add browser proof for stylesheet presence itself so a future stale-root overwrite is caught immediately.
31. Add a static import-graph test or shell grep asserting all required flagship CSS owners exist exactly once.
32. Add a browser computed-style assertion that `thread-identity.css` is loaded and phone collapsed `max-height` computes to `0px`.
33. Add keyboard focus proof using Tab across nav, room identity, Details, composer, and modal if browser target permits.
34. Add no-overflow proof for 844x390 and 667x375 landscape.
35. Keep status/reconnect non-collapsible and above overlays by z-index contract.
36. Keep destructive actions distinguishable by text and border shape, not color alone.
37. Preserve Public Torah provenance always visible; contrast rules may strengthen it but never fold it.
38. Preserve all privacy/consent semantic state exactly.
39. Do not add swipe gesture navigation in this global pass.
40. Do not add persistent user preference for visual density until an actual setting/backend contract exists.

## Selected file ownership

### New owners

- `interaction-system.css` — common focus, hover capability, active press, disabled/busy, selection/caret.
- `accessibility-contrast.css` — forced colors and increased contrast.
- `short-height.css` — landscape/keyboard-height geometry.
- `StyleImportGraph.test.mjs` — validates critical CSS import ownership/order using file text only.

### Existing owners to fully rewrite

- `theme.css` — design tokens only.
- `components.css` — core buttons/headers, stale thread selector removal.
- `responsive.css` — tablet-width layout, stale thread selector removal.
- `modal.css` — safe/short-height sheet geometry.
- `modal-actions.css` — 44/46px action covenant and busy/destructive semantics.
- `details.css` — safe-area/sticky close/details hierarchy.
- `rail.css` — remove direct hover ownership that conflicts with pointer-capability system; retain route structure/active geometry.
- `style.css` — canonical import graph including every conversation/mobile/global owner exactly once and reduced-motion last.

### Owners to inspect again before final execution

- `MessagingModal.js`
- `MessagingModalFocus.js`
- `MessagingModalSubmission.js`
- `MessagingDetailsController.js` or equivalent details open/close owner.
- `mobile-navigation.css`
- `mobile-more.css`
- `status.css`
- `public-torah-results.css`
- `disclosure.css`

## Rejected ideas for this pass

- No swipe-back gesture recognizer.
- No new backend preference storage.
- No global `transition: all`.
- No hiding of error/reconnect/consent states.
- No replacing native details/summary with custom accordion JS.
- No visual change that requires modifying private-message or Public Torah protocols.

## Proof gates

1. Every new/touched source owner <=120 lines.
2. CSS import graph exact and reduced-motion last.
3. Existing modal focus/submission tests remain green.
4. Existing thread identity/composer/sender tests remain green.
5. Browser import closure remains green.
6. Browser phone collapsed identity computes max-height 0.
7. Portrait 360/390 no document overflow.
8. Landscape 844x390 and 667x375 no document overflow.
9. Modal/details/More stay within visual viewport.
10. All visible primary phone actions >=44px.
11. Reduced motion remains effectively zero duration.
12. Forced-colors/high-contrast rules parse and do not hide selected/current/error state.
13. Final whole social/privacy/realtime universe rerun from scratch.

## NEXT_ACTION

Inspect the modal, details, mobile navigation/More, disclosure, status, and Public Torah result owners and their controllers; then write the third and final execution contract with exact files, exact boundaries, and exact verification sequence.
