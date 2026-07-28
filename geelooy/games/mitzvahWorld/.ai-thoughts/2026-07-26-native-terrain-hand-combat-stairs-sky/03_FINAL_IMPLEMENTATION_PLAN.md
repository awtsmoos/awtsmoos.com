B"H

# Final Implementation Plan

## Chosen architecture

### 1. Native terrain scale

Create a small native-frequency helper that accepts world size, source image dimensions, and a reviewed full-quality texel density. It returns exact fractional repeats and UV frequency per world unit. Material repeat fields will carry UV frequency directly. The terrain shader will remove the fixed world multiplier and sample `vWorld.xz * repeatValue`. A secondary macro sample will use much lower frequency and low weight. This preserves full image resolution while avoiding both blur and carpet repetition.

Chosen quality targets:

- mobile base grass: 72 texels/world
- mobile detail: 64 texels/world
- mobile road: 80 texels/world
- desktop base grass: 96 texels/world
- desktop detail: 84 texels/world
- desktop road: 112 texels/world

These values are not repeat counts. Exact repeat count is derived from world size and source pixels.

### 2. Honest readiness

Rewrite readiness to:

1. render the bootstrap frame,
2. mark `settling`,
3. start and await renderer hydration,
4. await feature settlement,
5. publish renderer/feature receipts,
6. render one final frame,
7. wait two browser frames when available,
8. set progress to one and readiness to `ready` or `degraded-ready` only then.

### 3. Hand-bound staff and cast aim

- Resolve the right hand.
- Create the weapon anchor as a right-hand child when available.
- Use model-root fallback only when no hand exists.
- Add a weapon pose helper with neutral hand transforms and fallback transforms.
- Add an aim controller that computes local yaw/pitch toward the selected enemy chest during cast start/progress.
- Restore neutral pose after launch, cancel, or timeout.
- Keep initial equipment drawn in the hand.

### 4. Action icons

Use graphic icons as the large primary mark:

- fire: `🔥`
- light: `☀️`
- staff: `🪄`

Retain Hebrew letters in `letters`, cast meter text, particle effects, title, and aria-label.

### 5. Combat mercy and spacing

Rewrite balance policy:

- one melee slot,
- one ranged slot but shared impact cadence and slower openings,
- lower damage,
- longer cooldowns and recovery,
- longer invulnerability,
- smaller aggro radius,
- no expanded pack aggro.

Rewrite spawn profiles across a wider ring and increase separation radius. Non-slot enemies continue repositioning rather than stacking.

### 6. Selection visuals

Add `MinimalMeadowEnemySelectionVisual.js`:

- save original material color/emissive,
- brighten selected material,
- add a pulsing emissive ground ring and a floating marker,
- update pulse every actor frame,
- restore original state on clear/defeat/loot.

### 7. Live Shlichus menu

Add `MinimalMeadowMenuShlichus.js` that:

- reads `runtime.adventures.snapshot()` first,
- reads dedicated minimal quest state as fallback,
- selects pinned active, then active, then ready, then available/completed,
- renders name, description, current objective, count, percentage, status, and list totals,
- escapes strings.

`MinimalMeadowMenu` will subscribe to store/quest changes and refresh while open.

### 8. Real stairs

Delete the ramp from stair definitions. Visible stair boxes remain non-solid. Add a stair support registry generated from profile layout. It computes local coordinates, tread index, exact discrete support height, top/bottom transition margins, and bounds.

Movement uses stair support before/after horizontal collision:

- if the player is inside a stair footprint, choose the discrete tread support,
- permit only rises within the explicit stair step policy,
- set grounded and vertical state to that tread,
- avoid inserting a sloped surface in the octree,
- preserve landing collision.

The stair registry belongs to the house population and is exposed through runtime houses.

### 9. Intense procedural sky

Rewrite sky shader constants and composition:

- deeper zenith,
- bright cyan middle sky,
- warmer horizon,
- larger mobile-readable sun disc,
- stronger inner and outer halo,
- denser high-contrast cloud band,
- circumsolar cloud lighting,
- subtle horizon aerial perspective.

Keep one camera-centered sphere and no geometric sun cards.

## Exact production files

### New

- `src/app/MinimalMeadowTerrainNativeFrequency.js`
- `src/app/MinimalMeadowWeaponPose.js`
- `src/app/MinimalMeadowWeaponAim.js`
- `src/app/MinimalMeadowEnemySelectionVisual.js`
- `src/ui/MinimalMeadowMenuShlichus.js`
- `src/app/MinimalMeadowHouseStairSupport.js`
- possibly one readiness settlement helper if the main module nears 120 lines

### Rewritten

- `src/app/MinimalMeadowTerrainMaterialDensity.js`
- `src/app/MinimalMeadowTerrainDensityLayers.js`
- `experiments/light-three-gltf/tiny-terrain-fragment-functions.js`
- `src/launcher/MinimalMeadowReadiness.js`
- `src/app/MinimalMeadowWeaponAnchor.js`
- `src/app/MinimalMeadowWeaponAttachment.js`
- `src/app/MinimalMeadowEquipmentCasting.js`
- `src/app/MinimalMeadowCombatActions.js`
- `src/ui/MinimalMeadowCombatBarView.js`
- `src/app/MinimalMeadowCombatBalancePolicy.js`
- `src/app/MinimalMeadowEnemyProfiles.js`
- `src/app/MinimalMeadowEnemySteering.js`
- `src/app/MinimalMeadowEnemyLifecycle.js`
- `src/app/MinimalMeadowEnemyActorMotion.js`
- `src/app/MinimalMeadowHouseStairs.js`
- `src/app/MinimalMeadowMovementRuntime.js`
- `src/app/MinimalMeadowHousePopulation.js` or a small support installer
- `src/ui/MinimalMeadowMenu.js`
- `experiments/light-three-gltf/tiny-sky-fragment-functions.js`

### Retired behavior

- continuous stair ramp is no longer included in house definitions,
- early `core-playable` loading completion is removed,
- root weapon anchor is fallback only,
- fixed terrain shader multiplier is removed,
- hard-coded Shlichus menu content is removed,
- Hebrew words cease to be the primary combat button icons.

## Verification order after all code is written

1. Syntax and line ceilings.
2. New focused contracts for every reported issue.
3. Current terrain/readiness/equipment/combat/quest/stair/sky tests.
4. Complete Node world.
5. Real mobile WebGL reload with cache disabled.
6. Live checks:
   - readiness remains settling until features and renderer are ready,
   - exact terrain repeats and high achieved density,
   - staff parent is right hand,
   - initial hand pose is visible,
   - cast aim points toward selected target,
   - action buttons show pictograms,
   - attack slots and damage cadence obey mercy policy,
   - spawn separation and live actor spacing,
   - selected demon is materially brighter and owns world markers,
   - Shlichus menu matches active quest state,
   - repeated stair traversal reaches upper landing without airborne/sliding/trapping,
   - sky sun/cloud luminance is visibly nonuniform,
   - zero console/runtime/network errors.

No commit or push.
