B'H
# Theoretical Full Region Implementation File Plan

This is a planning artifact only. Nothing below is implemented yet.

Existing libraries inspected:
- `geelooy/libs/awtsmoos3d` has cottage, grassField, cobblePath, shaderTexture, groundTexture, heroTree, decor helpers.
- `geelooy/libs/awtsmoos-procedural-core` has core folders for geometry, physics, scene, webgl, modifiers, animation, math.

Full implementation would require a region stack, not isolated props.

## Main systems to create/touch

### Region orchestration
- `ckidsAwtsmoos/Olam/worlds/mitzvahWorld/region/MitzvahRegionDirector.js`
- `ckidsAwtsmoos/Olam/worlds/mitzvahWorld/region/RegionSeed.js`
- `ckidsAwtsmoos/Olam/worlds/mitzvahWorld/region/RegionPhases.js`
- `ckidsAwtsmoos/Olam/worlds/mitzvahWorld/postbuild/MitzvahWorldPostBuild.js`

### Terrain/ecology
- `ckidsAwtsmoos/dvarim/terrain/core/TerrainMath.js`
- `ckidsAwtsmoos/dvarim/terrain/core/TerrainMaterialScribe.js`
- `ckidsAwtsmoos/dvarim/terrain/ProceduralTerrain.js`
- `ckidsAwtsmoos/Olam/worlds/mitzvahWorld/region/terrain/MacroTerrainRecipe.js`
- `ckidsAwtsmoos/Olam/worlds/mitzvahWorld/region/terrain/ValleyRoadSolver.js`
- `ckidsAwtsmoos/Olam/worlds/mitzvahWorld/region/terrain/WaterFlowSolver.js`
- `ckidsAwtsmoos/dvarim/nature/villagePicture/VillageEcologyAtlas.js`

### Materials/textures
- `ckidsAwtsmoos/dvarim/nature/villagePicture/MaterialSynthesisPrimitives.js`
- `ckidsAwtsmoos/dvarim/nature/villagePicture/ProceduralShaderTextureLibrary.js`
- `ckidsAwtsmoos/dvarim/nature/villagePicture/ProceduralWebGLTextureBackend.js`
- `ckidsAwtsmoos/dvarim/nature/villagePicture/EcologySpecialMaterials.js`
- `ckidsAwtsmoos/dvarim/nature/villagePicture/RealisticVillageMaterials.js`
- `tools/generateEcologyMaterialPreviews.mjs`
- `tools/generateVillageShaderTexturePreviews.mjs`

### Instancing / visual density
- `ckidsAwtsmoos/Olam/worlds/mitzvahWorld/region/instances/InstancePool.js`
- `ckidsAwtsmoos/Olam/worlds/mitzvahWorld/region/instances/InstancedGrassLayer.js`
- `ckidsAwtsmoos/Olam/worlds/mitzvahWorld/region/instances/InstancedFlowerLayer.js`
- `ckidsAwtsmoos/Olam/worlds/mitzvahWorld/region/instances/InstancedRockLayer.js`
- `ckidsAwtsmoos/Olam/worlds/mitzvahWorld/region/instances/InstancedTreeLayer.js`

### Trees/bushes
- `ckidsAwtsmoos/Olam/worlds/mitzvahWorld/region/trees/TreeSpeciesCatalog.js`
- `ckidsAwtsmoos/Olam/worlds/mitzvahWorld/region/trees/TreeGenome.js`
- `ckidsAwtsmoos/Olam/worlds/mitzvahWorld/region/trees/TreeMeshFactory.js`
- `ckidsAwtsmoos/Olam/worlds/mitzvahWorld/region/trees/ForestBiomeLayer.js`
- `ckidsAwtsmoos/Olam/worlds/mitzvahWorld/region/trees/OrchardBiomeLayer.js`
- `geelooy/libs/awtsmoos3d/tree/heroTree.js`
- `geelooy/libs/awtsmoos3d/foliage/grassField.js`

### Roads/paths
- `ckidsAwtsmoos/Olam/worlds/mitzvahWorld/region/roads/RoadNetwork.js`
- `ckidsAwtsmoos/Olam/worlds/mitzvahWorld/region/roads/YellowBrickRoadLayer.js`
- `ckidsAwtsmoos/Olam/worlds/mitzvahWorld/region/roads/AnimalTrailLayer.js`
- `ckidsAwtsmoos/Olam/worlds/mitzvahWorld/region/roads/RoadWearMap.js`
- `geelooy/libs/awtsmoos3d/path/cobblePath.js`

### Farms/orchards/wilderness
- `ckidsAwtsmoos/Olam/worlds/mitzvahWorld/region/biomes/VillageCoreBiome.js`
- `ckidsAwtsmoos/Olam/worlds/mitzvahWorld/region/biomes/FarmBeltBiome.js`
- `ckidsAwtsmoos/Olam/worlds/mitzvahWorld/region/biomes/OrchardBiome.js`
- `ckidsAwtsmoos/Olam/worlds/mitzvahWorld/region/biomes/ForestBiome.js`
- `ckidsAwtsmoos/Olam/worlds/mitzvahWorld/region/biomes/MarshBiome.js`
- `ckidsAwtsmoos/Olam/worlds/mitzvahWorld/region/biomes/RockyHighlandsBiome.js`
- `ckidsAwtsmoos/Olam/worlds/mitzvahWorld/region/farms/WheatFieldLayer.js`
- `ckidsAwtsmoos/Olam/worlds/mitzvahWorld/region/farms/VegetableGardenLayer.js`

### Houses/interiors
- `ckidsAwtsmoos/dvarim/nature/villagePicture/cottageRecipe.js`
- `ckidsAwtsmoos/dvarim/nature/villagePicture/cottage/interiorDetails.js`
- `ckidsAwtsmoos/dvarim/nature/villagePicture/InteriorClutterRecipe.js`
- `ckidsAwtsmoos/Olam/worlds/mitzvahWorld/region/houses/HousePlanner.js`
- `ckidsAwtsmoos/Olam/worlds/mitzvahWorld/region/houses/HouseProfessionCatalog.js`
- `ckidsAwtsmoos/Olam/worlds/mitzvahWorld/region/houses/HouseInteriorSpawner.js`
- `geelooy/libs/awtsmoos3d/buildings/cottage.js`

### Animals/wildlife
- `ckidsAwtsmoos/Olam/worlds/mitzvahWorld/region/wildlife/WildlifeDirector.js`
- `ckidsAwtsmoos/Olam/worlds/mitzvahWorld/region/wildlife/AnimalSpeciesCatalog.js`
- `ckidsAwtsmoos/Olam/worlds/mitzvahWorld/region/wildlife/AnimalTerritories.js`
- `ckidsAwtsmoos/Olam/worlds/mitzvahWorld/region/wildlife/AnimalNeedsModel.js`
- `ckidsAwtsmoos/Olam/worlds/mitzvahWorld/region/wildlife/PredatorPreyScheduler.js`
- `ckidsAwtsmoos/Olam/worlds/mitzvahWorld/postbuild/GeneratedBattleLayer.js`

### NPC schedules
- `ckidsAwtsmoos/Olam/worlds/mitzvahWorld/region/npc/NpcScheduleDirector.js`
- `ckidsAwtsmoos/Olam/worlds/mitzvahWorld/region/npc/NpcRouteNetwork.js`
- `ckidsAwtsmoos/Olam/worlds/mitzvahWorld/region/npc/NpcProfessionBehaviors.js`
- `ckidsAwtsmoos/Olam/worlds/mitzvahWorld/postbuild/NpcRolePostBuild.js`

### Colliders/octree
- `ckidsAwtsmoos/Olam/worlds/mitzvahWorld/region/collision/ColliderClassifier.js`
- `ckidsAwtsmoos/Olam/worlds/mitzvahWorld/region/collision/GroundedColliderBuilder.js`
- `ckidsAwtsmoos/Olam/worlds/mitzvahWorld/region/collision/MergedColliderBake.js`
- `ckidsAwtsmoos/Olam/worlds/mitzvahWorld/region/collision/OctreeBakeReport.js`
- `ckidsAwtsmoos/dvarim/nature/VillageHouseCollider.js`
- `ckidsAwtsmoos/dvarim/nature/VillageFenceCollider.js`
- `ckidsAwtsmoos/dvarim/nature/VillageRoadCollider.js`
- `ckidsAwtsmoos/Olam/methods/hoyseef.js`

### Diagnostics/performance
- `ckidsAwtsmoos/utils/AwtsmoosDiagnostics.js`
- `ckidsAwtsmoos/Olam/worlds/mitzvahWorld/region/debug/RegionBuildReport.js`
- `ckidsAwtsmoos/Olam/worlds/mitzvahWorld/region/debug/ColliderDebugOverlay.js`
- `ckidsAwtsmoos/Olam/worlds/mitzvahWorld/region/debug/EcologyDebugProbe.js`

### Libraries to extend
- `geelooy/libs/awtsmoos3d/shaderTexture.js`
- `geelooy/libs/awtsmoos3d/terrain/groundTexture.js`
- `geelooy/libs/awtsmoos3d/tree/heroTree.js`
- `geelooy/libs/awtsmoos3d/foliage/grassField.js`
- `geelooy/libs/awtsmoos3d/path/cobblePath.js`
- `geelooy/libs/awtsmoos3d/buildings/cottage.js`
- `geelooy/libs/awtsmoos3d/decor.js`
- `geelooy/libs/awtsmoos-procedural-core/src/core/geometry/*`
- `geelooy/libs/awtsmoos-procedural-core/src/core/physics/*`
- `geelooy/libs/awtsmoos-procedural-core/src/core/webgl/*`

Final principle: no scattered one-off props. Every visible thing comes from region data. Every collider comes after grounding/classification. Every hard collider is merged and baked once. Every visual plant/rock/decor item is instanced or shared material. Every file must remain small modules, under about 120 lines when possible.