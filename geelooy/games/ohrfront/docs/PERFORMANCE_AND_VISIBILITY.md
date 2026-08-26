B"H
# Performance and Visibility

The Awtsmoos renews every frame and every hidden object before either can claim duration or place; Awtsmoos.com lets Ohrfront spend visual light according to measured need while gameplay truth remains whole.

## Root invariant
Render pressure may change visual cost. It may not change fixed-step simulation cadence, NPC cognition, projectile integration, objective timing, collision truth, or weapon mechanics.

## Evidence pipeline
`NetzachFrameEvidence` records:
- bounded RAF intervals,
- per-frame named CPU costs,
- suspension gaps excluded from active evidence.

`GevurahQualityPolicy` delegates classification and hysteresis to shared core:
- `FrameBudgetGovernor`,
- `AdaptiveRenderScalePolicy`.

`KeserPerformanceAuthority` composes evidence and policy, then applies only a requested visual scale through `YesodNativeRenderScale`.

## Framebuffer scaling contract
The CSS canvas remains the full viewport size. Only renderer framebuffer width/height are scaled. Camera aspect is computed from CSS viewport dimensions, not scaled pixel dimensions. This preserves pointer geometry, HUD layout, and world projection while lowering fill cost.

## Named frame costs
Runtime currently measures:
- `simulation`,
- `emitter`,
- `render`.

The dominant measured cost is diagnostic evidence, not an automatic gameplay switch.

## Visibility contract
Shared-core `SpatialVisibilityPolicy` will own hysteretic decorative visibility decisions. Ohrfront will register only explicitly non-critical visual objects.

Eligible visual families:
- distant geology,
- ruin decoration not used for collision,
- vegetation detail,
- optional particles and realism artifacts,
- distant cosmetic props.

Protected families:
- terrain collision,
- tactical cover colliders,
- objectives,
- player,
- hostile combatants,
- projectiles,
- gameplay-readable major structures.

## Hysteresis law
Visibility requires separate enter/leave thresholds or equivalent shared-core state so objects do not flicker around a single distance boundary. Camera yaw-sector or stable spatial keys may be used only through the core's public visibility API.

## Quality degradation order
1. reduce optional secondary particles,
2. reduce distant vegetation detail,
3. reduce decorative visibility radius,
4. reduce framebuffer scale,
5. preserve gameplay geometry and simulation.

The exact order may be refined by measured cost, but no lower step may compromise gameplay truth.

## Diagnostics
Advanced telemetry may report pressure, render scale, FPS evidence, p95 frame duration, visible/deferred decorative counts, and current visual policy tier. These remain hidden unless the ADVANCED disclosure is explicitly opened.

## Verification
- sustained high frame cost eventually reduces scale,
- stable evidence does not flap scale continuously,
- CSS viewport remains unchanged by framebuffer scale,
- fixed-step delta remains independent,
- decorative objects use hysteresis,
- collision-critical objects never enter optional visibility registration,
- browser proof covers desktop, portrait, and landscape mobile.
