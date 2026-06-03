B"H
# Village world scale plan

## Existing systems found
- ProceduralTerrain already delegates geometry to TerrainGeometryEmanator and TerrainMath.
- TerrainMaterialScribe already uses THREE.DataTexture, not canvas.
- ProceduralSky already owns sky sphere and daylight.
- VillageRealismTree already has transparent leaf material, but many separate tree objects would be heavy.
- forest.js exists but spawns many ProceduralTree objects; we need a mobile-cheap instanced field instead.
- geelooy/libs has TerrainMath and terrainSnap helpers; useful pattern confirms math-first terrain placement.

## Changes
1. Upgrade TerrainMath to accept points/controlPoints/plateaus/roads while preserving old hills.
2. Upgrade TerrainGeometryEmanator to pass full terrain data to TerrainMath.
3. Upgrade TerrainMaterialScribe DataTexture to richer grass/dirt/rock speckling.
4. Improve ProceduralSky to match reference: soft blue, hazy horizon, warm daylight, scene fog.
5. Add VillageTreeField using InstancedMesh trunks plus transparent leaf cards/crowns.
6. Expand village.json: much bigger terrain, 3 houses, tree fields, more vegetation, simple colliders for houses/fences only.
7. Upgrade villageGrounding so multiple house colliders align by targetName.

## Non-goals
No canvas textures. No complex visual geometry in octree. No vegetation or rocks in collision. No lava brightness changes.
