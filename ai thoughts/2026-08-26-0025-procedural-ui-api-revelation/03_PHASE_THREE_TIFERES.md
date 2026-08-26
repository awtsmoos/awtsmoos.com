B"H

# Phase Three — Tiferes: Final Architecture and Exact First Slice

The Awtsmoos joins expansion and restraint into harmony; Awtsmoos.com will make the visible creator feel futuristic and effortless while the hidden system becomes more modular, data-driven, and ready for infinite procedural growth.

## Winning architecture

### Layer A — Creator surface language

Create a creator-owned style family under `src/creator/ui/styles/` following the existing project contract:

- `creator-rail.css` — manifest containing ordered `@import` statements only.
- `creator-foundation.css` — scoped variables, named layer tokens, shell bounds, color/material tokens.
- `creator-shell.css` — open/closed/collapsed geometry, header/body, safe-area positioning.
- `creator-controls.css` — button/control states, primary/secondary action hierarchy, movement grid.
- `creator-palette.css` — material chips, selected state, bounded horizontal scrolling.
- `creator-disclosure.css` — native details/summary, status/live-region, advanced section.
- `creator-responsive.css` — mobile portrait baseline plus short-landscape/tablet/desktop refinements.
- `creator-motion.css` — composited state transitions, hover-capable media, reduced motion.

Add a tiny JS stylesheet installer beside creator UI, extending or following the project’s existing stylesheet-installer authority after its contract is read. The creator installer/view will depend on that one local installer, never inject style strings.

### Layer B — Markup refinement without behavior breakage

Fully rewrite `MitzvahWorldCreatorRailMarkup.js` preserving every existing data hook while adding:

- semantic title/eyebrow wrappers;
- icon/text spans for stateful visual polish;
- a compact basic controls hierarchy;
- grouped movement and history regions;
- native advanced disclosure retained;
- status region structurally separated from actions;
- no duplicated state and no inline styles.

Fully rewrite `MitzvahWorldCreatorRailView.js` only if needed to install localized styles and improve closed/collapsed accessibility (`hidden`/`inert` behavior) while preserving existing public methods and data attributes.

### Layer C — Procedural capability language

After creator surface is verified, inspect existing Nature/domain APIs and add renderer-neutral capability descriptors as their own core modules. Descriptor fields should include stable id/family/label, simple defaults, advanced schema, preset names, deterministic seed support, realism/quality support, and callable facade path. No descriptor may claim an unavailable feature.

Initial families to map from real code: rocks, trees, grass, flowers/clusters, creatures, water, and textures/remote texture sources.

### Layer D — Docs and verification

- Creator UI architecture README explaining scope, imports, layers, state selectors, responsive behavior.
- Procedural capability README showing simple-first examples with expandable advanced options.
- Static CSS localization/layer/state tests.
- Browser geometry/focus/pointer verification at mobile portrait, short landscape, tablet, desktop.
- Existing creator/session/gameplay tests rerun after source work.

## First slice exact intended touch set

New files under `src/creator/ui/styles/` as listed above.
New creator stylesheet installer after reading the canonical installer contract.
Existing full rewrites only where required: `MitzvahWorldCreatorRailMarkup.js`, `MitzvahWorldCreatorRailView.js`, and creator installer/integration file identified by call tracing.
No gameplay style files, no generated compact bundles, no procedural generator files in this first slice.

## Completion of first slice

The slice is not complete until style localization, line ceilings, syntax, existing creator behavior tests, and real browser geometry/focus checks pass. Only then does the work graph advance to procedural capability manifests.
