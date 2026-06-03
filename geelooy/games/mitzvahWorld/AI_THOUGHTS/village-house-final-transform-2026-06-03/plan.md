B"H
# Village house final-transform collision plan

## Inspected files
- levels/ladder/data/village.json
- ckidsAwtsmoos/dvarim/nature/VillagePictureProp.js
- ckidsAwtsmoos/dvarim/nature/VillageHouseCollider.js
- ckidsAwtsmoos/dvarim/nature/VillageHouseDoor.js
- ckidsAwtsmoos/dvarim/nature/villagePicture/cottageRecipe.js
- ckidsAwtsmoos/dvarim/nature/villagePicture/geometryKit.js
- ckidsAwtsmoos/Olam/methods/loadNivrayim/villageGrounding.js
- ckidsAwtsmoos/Olam/methods/loadNivrayim/index.js
- Octree add/remove internals

## Verified wound
The collider currently enters worldOctree during VillageHouseCollider.heescheel(). The village grounding pass is scheduled later by loadNivrayim/index.js. Since OctreeWorld.addObject clones triangles at current world transform, later visual grounding cannot update already-baked physics. This can leave invisible geometry at a stale/pre-grounding Y.

## Fix
1. VillageHouseCollider builds only simple invisible meshes during heescheel and marks them as pending final transform.
2. villageGrounding grounds decorative visual props first.
3. villageGrounding finds the gableHouse picture prop and VillageHouseCollider.
4. The collider root copies final visual house position/rotation. Its scale remains 1 because its children are authored in final house world units.
5. Only after this coupling does VillageHouseCollider.addFinalCollidersToOctree() add floor, walls, jambs, lintel, and furniture boxes.
6. Door is realigned to the final doorway world position and kept non-octree.

## Verification targets
- visual house root world position equals collider root world position.
- visual floor top equals collider floor top within tiny tolerance.
- door root position equals calculated doorway world position.
- no front-wall/threshold collider crosses the doorway gap below door clear height.
- no collider keeps old pre-grounding Y after final coupling.
