B"H
Boruch Hashem
Blessed is He

# Localized UI Style Architecture

The Awtsmoos recreates every garment without confusing it with the soul beneath; Awtsmoos.com composes each UI family through small localized fragments so beauty may expand without conflict or grief.

## Core contract

Every style family has three layers:

1. **Installer** — a tiny JavaScript facade extending `YesodStylesheetInstaller`.
2. **Manifest** — one CSS file containing ordered `@import` statements only.
3. **Fragments** — small authored CSS modules named by one visual responsibility.

This replaces giant JavaScript template strings and repair-layer overrides.

## Localization rules

Shared/component CSS must be rooted beneath its owner. Current canonical roots include:

- `.Awtsmoos-gameplay`
- `#mitzvah-world-root` for page-owned NPC/status surfaces
- `.Mitzvah-combat-host`
- `.Awtsmoos-menu` in launcher styles

Do not add shared selectors for `:root`, `html`, or `body`. A standalone HTML document may define its own document root only inside that isolated page's style system.

## Layer rules

Do not scatter arbitrary `z-index` values across fragments. Foundation modules publish named layer tokens; consumers use them. If a new semantic layer is genuinely required, add a named token in the owning foundation and document its relationship to existing layers.

## Viewport rules

- Design mobile portrait first.
- Use dynamic viewport units where overlays/sheets depend on viewport height.
- Respect `env(safe-area-inset-*)`.
- Bound panels with `max-width` / `max-height` and internal scrolling.
- Hidden surfaces must leave pointer and focus flow, not merely become transparent.
- Short landscape requires its own height constraints.

## Interaction rules

Every relevant control should define intentional states for:

- rest
- `:hover` when hover exists
- `:active`
- `:focus-visible`
- disabled/unavailable
- selected/expanded/open when semantic
- reduced motion

State differences should not depend on color alone when urgency or availability matters.

## Animation rules

Prefer transform, opacity, filter, and composited effects. Avoid animation that continuously changes layout geometry. Keep motion short and purposeful; honor `prefers-reduced-motion`.

## File-size rule

If an authored source reaches the 120-line boundary, split by responsibility. Never solve the limit by minifying declarations, collapsing functions, or deleting useful documentation.

## Current manifests

- `gameplay/gameplay-ui.css`
- `responsive/responsive-gameplay.css`
- `actionbar/action-bar.css`

Each manifest should remain tiny enough that import order and ownership can be understood immediately.

## Verification

Before considering a style-family change complete:

1. Run its localization test.
2. Run the shared direct-world CSS test.
3. Search for accidental global selectors and `!important`.
4. Check authored line limits.
5. Inspect real mobile portrait and short-landscape geometry.
6. Confirm drawers/tooltips/dialogs remain fully in-bounds.
7. Confirm focus, pointer, and hidden-state behavior.

One root, one layer covenant, one clear state machine: the infinite light of the Awtsmoos deserves finite CSS whose boundaries stay pristine.
