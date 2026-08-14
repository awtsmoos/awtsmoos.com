B"H

Boruch Hashem

Blessed is He

# Global UI System Final Execution Contract

The Awtsmoos is beyond stylesheet, focus, motion, width, height, and contrast. The finite flagship must nevertheless have one authoritative visual covenant. This third pass converts the broad brainstorm and inspected improved plan into the exact implementation and verification sequence.

## Final revelations carried forward

1. The runtime root import graph is the immediate correctness boundary.
2. New room/mobile files exist on disk but are absent from the currently loaded root graph.
3. No JS workaround will be added for a CSS ownership failure.
4. Modal focus trapping, focus return, transactional busy/error continuity, and private mutation ownership are already correct and remain unchanged.
5. The global pass is CSS plus one static import-graph test.
6. Existing source-specific owners remain authoritative for meaning; global owners only establish common interaction/accessibility laws.

## Thirty additional refinements beyond the improved plan

1. Make the root import graph test assert both presence and relative ordering, not presence alone.
2. Assert each critical new owner appears exactly once.
3. Assert `accessibility-motion.css` is the final non-comment import.
4. Assert `interaction-system.css`, `accessibility-contrast.css`, and `short-height.css` load before the reduced-motion owner.
5. Load `thread-identity.css` immediately after `thread.css` so semantic header structure precedes responsive room rhythm.
6. Load `mobile-list-density.css` after list base/meta owners.
7. Load `mobile-message-rhythm.css` after base message rhythm.
8. Load `mobile-room-motion.css` after other mobile motion so specific navigation motion wins before reduced-motion nullifies it.
9. Remove every remaining `.messaging-thread-heading` selector from touched shared owners.
10. Do not duplicate `focus-visible` rules in multiple owners; `interaction-system.css` becomes the common focus authority.
11. Keep component-level semantic focus exceptions only if later evidence requires them.
12. Use `outline` rather than box-shadow as the primary focus primitive so forced colors can preserve it naturally.
13. Add a small focus background only where the node has no visible shape, but never use background alone.
14. Use `outline-offset:2px` desktop and allow zero/1px where clipped mobile surfaces require it only after browser proof.
15. Add `scroll-margin` around focused modal/detail controls if fixed chrome can cover them.
16. Keep form input native caret and text selection behavior intact.
17. Add `touch-action:manipulation` only to button-like controls, not scrolling containers.
18. Use `user-select:none` only on decorative/navigation labels where accidental selection harms touch, not on Torah excerpts/messages.
19. Under forced colors, remove translucent background dependence and allow system colors to define surfaces.
20. Preserve selected Public Torah checkbox native forced-color affordance and add a visible left border/current marker.
21. Under increased contrast, raise muted text opacity through tokens instead of dozens of selector-specific overrides.
22. Give warning/danger/error tokens dedicated opaque fallbacks for accessibility.
23. Keep reconnection pulse disabled under reduced motion but preserve the warning dot itself.
24. In short-height mode, reduce rail padding before reducing touch target height; targets remain >=44px.
25. In short-height mode, bottom-nav labels remain visible unless viewport is extremely short; icon-only navigation is rejected because section names matter.
26. In short-height mode, More sheet may use up to ~88dvh but must preserve its close target and internal scrolling.
27. In short-height mode, modal may use up to ~94dvh with smaller radius/padding so forms remain usable.
28. In short-height mode, composer textarea cap drops to 88px but Send remains >=44px.
29. In landscape phone, details drawer padding uses all four safe-area insets and close stays sticky.
30. In landscape phone, Public Torah composer/result scrolling remains internal; no document overflow.
31. Keep body/document overflow hidden as current app-shell law; every long surface owns its own scrolling.
32. Avoid `100vw` inside safe-area padded children where it can create overflow; use inset/width auto.
33. Keep `backdrop-filter` optional: every translucent owner receives a readable solid-ish background first.
34. Add `@supports not (backdrop-filter: blur(1px))` only if needed by direct audit; do not add needless branches preemptively.
35. Keep hover visual deltas modest so mouse and keyboard visual hierarchy stay similar.
36. Use `:active` only for immediate tactile press, not persistent selected state.
37. Preserve `aria-current`, `aria-expanded`, `aria-busy`, and native checked state as semantic truth; CSS keys from them where practical.
38. Keep current section indication via shape + position + label weight.
39. Keep all error text in DOM and visible during retry; global opacity rules must exclude error/status nodes.
40. Make the final browser proof inspect computed `max-height` of room identity as a canary for import graph correctness.

## Exact files to create

### `interaction-system.css`
Owns:
- universal `:focus-visible` coverage;
- pointer-capable hover normalization;
- safe button-like active press;
- disabled/busy cursor/opacity conventions;
- touch-action for button-like controls;
- text selection/caret/accent color.

Does not own:
- semantic selected-state colors;
- component layout;
- consent/error copy.

### `accessibility-contrast.css`
Owns:
- `prefers-contrast: more` token/surface strengthening;
- `forced-colors: active` borders/focus/current/error/selected visibility.

Does not own:
- reduced motion.

### `short-height.css`
Owns:
- max-height <=620px phone/landscape adjustments;
- nav padding/rail density while preserving >=44px targets;
- modal/More/details/composer vertical bounds;
- safe-area-aware landscape spacing.

### `StyleImportGraph.test.mjs`
Reads `style.css` and proves critical owners occur exactly once and in required order; no browser state.

## Exact existing files to rewrite

### `theme.css`
Add/normalize tokens:
- bg/panel/surface;
- line/line-strong;
- text/soft/muted;
- accent/accent-soft;
- focus;
- warning/warning-soft;
- danger/danger-soft;
- shadow/elevation;
- radius tiers;
- touch minimum.

### `components.css`
Keep:
- core button shape;
- pane/thread structural header common law;
- kicker/eyebrow;
- section headings;
- new-action.
Remove:
- hover ownership;
- global focus ownership;
- stale `.messaging-thread-heading` selectors.

### `responsive.css`
Keep tablet/desktop width layout only.
Remove stale thread-heading selector.
Use current `.messaging-thread-identity-detail` only where width-specific hiding is truly needed; otherwise let its own owner decide.

### `modal.css`
Keep current semantic sheet geometry, strengthen:
- safe area;
- max-height/min-width resilience;
- overscroll containment;
- mobile bottom-sheet shape;
- short-height compatibility delegated to `short-height.css`.

### `modal-actions.css`
Base action min 44px; phone 46px.
Busy vs disabled semantics remain visually distinct.
Error uses danger tokens.

### `details.css`
Close target >=44px everywhere.
Safe-area padding and sticky close readability.
Member rows/identity remain visible.
No group management semantics changed.

### `rail.css`
Keep desktop route structure/current indicator.
Remove unguarded direct hover rule; interaction owner handles pointer-capable common hover.

### `style.css`
Canonical exact import graph. Must include existing conversation/mobile owners that are currently missing.
Reduced-motion remains final.

## Import graph ordering covenant

1. theme
2. layout
3. components
4. interaction-system
5. status/loading/empty/onboarding/special/settings/workspace/search/identity
6. rail + badges
7. list + meta + mobile-list-density + relationship
8. thread + thread-identity + message-rhythm + mobile-message-rhythm + composer
9. details + group-details + group-details-mobile
10. modal + modal-actions
11. disclosure
12. activity + activity-journal + activity-journal-mobile
13. discovery + cards
14. presence + metrics
15. Public Torah owners
16. responsive
17. mobile-workspace + mobile-thread + mobile-navigation + mobile-more + mobile-more-items + mobile-motion + mobile-room-motion
18. short-height
19. accessibility-contrast
20. accessibility-motion LAST

## Source gate

Run before browser proof:

- line counts <=120 on every touched/new owner;
- CSS static import test;
- thread identity test;
- composer input test;
- conversation sender test;
- modal focus test;
- modal submission test;
- section policy test;
- Public Torah selection/source-card tests;
- browser import closure;
- `git diff --check` on exact touched owners;
- stale `.messaging-thread-heading` grep absent from rewritten common owners.

## Browser gate

Use a fresh CDP page target if necessary.

Portrait:
- 360x844;
- 390x844;
- 430x932.

Landscape/short-height:
- 844x390;
- 667x375.

Prove:
- critical stylesheets loaded;
- room collapsed identity computes `max-height:0px` on <=430 portrait;
- room title remains visible;
- Back/Details >=44px;
- list row >=58px normal portrait;
- composer 112px portrait, <=88px short-height;
- five nav actions present and >=44px;
- modal within viewport and inputs/actions reachable;
- More within viewport and scrollable;
- details within viewport with 44px close;
- document horizontal overflow false;
- focus-visible outline nonzero on representative nav/summary/input/button;
- reduced-motion durations effectively zero.

If CDP supports media features robustly, additionally prove:
- forced-colors media activation does not erase active/current/error borders;
- prefers-contrast activation strengthens muted/line computed values without layout shift.

## Whole-system regression gate

After browser proof, rerun the current social/privacy/realtime/Public Torah/activity/Related Torah/RAG universe from scratch. No claim of global completion without this fresh result because prior broad job history expired before retrieval.

## Post-write custody

After every full-file batch:
1. reread `style.css` immediately;
2. verify the critical new imports are physically present;
3. run `StyleImportGraph.test.mjs`;
4. do not allow another stale worker to rewrite root imports afterward.

## NEXT_ACTION

Implement the four new global owners first, then rewrite tokens/shared owners, then rewrite `style.css` last and immediately lock its import graph before any browser run.
