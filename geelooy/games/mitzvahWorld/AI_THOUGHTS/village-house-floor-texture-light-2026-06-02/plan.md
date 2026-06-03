B"H

# Village House / Lava Brightness / Village Dimness Plan

Chapter 1: The House With A Missing Threshold

The screenshots show the same vessel from different angles. Outside, the cottage reads too smooth and too bright, like cardboard panels instead of brick-and-wood. Inside, the player stands slightly above the floor because the collision floor is authored with its top too high compared to the visual floor. The doorway is open visually, but the threshold must be solid enough to ground the player and the jamb stones must visually fill the missing brick courses around the portal.

## Inspected root
- Root has geelooy/, scripts/, tests/, package.json, AI_THOUGHTS/, and the mitzvahWorld app under geelooy/games/mitzvahWorld.

## Inspected relevant files
- levels/ladder/data/village.json sets village sky lighting and house entities.
- ckidsAwtsmoos/dvarim/nature/villagePicture/cottageRecipe.js builds visible cottage.
- ckidsAwtsmoos/dvarim/nature/villagePicture/geometryKit.js generates procedural textures.
- ckidsAwtsmoos/dvarim/nature/VillageHouseCollider.js builds the invisible floor, walls, door gap, and furniture collision.
- ckidsAwtsmoos/dvarim/nature/VillageHouseDoor.js builds the visible hinged door.
- levels/ladder/data/ladder-*.json contain lava level sky lighting.

## Fix strategy
1. Rewrite complete files only, never partial patch.
2. Make the house visual geometry richer around the entrance: more lower stones, side columns, threshold slab, sill stones, inner floor texture.
3. Lower the invisible house floor top from 0.4 to approximately 0.08 so player feet are not floating inside while still colliding with the floor.
4. Add a distinct threshold collider below/at the doorway, plus very small lip colliders, not blocking the door opening.
5. Make generated textures stronger so surfaces do not collapse into flat colors on phone rendering.
6. Dim village slightly in village.json sky values.
7. Brighten lava levels slightly by raising only very dark lava sky entries, not making them daylight.
8. Verify JSON parses, module imports parse, and search confirms lighting values changed.
