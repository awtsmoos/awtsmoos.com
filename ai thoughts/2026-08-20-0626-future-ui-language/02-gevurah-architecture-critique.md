B"H
Boruch Hashem
Blessed is He

# Gevurah Architecture Critique — Bound the Light

The Awtsmoos gives every possibility, yet Awtsmoos.com needs measured vessels to keep wonder usable and bright;
icons must clarify action, motion must preserve reading, and every page must keep its own rightful light.

## Risks in the broad plan

- A universal selector-driven animation layer could accidentally animate forms, hidden panels, or OS windows.
- Page-specific business scripts may inject content after load; the shared layer must never depend on mutation-heavy rewriting.
- Social Hub markup is densely compressed. Touching it means a full expansion rewrite, which is safe but larger in scope.
- Wallet forms need stability; hover transforms must not disturb layout or form focus.
- Apps and Games dynamically create cards; the shared system should enhance their containers, not rewrite generated card internals.
- OS and Torah already have bespoke icon/motion systems; adding another would create conflicting visual grammars.
- Shared SVG path data must remain small, accessible, and semantically named.

## Chosen architecture

Create a dedicated, opt-in `/style/future-system/` and `/scripts/future-system/` layer.

CSS modules:
- `index.css`: imports only.
- `tokens.css`: shared future variables and per-page accent hooks.
- `atmosphere.css`: background grid, scan glow, hero aura.
- `surfaces.css`: opt-in border, glass, icon, and focus treatments.
- `motion.css`: reveal and hover animation with reduced-motion fallback.

JavaScript modules:
- `index.js`: small coordinator.
- `FutureRevealController.js`: IntersectionObserver for `[data-future-reveal]`.
- `FuturePointerAura.js`: pointer coordinates for `[data-future-aura]`.
- `FutureIconRenderer.js`: renders small inline SVG icons into `[data-future-icon]`.
- `futureIconPaths.js`: immutable semantic SVG path dictionary.

## Page scope

- Games: hero, mode rail, discovery/search, catalog container, CTAs.
- Apps: hero, economy note, filters, section heading, generated grid container.
- Wallet: hero, balance, primary nav, forms, store mount.
- About: hero and story article sections.
- Social Hub: header, home hero rift, pulse metrics, quick actions, workspace panels.
- Home: optionally consume icon renderer only if it improves consistency; do not destabilize the recently repaired page.
- OS and Torah: no generic layer this pass; document them as existing advanced systems.

## Verification boundaries

- No business script rewrites unless integration evidence requires them.
- No raster assets.
- No generated files.
- Every touched HTML file remains under 120 lines and tab-indented.
- All shared files remain under 120 lines and contain reduced-motion/focus behavior.
- Page route contracts and existing tests must continue to pass.
