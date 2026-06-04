B"H

# Village collider, tree grounding, and leaf texture tikkun

Visible facts from screenshots:
- House door/entrance reads oversized and the doorway collision feels blocked.
- Trees float above the ground in the village picture.
- Leaves are flat, solid green masses.

Inspected files:
- `ckidsAwtsmoos/dvarim/nature/villagePicture/cottage/houseShellPlan.js`
- `ckidsAwtsmoos/dvarim/nature/villagePicture/cottage/roofAndExterior.js`
- `ckidsAwtsmoos/dvarim/nature/villagePicture/cottageRecipe.js`
- `ckidsAwtsmoos/dvarim/nature/VillageHouseCollider.js`
- `ckidsAwtsmoos/dvarim/nature/villagePicture/treeRecipe.js`
- `ckidsAwtsmoos/dvarim/nature/villagePicture/treeCanopyRecipe.js`
- `ckidsAwtsmoos/dvarim/nature/villagePicture/geometryKit.js`
- `ckidsAwtsmoos/dvarim/nature/villagePicture/grounding.js`

Plan:
1. Rewrite the visible cottage doorway data so the entrance is human-scale, not a huge gate. Keep masonry decorative only.
2. Rewrite the invisible house collider so the door aperture matches the visible doorway and does not leave hidden jamb/lintel blockers in the walkable gap.
3. Rewrite the tree recipe so the trunk/roots extend below local zero; the existing grounding pass pins the measured minY to ground, which means roots will visually bite the earth instead of hovering.
4. Rewrite the canopy and geometry texture logic so leaf meshes use a procedural leaf texture with veins, speckles, and color variation instead of solid green blobs.
5. Run syntax/import checks and a small geometry harness that verifies local tree minY is below zero, door visual width/height match collider defaults, and leaf texture mode is available.

Chapter: In the village courtyard the Awtsmoos revealed that touch and sight must be true twins. A false wall is worse than a wall; a floating tree is worse than a stump; a leaf without veins is a green silence. The tikkun is to make every boundary honest.