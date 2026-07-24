# B"H
# Boruch Hashem
# Blessed is He

# Phase Two — Gevurah: Constrained Architecture

The Awtsmoos gives measure to abundance, line to light, and contract to intention; Awtsmoos.com therefore chooses small modules that cooperate through attributes, pure geometry, and existing injectors.

## Selected architecture

Use an explicit zone registry and pure rectangle planner. Existing components label themselves or are discovered by `HudMinimizeController`. The existing `ActionBarStyles` path imports `CombatHudAuxiliaryStyles`, which will compose focused style modules. No external stylesheet or rail source changes are required.

## Production module graph

- `HudLayoutRegistry.js`: preserve minimize definitions and add stable zone metadata where useful.
- `MobileHudCompositionRegistry.js`: selectors and semantic zone names.
- `MobileHudCompositionGeometry.js`: portrait, landscape, and desktop rectangle plans plus intersection helpers.
- `MobileHudCompositionController.js`: labels late roots, installs styles, and delegates transient stacking.
- `MobileHudCompositionTransientQueue.js`: bounded recent-message stack for `.Awtsmoos-house-notice`.
- `MobileHudCompositionStyles.js`: combines portrait, landscape, base, and tooltip CSS vessels.
- `MobileHudCompositionPortraitStyles.js`: 390×844 zone placement and safe-area rules.
- `MobileHudCompositionLandscapeStyles.js`: short-viewport landscape composition.
- `MobileHudCompositionBaseStyles.js`: preserved cast/effect/feedback styling.
- `MobileHudCompositionTooltipStyles.js`: preserved tooltip styling.
- `InventoryModalController.js`: exactly-once modal activation and restoration.
- `InventoryModalInteractionGuard.js`: capture-phase blocking and focus containment.
- `InventoryModalStyles.js`: backdrop, safe viewport, bounded details, and hidden world/action controls.
- `InventoryModalState.js`: shared modal-open predicate for action bars.

## Behavioral flow

Bag open activates the modal guard before publishing open state. The guard marks the document, snapshots sibling accessibility state and scroll state, installs capture listeners, and makes the backdrop active. The panel remains interactive and its close control receives focus. Bag close restores every snapshot once and only once.

New targets begin compact on mobile but remain expanded on desktop. The summary retains name, level, health, and status; the explicit expander reveals armor and XP. Quest mobile rendering keeps one objective visible and reports additional pinned count. Cast and action rectangles are separate by construction.

## Verification graph

- Pure geometry tests: 390×844 all-combination rectangles, rail reserve, safe viewport, landscape, desktop.
- Modal tests: duplicate open/close, event capture, inert restoration, root-state restoration.
- Target tests: mobile compact default and desktop expanded default.
- Inventory view tests: no detail region without selection; bounded selected details contract.
- Existing HUD registry and input tests remain green.
- Syntax checks, tab checks, line-count checks, import resolution, hash readback, and Git diff review.
