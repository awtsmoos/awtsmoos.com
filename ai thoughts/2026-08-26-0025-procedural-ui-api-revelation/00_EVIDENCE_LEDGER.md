B"H

# Evidence Ledger — Procedural UI/API Revelation

The Awtsmoos renews every interface and every hidden engine in one instant; Awtsmoos.com asks that finite code reveal that unity through strict boundaries, readable contracts, and beauty that never spills from one vessel into another.

## Directly observed UI architecture

- `MitzvahWorldCreatorRailMarkup.js` already provides semantic `data-*` hooks, a collapse button, a close button, material palette, movement controls, commit controls, a native `<details>` advanced section, and a live status region.
- `MitzvahWorldCreatorRailView.js` owns only `.Awtsmoos-creator-rail`, tracks `data-open`, `data-collapsed`, `data-busy`, and never claims gameplay input ownership.
- `MitzvahWorldCreatorRailController.js` preserves world state across close/collapse and derives async busy feedback without throwing into gameplay.
- `MitzvahWorldCreatorRailMaterials.js` builds accessible material buttons with `aria-pressed`, labels, selected state, and stable data hooks.
- `src/ui/styles/README.md` defines the canonical style architecture: tiny JS installer → CSS `@import` manifest → responsibility-scoped fragments.
- The canonical style contract explicitly forbids shared `:root`, `html`, and `body`; requires owned-root localization, named z-layers, safe-area handling, viewport bounds, hidden-pointer/focus removal, hover/active/focus-visible/disabled/selected states, and reduced-motion support.
- Existing `src/ui/styles/` is already divided into actionbar, corpse-loot, gameplay, inventory, mobile-hud, and responsive families.
- Creator code already has a dedicated `src/creator/ui/` domain, so creator styling should live with creator UI rather than leak into gameplay CSS.

## Directly observed procedural architecture

- Procedural core already separates `natureApi`, `tzomayach`, `domem`, `chai`, `assets`, `reality/textures`, water, and other authorities.
- Existing work has already established renderer-neutral water APIs and should not be replaced by a parallel system.
- Generated `.compact.js` bundles are build artifacts and must not be hand-edited.

## User-level invariants translated into engineering gates

1. Mobile-first and retractable by default.
2. Advanced controls discoverable but not permanently visible.
3. No global CSS leakage or style conflicts.
4. No offscreen panels, accidental overlap, or arbitrary z-index values.
5. Every relevant interactive control receives rest/hover/active/focus-visible/disabled/selected semantics.
6. Motion is purposeful, composited, and disabled by reduced-motion preference.
7. JavaScript APIs become data-driven and easier at the surface while preserving expert authority underneath.
8. Existing source files are only changed by complete whole-file rewrite.
9. Touched human-authored source uses tabs, generous JSDoc, descriptive domain language, and stays below 120 lines through module splitting.
10. UI work must be browser-verified at mobile portrait, short landscape, and desktop widths before completion.
