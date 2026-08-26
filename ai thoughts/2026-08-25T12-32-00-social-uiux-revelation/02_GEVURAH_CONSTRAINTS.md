# B"H
# Boruch Hashem
# Blessed is He

# Phase II — Gevurah: Boundaries, Failure Modes, and Twenty Improvements

> Chesed opened every door; Gevurah asks which doors can bear the floor. / The Awtsmoos gives the light, the keli gives it shape; / on Awtsmoos.com restraint prevents a beautiful idea from becoming an unstable escape.

## Non-negotiable boundaries
- No source edit before tracing imports, exports, routes, consumers, and runtime data shapes.
- No partial file edits. Every touched source file is rewritten in full.
- No unscoped global visual rules introduced.
- No CSS selector may rely on a generic class name that plausibly collides across routes.
- No fixed/sticky element without measured space reservation and mobile safe-area behavior.
- No arbitrary z-index escalation. Overlays must belong to a documented local stacking scheme.
- No animation that changes layout continuously; prefer transform/opacity and honor `prefers-reduced-motion`.
- No JavaScript abstraction merely for aesthetic architecture. Every class/module must own a real responsibility.
- No renamed public route/API contract without evidence and compatibility analysis.
- No generated/vendor/minified artifacts manually rewritten.
- No touching secret-like files.
- No installation/deletion/destructive commands.

## Failure reconstruction
1. Global CSS collision makes unrelated pages look wrong.
2. New fixed rail hides content on iOS/Android safe areas.
3. Sticky header stacks beneath modal or above dialog unexpectedly.
4. Hover-only affordance disappears on touch devices.
5. Focus styling is removed or obscured.
6. Animation produces nausea or jank on low-end devices.
7. Feed requests race; older response overwrites newer filter result.
8. Re-render duplicates event listeners and actions fire twice.
9. Alias/heichel metadata shape varies and crashes renderer.
10. Reader navigation mutates URL without preserving back behavior.
11. CSS `100vh` creates clipped mobile content under browser chrome.
12. Long titles/URLs force horizontal overflow.
13. Loading skeleton dimensions differ from content, causing layout shifts.
14. Action menus open outside viewport.
15. API errors are swallowed and page appears frozen.
16. Refactor introduces circular imports.
17. Over-modularization creates meaningless wrapper files.
18. Naming becomes poetic but semantically opaque.
19. Accessibility semantics regress because visual controls are not native buttons/links.
20. Page-specific improvements duplicate shared behavior instead of using an existing proven primitive.

## Twenty improvements to the first brainstorm
1. Prefer existing project renderers before creating a new DOM generator.
2. Root every page stylesheet under one route namespace even when the CSS file is only locally imported.
3. Use cascade layers only inside a route entrypoint if the existing browser target supports them; do not force a global layer contract.
4. Use CSS custom properties on the route root, not `:root`, for local tokens.
5. Define a small local z-index scale (`base`, `sticky`, `popover`, `modal`) rather than large numbers.
6. Use `min-width:0` on grid/flex children systematically where content can shrink.
7. Use `max-width:100%` and intrinsic sizing on media/code blocks.
8. Keep touch targets at least approximately 44px while visual icons may remain compact.
9. Make hover enhancement additive; primary affordances must remain understandable without hover.
10. Couple every transition with focus-visible and active feedback.
11. Prefer native details/dialog/popover capabilities only after checking project compatibility and graceful behavior.
12. Separate request orchestration from rendering so cancellation/races can be fixed without UI churn.
13. Normalize API data at a boundary rather than sprinkling optional chaining everywhere.
14. Add deterministic empty/error/loading state data so testing can assert states.
15. Use delegated events only when DOM ownership is stable and event semantics remain obvious.
16. Preserve route scroll/back behavior explicitly during reader upgrades.
17. Keep module names conventional enough that future developers can search them; Kabbalah names should explain layer responsibility, not hide domain meaning.
18. Verify no touched file exceeds the project line guidance; split by responsibility rather than by arbitrary line count.
19. Browser-test at narrow mobile, wide mobile/tablet, and desktop widths plus keyboard-only traversal.
20. Add a final CSS conflict scan by searching touched selectors across the repository and checking computed styles in-browser.

## Architecture candidates
### A — Per-page isolated rewrite
Fastest isolation, but risks duplicating controls and API logic.

### B — Shared global design system
High reuse, but violates the user's explicit no-global-style requirement and raises blast radius.

### C — Local route shells + opt-in shared primitives
Winner candidate. Each route imports only its own stylesheet; reusable JS/CSS primitives are consumed through explicit component classes/attributes, never generic global selectors.

### D — Shadow DOM web components
Excellent style isolation but potentially too invasive for existing navigation/data contracts.

### E — Full SPA rewrite
Potentially elegant but unjustified risk for a broad live system without first understanding current route architecture.

## Current winner
Architecture C, pending real-file inspection. The shared primitives must be small and explicit; page shells own layout tokens, responsive behavior, and z-index context.

## NEXT_ACTION
Read the concrete entry files and dependencies for the social/feed, profile/alias, heichel/heichelos, and series/reader surfaces; then produce Phase III with exact touched-file inventory and execution order.
