# B"H
# Boruch Hashem
# Blessed is He

# Phase I — Chesed Brainstorm: Every Useful Possibility

> From the Awtsmoos the interface is renewed, instant by instant, line by line; / so the surface may be silent while the deeper vessels shine. / Awtsmoos.com should not shout to prove its power or crowd the eye with glow; / the highest technology is depth that appears exactly when the user needs to know.

## Product north star
A single coherent social language across feed, heichelos, profiles, aliases, series, comments, editing, and navigation: calm, fast, tactile, mobile-first, progressively disclosed, keyboard-ready, accessible, and unmistakably futuristic without decorative clutter.

## Unbounded idea field
- A compact mobile command rail that retracts when reading and returns on intent.
- Feed cards with semantic density levels: summary first, metadata/actions revealed on focus/hover/tap.
- A universal local design token object per surface rather than global CSS variables that bleed unpredictably.
- Component-scoped CSS files imported only by their route entrypoint.
- Container queries where supported, viewport queries only for actual page-shell behavior.
- Stable stacking contexts: each overlay family owns an explicit z-index band rather than arbitrary giant values.
- Safe-area support for mobile bottom bars and notches.
- `overflow-wrap:anywhere`, min-width discipline, intrinsic media sizing, and clamp-based typography to prevent off-screen content.
- Reduced-motion fallbacks matching every animation family.
- Shared interaction choreography: hover lift, active compression, focus ring, loading shimmer, disabled restraint.
- Reader mode that removes chrome while preserving breadcrumb/context controls.
- Heichel pages with collapsible identity/header area and persistent context title.
- Series reader with chapter rail/drawer, progress, previous/next, keyboard shortcuts, and touch-friendly navigation.
- Alias/profile header with clear ownership, edit affordance, statistics, and expandable advanced actions.
- Feed filter chips that become a horizontal snap row on mobile and never overflow viewport.
- Consistent empty/error/loading states rendered from data descriptors rather than ad-hoc DOM fragments.
- A tiny declarative DOM renderer if an existing one does not already exist; otherwise strengthen the existing renderer.
- API adapters returning normalized result envelopes: `{ok,data,error,meta}` internally while preserving public API contracts.
- Abort/cancellation for stale feed/profile requests.
- Request state machines rather than booleans scattered through views.
- Event delegation for lists to reduce listener count and re-render churn.
- Data-first UI schemas for action groups, navigation items, metadata rows, and card controls.
- Class boundaries mapped meaningfully: Binah parses/normalizes, Gevurah validates, Yesod connects APIs, Malchus renders.
- Lazy enrichment: initial content first, expensive reactions/comments/metadata second.
- Skeletons whose geometry matches final content to minimize layout shift.
- Optimistic actions only where rollback semantics are explicit.
- Progressive image loading and aspect-ratio reservation.
- Unified toast/status messenger with accessible `aria-live` behavior.
- Strong semantic HTML before decoration: nav/main/article/aside/button rather than clickable divs.
- Native `<details>` where it provides robust retractability without extra JavaScript.
- A consistent compact icon-button contract including labels/tooltips and 44px touch hit areas.
- Context menus that become bottom sheets on narrow viewports.
- CSS `:focus-visible`, `:hover`, `:active`, `:disabled`, `[aria-expanded]`, and data-state styling on every relevant interactive class.
- No generic `button`, `a`, `img`, `*`, `body`, or `.card` rules in page-local styles unless strictly rooted under a page namespace.
- Route root classes like `.awts-social-feed`, `.awts-profile`, `.awts-series-reader` to guarantee scope.
- A debug mode to outline overflow and stacking contexts during verification, never shipped active.
- Reader typography optimized for long Hebrew/English text with max measure and responsive spacing.
- RTL-safe logical properties (`margin-inline`, `padding-inline`, `inset-inline`) where applicable.
- Search/filter controls that collapse into a single command button on smallest screens.
- Sticky headers that use measured offsets instead of overlapping content.
- Motion built from transforms/opacity only where possible to avoid layout thrash.
- API error messages that translate technical failures into useful retry/action states.
- Cache normalized entities by id where duplicated views request the same alias/heichel/post.
- Preserve deep links and browser history for reader navigation.
- Restore scroll position intelligently on back navigation.
- Prefetch next chapter or next feed page only when network/visibility conditions justify it.
- Instrument console warnings for impossible UI states in development.
- Tests for overflow, keyboard focus, modal stacking, reader navigation, feed pagination, and API error normalization.

## Possible visual language
- Surfaces: deep neutral glass only where it improves hierarchy, otherwise solid high-contrast panels.
- Borders: subtle luminous edge, not neon everywhere.
- Radius: consistent small/medium/large scale.
- Shadows: shallow ambient depth; stronger only for active overlays.
- Motion: 120–220ms micro-interactions, spring-like transforms without excessive bounce.
- Typography: large clear titles, compact metadata, generous reading measure.
- Density: one primary action visible; secondary actions collapse.

## Shadow work created by this vision
Every visual improvement implies interaction-state tests, reduced-motion behavior, overflow checks, keyboard semantics, API failure states, documentation, and browser verification. Every JavaScript abstraction implies import/cycle checks and compatibility traces. Every local CSS entrypoint implies an import audit to prove styles do not leak.

## NEXT_ACTION
Create the Gevurah pass: attack these ideas for conflict risk, compatibility risk, complexity, performance, and realistic scope before selecting implementation vessels.
