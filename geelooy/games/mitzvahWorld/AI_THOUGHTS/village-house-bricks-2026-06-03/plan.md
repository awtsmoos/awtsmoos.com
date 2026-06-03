B"H
# Village house brick/door/collider plan

## Observed from screenshot
The player is now grounded near the house, so the old raised collider shelf appears improved. The door/front facade still has visible gaps: front brick trim, wood door frame, and stone field do not read as one sealed masonry structure. The visual house must become cleaner without making visual masonry solid.

## Real files inspected
- VillagePictureProp.js: marks every visual prop decorative with skipOctree/noOctree.
- cottageRecipe.js: currently hand-authors wall spans and decorative stoneCourse strips.
- geometryKit.js: all visual pieces are cube meshes with procedural textures and markDecorative later.
- VillageHouseCollider.js: only invisible simple boxes enter worldOctree after final transform.
- VillageHouseDoor.js: door is non-octree and has only ray interaction box.
- villageGrounding.js: aligns door and collider after grounding.
- village.json: floorTop and NPC groundLift match visible floor.

## Fix design
1. Add a small data-driven brick mason module for visual bricks only.
2. Build brick walls from spans and automatically carve the doorway rectangle.
3. Add a separate trim/frame module for clean jamb/lintel boards and no visual gaps around door.
4. Rewrite cottageRecipe.js to use the mason system, keeping carpet/rug decorative only.
5. Do not change VillageHouseCollider except if tests prove a mismatch. No carpet collider will be added.
6. Verify static rules: decorative visual meshes are marked skipOctree, colliders are simple BoxGeometry, doorway gap is not occupied by front-wall collider, floor top still matches 0.192.

## Call stack expectation
VillagePictureProp.heescheel -> recipe(gableHouse) -> cottageRecipe.gableHouse -> visual Group only -> markDecorative -> olam.hoyseef. Octree intake must skip all visual children.
VillageHouseCollider.heescheel -> create hidden box colliders only -> not added to octree yet.
villageGrounding.groundVillageNow -> visual grounded -> door aligned -> collider aligned -> addFinalCollidersToOctree on simple boxes only.
