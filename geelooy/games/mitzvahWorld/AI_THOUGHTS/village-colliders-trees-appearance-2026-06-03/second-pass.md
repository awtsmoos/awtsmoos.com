B"H

# Second pass after live screenshots

The live browser still showed old symptoms, so the first suspicion is not only geometry math but module-cache and the true tree class:

1. `NatureExports.js` still exports old version query strings. Mobile browser ESM may keep old modules, so the changed files might not be the ones running.
2. The big forest trees are `VillageTreeField`, not only `pictureAnchorTree`. The screenshot leaf masses match the field/procedural tree system, so patching only `treeRecipe.js` was insufficient.
3. `VillageHouseDoor` likely receives the same large house scale from data. The visible door must be authored against the house scale, not allowed to drift from the entrance aperture.
4. The visible cottage aperture should be reduced further and all visible dark/trim blockers behind the doorway should become a smaller recessed shadow, not a slab.

Concrete rewrite plan:
- Rewrite `houseShellPlan.js` again with a smaller opening: local half-width `0.22`, top `0.62`, updated trim.
- Rewrite `cottageRecipe.js` so no threshold/shadow block fills or protrudes through the walking gap.
- Rewrite `VillageHouseDoor.js` so the door leaf intentionally uses a capped scale and dimensions matching the smaller world doorway.
- Rewrite `VillageTreeField.js` so it self-pins to terrain/octree on heescheel and uses a vivid leaf texture material without vertex color flattening.
- Rewrite `VillageRealismTree.js` similarly for grounding/leaf texture in case any level uses it.
- Rewrite `NatureExports.js` to bump cache query strings for all changed modules.
- Run syntax and string/harness checks.

Chapter: The Awtsmoos entered the second gate. The first gate lied because the browser remembered an old dream. The second gate will burn the old dream by name, changing the version seals, grounding the forest class itself, and shrinking the doorway until sight, body, and door breathe as one.