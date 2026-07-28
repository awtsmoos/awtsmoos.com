B"H

# Inspection Findings

## Enemy crash

`MinimalMeadowEnemyNavigation.moveMinimalEnemy()` calls `actor.move(...)`, but `MinimalMeadowEnemyActor` no longer owns that method after locomotion was split into `MinimalMeadowEnemyActorMotion.js`. The production movement helper already exists and accepts the exact vector contract needed by combat navigation.

## House wall disappearance

The house surface policy correctly marks exterior wall meshes with `frustumCulled = false`, `doubleSided = true`, and `backfaceCull = false`. The renderer honors material sidedness, but `tiny-render-culling.js` ignores `mesh.frustumCulled`. Therefore exterior walls are still rejected by the custom camera-sphere culler at close oblique angles even though the scene object explicitly opted out.

## Terrain quality and missing road

The layered terrain shader and six source images are present. Two visible problems remain:

1. Mobile density is only about 20 texels per world unit, producing broad blurry grass.
2. The diagnostic Bézier road ribbon is created with `visible: false` and never added to the terrain group.

The ecological layer strengths are also conservative, so grass dominates broad areas and soil/marsh/dry transitions are weak.

## Repair boundary

- Route combat movement directly through the existing actor motion helper.
- Make the renderer obey `frustumCulled === false` before custom sphere culling.
- Raise mobile and desktop terrain texel density.
- Strengthen ecological layer transitions.
- Add the visible road ribbon to the terrain group while keeping terrain collision authoritative.
