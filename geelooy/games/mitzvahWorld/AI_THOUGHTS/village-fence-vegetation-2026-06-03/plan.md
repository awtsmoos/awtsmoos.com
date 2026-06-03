B"H
# Village fence, road, vegetation, rocks, and furniture scale plan

## Inspected
- landscapeRecipes.js: fence is visual cubes only; flowerPatch is tiny cubes; rock is one icosphere; cobbleRoad/path are decorative pieces.
- pathRecipe.js: dirt path is visual only and already low.
- geometryKit.js: markDecorative sets skipOctree/noOctree/skipRaycast on visual props.
- VillageHouseCollider.js: furniture colliders are currently huge because local specs are multiplied by house scale.
- NatureExports.js and instantiateMezuzahDirect.js: JSON types load from export hub, so a new VillageFenceCollider must be exported.
- village.json: current village has one short fence, two cube flower patches, one rock.

## Fix
1. Create fast flower/rock instanced visual helpers. They remain decorative and non-collider.
2. Rewrite landscapeRecipes.js to use flower instancing, richer fence, rock fields, and still no octree.
3. Add VillageFenceCollider as a generic invisible box collider that aligns to a target visual fence after grounding and then enters octree.
4. Export VillageFenceCollider and add it to village.json for fence boundaries.
5. Update villageGrounding so VillageFenceCollider waits until visual fence is final-grounded before octree insertion.
6. Resize house furniture visuals and colliders down to normal human scale inside a large house.

## Scale rule
A human is about 1.5 units before the house visual scale. Furniture inside house-local space should remain normal/small relative to a human: table under waist/chest height, stool low, bed normal. Since the whole house group is scaled 4.8, local furniture numbers must be much smaller than earlier values, and colliders must match the resulting final world sizes without becoming giant furniture.
