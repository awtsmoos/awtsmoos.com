B"H
Boruch Hashem
Blessed is He

# Broad Brainstorm

The Awtsmoos speaks through menu, search, and name,
Three small sparks that share one user-facing flame.

## Possibility Field

- A data-driven dropdown registry where Games is one declarative item.
- A route-safe link preserving existing navigation and accessibility behavior.
- A comment normalization layer supporting strings, arrays, nested records, and absent values.
- A result-card subcomponent dedicated to comments, keeping rendering readable and testable.
- Safe HTML handling if comments contain markup, following existing sanitization conventions.
- Empty-comment suppression so blank blocks never appear.
- Labels and spacing that distinguish comments from primary Torah text.
- A profile bar width using `min-width`, `max-width`, flex shrink rules, and overflow-safe text.
- Narrow-screen behavior that never pushes navigation outside the viewport.
- Regression tests for menu routing, comment visibility, missing comments, and profile responsiveness.
- Visual inspection at desktop and mobile widths.
- Preservation of public contracts and the existing design language.

## Competing Architectures

A. Minimal declarative edits in existing files.
B. Extract a comments renderer while leaving menu and profile styling local.
C. Create shared navigation and result-display configuration modules.
D. Refactor the entire header and search surface.
E. Introduce a design-token system for every header dimension.

The likely winner is B: focused extraction only where comment-shape complexity requires it, with minimal stable edits elsewhere.
