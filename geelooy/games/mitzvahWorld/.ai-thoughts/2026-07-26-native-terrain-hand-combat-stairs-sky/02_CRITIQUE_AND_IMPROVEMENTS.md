B"H

# Second Pass: Critique, Risks, and Improvements

## Why the first brainstorm is not sufficient

The first pass names many possible fixes, but several could recreate the same class of failure under a different name. A correct implementation must distinguish visual evidence from real authority:

- terrain must use real source dimensions, not a prettier arbitrary scale,
- readiness must await real systems, not a timeout that merely expires,
- a hand attachment must survive model hydration, not only the bootstrap model,
- a staff aim must be reversible and must not corrupt the player's model yaw,
- combat mercy must constrain all attackers through one coordinator,
- a selection highlight must restore exact original material values,
- Shlichus markup must read the live store and not fork quest truth,
- stairs must use stepped height authority rather than another hidden triangle trick,
- sky improvement must be visible in the actual shared shader mode.

## Thirty concrete improvements

1. Compute each texture's exact fractional repeat from actual image width/height.
2. Use a reviewed native texel density target rather than the current low profile.
3. Store UV frequency per world unit directly so terrain world size is not hard-coded in GLSL.
4. Keep the source image at full uploaded resolution.
5. Separate base-source UV frequency from macro variation frequency.
6. Make macro variation color-only and low weight.
7. Add diagnostics proving achieved density and world coverage.
8. Await renderer hydration before setting loading progress to one.
9. Await feature settlement before setting readiness to ready.
10. Require one final render after settlement.
11. Publish degraded readiness only after the failed feature is known.
12. Create a hand anchor under the resolved right-hand bone.
13. Keep model-root fallback explicit and observable.
14. Calibrate staff local transform separately for hand and fallback anchors.
15. Keep initial state in the hand.
16. Track cast aim as a state machine: neutral, charging, launched, restoring.
17. Aim the staff toward the selected actor's chest on each cast progress event.
18. Restore the neutral hand transform after cast completion/cancel.
19. Use graphic action icons while preserving Hebrew letters in spell text and accessibility labels.
20. Reduce simultaneous hostile slots to one total practical attacker.
21. Increase telegraph and recovery durations.
22. Increase player invulnerability and reduce per-hit damage.
23. Reduce base and alerted aggro radii.
24. Eliminate pack-wide aggro expansion.
25. Spread spawn profiles by at least twelve to eighteen world units.
26. Increase steering separation radius.
27. Add selected material brightening plus a pulsing ring and head marker.
28. Restore original material/marker state on clear, defeat, and loot.
29. Read current Shlichus from the live adventure store and dedicated quest fallback.
30. Refresh the open Shlichus menu on quest state changes.
31. Delete ramp collision authority from stairs.
32. Build a discrete stair footprint/height sampler from the exact profile layout.
33. Let player ground authority choose the next legal tread only within maximum rise.
34. Keep visible stair geometry non-solid to prevent capsule wedging.
35. Preserve upper landing collision.
36. Add a small top/bottom transition tolerance so the player cannot fall between stair and floor.
37. Strengthen sun disc, halo, horizon warmth, and cloud contrast in the procedural sky shader.
38. Choose a sun direction visible from common gameplay camera headings.
39. Keep the sky camera-centered and uncullable.
40. Test all changes through a real mobile WebGL reload with actual controls and mission UI.

## Dependency graph

`source dimensions + world size -> exact UV frequency -> shader sampling -> terrain visual proof`

`renderer hydrate + features settle -> final render -> readiness receipt -> loading screen release`

`resolved hand -> hand anchor -> weapon transform -> cast aim state -> visible staff proof`

`combat policy -> coordinator slots -> enemy decisions -> player damage cadence`

`target lifecycle -> material highlight + markers -> update pulse -> clear restoration`

`adventure store / dedicated quest -> menu presenter -> live Shlichus refresh`

`house profile -> stepped support sampler -> movement ground authority -> stair traversal`

`sky mode -> atmospheric shader -> sun/cloud contrast -> mobile screenshot`

## Files expected to be rewritten

### Terrain
- `src/app/MinimalMeadowTerrainMaterialDensity.js`
- `src/app/MinimalMeadowTerrainDensityLayers.js`
- renderer terrain fragment functions
- possibly one new native-density helper

### Readiness
- `src/launcher/MinimalMeadowReadiness.js`
- one new feature-settlement helper if needed

### Weapon and casting
- `src/app/MinimalMeadowWeaponAnchor.js`
- `src/app/MinimalMeadowWeaponAttachment.js`
- `src/app/MinimalMeadowEquipmentCasting.js`
- one new aim/pose helper

### Combat and highlights
- `src/app/MinimalMeadowCombatActions.js`
- `src/ui/MinimalMeadowCombatBarView.js`
- `src/app/MinimalMeadowCombatBalancePolicy.js`
- `src/app/MinimalMeadowEnemyProfiles.js`
- `src/app/MinimalMeadowEnemySteering.js`
- `src/app/MinimalMeadowEnemyLifecycle.js`
- one new enemy selection visual module

### Shlichus
- `src/ui/MinimalMeadowMenu.js`
- one new live Shlichus presenter

### Stairs
- `src/app/MinimalMeadowHouseStairs.js`
- remove/retire ramp role
- one new stepped support module
- `src/app/MinimalMeadowMovementRuntime.js`

### Sky
- renderer sky fragment functions
- sky diagnostics if needed

## Test risks

- Old tests may intentionally expect the former root weapon anchor, broad stretched terrain, ramp collider, early readiness, or aggressive combat numbers.
- Those current-contract tests should be migrated only when they directly encode the reported defect.
- Archived flat-world, sixteen-layer, remote-URL, or unrelated architecture assertions remain outside this pass.
