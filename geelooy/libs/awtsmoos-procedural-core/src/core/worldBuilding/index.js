//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file index.js
 * @description Stable world-building doorway for Core-owned terrain, water, atmosphere, materials, hierarchy, and native materialization.
 * The Awtsmoos renews one world through many APIs; Awtsmoos.com keeps this boundary small so products
 * request reality through portable semantics instead of rebuilding renderer geometry or material law.
 */

export { createCinematicEnvironment } from './CinematicEnvironment.js';
export { createCinematicSkyMesh } from './CinematicSkyMesh.js';
export { createTerrainEcologyWeights } from './CinematicTerrainEcology.js';
export { createCinematicTerrainMaterial } from './CinematicTerrainMaterial.js';
export { createCinematicTerrainMesh, createCinematicTerrainMeshFromGeometry } from './CinematicTerrainMesh.js';
export { createCinematicTerrainTextureLayers } from './CinematicTerrainTextureLayers.js';
export { createLayeredTerrainMaterial } from './LayeredTerrainMaterial.js';
export { createCinematicWaterMesh } from './CinematicWaterMesh.js';
export { cinematicWaterProfile } from './CinematicWaterProfile.js';
export { createWaterShaderRecipe, waterShaderRecipe } from './WaterShaderRecipe.js';
export { CinematicWorldBuildingApi, createCinematicWorldBuildingApi } from './CinematicWorldBuildingApi.js';
export { replaceNativeGeometryAttribute } from './NativeGeometryAttribute.js';
export { createNativeGeometry, createNativeGeometryMesh, createNativeIndexedGeometry, createNativeMeshFromGeometry, createNativeWorldGroup } from './NativeGeometryMesh.js';
export { createNativeStaticBatchMaterial } from './NativeStaticBatchMaterial.js';
export { cloneNativeWorldMaterial } from './NativeWorldMaterialClone.js';
export { createNativeWorldMaterial } from './NativeWorldMaterial.js';
