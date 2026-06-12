B"H

# Village tikkun plan

The Awtsmoos renews this debugging field from nothing every instant, so I will not guess the village. I inspected the real root, tree, render loop, Three fork snippet, animal mob, navigator, and animal factory.

## Grounded faults

1. `three.module.js` has a custom `catch(e)` inside `renderObjects` that references `window.wowd`. In an OffscreenCanvas worker there is no `window`, so the debug catch itself throws `ReferenceError: window is not defined` during `renderer.render`.
2. `HeesHawvoosManager.renderFrame` calls `renderer.render(...)` directly in worker context. A safe shim before rendering can make the existing Three debug fork survive without rewriting the giant vendor file.
3. `VillageAnimalMob` moves all the way into the player before attacking. It needs orbit/standoff movement, real cooldown attacks with visible effects, and no body overlap.
4. `VillageGroundNavigator` sets `mesh.rotation.y = Math.atan2(direction.x, direction.z)`, while the animal art root already turns by `Math.PI`; visually this can read backwards. The final world rotation must face the actual travel vector.

## Immediate safe edits

- Rewrite the full `heesHawvoos.js` file only, adding a tiny worker-safe `window` vessel before rendering.
- Rewrite the full `VillageAnimalMob.js` file only, adding preferred distance, attack windup/effect, retreat when too close, and no overlap.
- Rewrite the full `VillageGroundNavigator.js` file only, adding standoff support and the corrected facing offset.

## Deferred after first crash fix

- Inspect NPC loader/model duplication path and replace generated impostor NPCs with `chossid.glb` only.
- Inspect foliage recipe files and apply `grass-atlas.png` / `leaf-atlas.png` more deeply across grass mesh, ground texture, and tree leaves.

## Verification

- Run static import/syntax checks on modified files.
- Use live page/browser/simulateRuntime after crash guard lands.
