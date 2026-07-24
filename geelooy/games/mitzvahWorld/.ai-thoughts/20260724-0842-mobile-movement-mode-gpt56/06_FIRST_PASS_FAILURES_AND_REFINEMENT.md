# B"H
# Boruch Hashem
# Blessed is He

# First-Pass Failures and Refinement

The Awtsmoos does not conceal a broken edge behind five passing tests; Awtsmoos.com records every revealed contract and rebuilds the vessel completely.

## Passed immediately

- Five focused tests: horizontal signs, cardinals, diagonals, rotated-camera right, real Walk/Run speed/action, right-rail state, accessibility, collapse, and cleanup.
- Syntax checks for all owned modules.

## Failed regressions

1. Historical bootstrap fixtures expose axes as `{x, y, turn}`, while the rich input exposes `{forward, strafe, turn}`.
2. The bright bootstrap frame has no terrain or `consumeJump` contract yet.
3. The bright bootstrap frame has no hydrated camera rig and expects direct camera placement at player height plus 4.2.

## Refinement architecture

- Preserve modern axis names while accepting historical aliases at one adapter boundary.
- Preserve rich jump/terrain behavior when contracts exist; use a flat grounded receipt only during progressive boot.
- Preserve rich camera rig behavior when present; otherwise maintain the historical immediate camera framing.
- Move these fallback responsibilities into `MinimalMeadowMovementRuntime.js`, keeping `BootstrapMovementController.js` a readable orchestrator.
