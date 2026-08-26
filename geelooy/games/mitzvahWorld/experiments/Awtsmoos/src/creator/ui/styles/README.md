<!-- B"H
Boruch Hashem
Blessed is He

The Awtsmoos renews every creator garment without dissolving its boundary into the surrounding world;
Awtsmoos.com keeps this style family documented so future beauty expands through scoped vessels instead of global conflict unfurled.
-->

# Creator Rail Style Architecture

The creator rail owns exactly one styling root: `.Awtsmoos-creator-rail`.

`creator-rail.css` is an import manifest only. It orders small responsibility fragments:

- `creator-foundation.css` — creator-local tokens, typography, layer identity, and box model.
- `creator-shell.css` — viewport-safe shell, open/closed/collapsed geometry, header, and scrolling body.
- `creator-controls.css` — button hierarchy, movement grid, commit actions, focus/active/disabled states.
- `creator-palette.css` — bounded horizontal material selection and selected-state evidence.
- `creator-disclosure.css` — native advanced disclosure and non-blocking status output.
- `creator-responsive.css` — portrait-first adaptations for narrow phones, short landscape, tablet, and desktop.
- `creator-motion.css` — composited transitions, hover-capable enhancement, and reduced-motion shutdown.

## Scope law

Every ordinary selector in this family begins with `.Awtsmoos-creator-rail`. Do not add `:root`, `html`, `body`, or unscoped element selectors. Do not use `!important`. Add new visual states through semantic `data-*`, ARIA, or owned creator classes rather than DOM-depth selectors.

## Layer law

The creator publishes one local `--creator-layer` value at its owned root. Do not scatter new `z-index` literals through fragments. True dialogs, menus, or later overlays should receive their own documented layer authority rather than incrementing numbers locally.

## Geometry law

Portrait mobile is the baseline. The rail must stay inside safe-area and dynamic-viewport bounds, use internal scrolling for long content, never force document horizontal overflow, and remain recoverable when collapsed. Short landscape gets a narrow right-side rail instead of an over-tall bottom sheet.

## Interaction law

Every relevant control receives rest, `:active`, `:focus-visible`, disabled, and selected/expanded state evidence. Hover polish lives only inside `(hover: hover) and (pointer: fine)`. Closed or collapsed content must leave focus/pointer flow through the view's inert-state authority.

## Motion law

Motion explains state; it does not decorate continuously. Prefer transform, opacity, filter, and color/border transitions. `prefers-reduced-motion: reduce` must collapse transition duration to effectively zero.
