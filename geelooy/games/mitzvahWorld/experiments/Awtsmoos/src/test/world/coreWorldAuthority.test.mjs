//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file coreWorldAuthority.test.mjs
 * @description Guards the covenant that reusable terrain, sky, and water rendering belong to Procedural Core.
 * The Awtsmoos is One before game and renderer divide; Awtsmoos.com keeps MitzvahWorld focused on gameplay,
 * semantic ecology, URL provenance, and world intent while Core owns reusable geometry, materials, and shaders.
 */
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

async function source(relative) {
	return readFile(new URL(relative, import.meta.url), 'utf8');
}

test('active terrain delegates native geometry and material ownership to Core', async () => {
	const text = await source('../../world/TerrainMesh.js');
	assert.match(text, /createCinematicWorldBuildingApi/);
	assert.match(text, /WORLD\.terrainGeometry/);
	assert.doesNotMatch(text, /BufferGeometry|MeshStandardMaterial|TerrainMaterialFactory/);
});

test('active sky delegates reusable atmosphere geometry and shader ownership to Core', async () => {
	const text = await source('../../world/Sky3D.js');
	assert.match(text, /createCinematicWorldBuildingApi/);
	assert.match(text, /WORLD\.sky/);
	assert.doesNotMatch(text, /SkyDome|ProceduralSkyMeshFactory|BufferGeometry|MeshStandardMaterial/);
});

test('MitzvahWorld water recipe modules are compatibility doors into Core rather than shaders', async () => {
	const recipe = await source('../../world/proceduralApi/WaterShaderRecipe.js');
	const legacy = await source('../../world/proceduralApi/LegacyWaterShaderRecipe.js');
	assert.match(recipe, /awtsmoos-procedural-core/);
	assert.match(legacy, /awtsmoos-procedural-core/);
	assert.doesNotMatch(recipe + legacy, /void main|texture2D|WATER_SHADER_PROFILES/);
});


test('primitive native geometry and standard materials stay behind Core boundaries', async () => {
	const files = await Promise.all([
		source('../../world/Box3D.js'),
		source('../../world/platform/TinyWorldGeometryAdapter.js'),
		source('../../world/primitives/PrimitiveMaterialFactory.js')
	]);
	const text = files.join('\n');
	assert.match(text, /awtsmoos-procedural-core/);
	assert.match(text, /createNativeGeometryMesh|createNativeWorldMaterial/);
	assert.doesNotMatch(text, /tiny-runtime\.js|new\s+(?:BufferGeometry|BufferAttribute|MeshStandardMaterial|Mesh)\b/);
});


test('forest batching keeps portable transforms in game while Core owns native mesh and material construction', async () => {
	const geometry = await source('../../world/trees/ForestGeometryBuffer.js');
	const material = await source('../../world/trees/ForestMaterialFactory.js');
	const text = `${geometry}\n${material}`;
	assert.match(geometry, /createNativeGeometryMesh/);
	assert.match(material, /createNativeWorldMaterial/);
	assert.match(text, /awtsmoos-procedural-core/);
	assert.doesNotMatch(text, /tiny-runtime\.js|new\s+(?:BufferGeometry|BufferAttribute|MeshStandardMaterial|Mesh)\b/);
});


test('Chossid consolidation transforms portable streams while Core owns skinned batch materialization', async () => {
	const geometry = await source('../../assets/ChossidConsolidationGeometry.js');
	const streams = await source('../../assets/ChossidConsolidationStreams.js');
	assert.match(geometry, /createNativeGeometryMesh/);
	assert.match(geometry, /createNativeStaticBatchMaterial/);
	assert.match(geometry, /awtsmoos-procedural-core/);
	assert.doesNotMatch(geometry + streams, /new\s+(?:BufferGeometry|BufferAttribute|MeshStandardMaterial|Mesh)\b/);
});

test('MinimalMeadow render adapters keep native geometry and standard materials behind Core', async () => {
	const files = await Promise.all([
		source('../../app/MinimalMeadowCreatureMesh.js'),
		source('../../app/MinimalMeadowCreaturePart.js'),
		source('../../app/MinimalMeadowDemonGeometry.js'),
		source('../../app/MinimalMeadowDemonMaterial.js'),
		source('../../app/MinimalMeadowRoadGeometry.js'),
		source('../../app/MinimalMeadowRoadRibbon.js'),
		source('../../app/MinimalMeadowTreeGeometry.js'),
		source('../../app/MinimalMeadowTreeGeometrySupport.js')
	]);
	const text = files.join('\n');
	assert.match(text, /awtsmoos-procedural-core/);
	assert.doesNotMatch(
		text,
		/new\s+(?:BufferGeometry|BufferAttribute|MeshStandardMaterial|Mesh)\b/
	);
});

test('UV density and garment isolation use focused Core mutation doors', async () => {
	const uv = await source('../../app/MinimalMeadowWorldUvDensity.js');
	const garment = await source('../../app/MinimalMeadowGarmentMaterialIsolation.js');
	assert.match(uv, /replaceNativeGeometryAttribute/);
	assert.match(garment, /cloneNativeWorldMaterial/);
	assert.doesNotMatch(uv + garment, /new\s+(?:BufferAttribute|MeshStandardMaterial)\b/);
});

test('high-fanout world hierarchies and dynamic doors use the Core group doorway', async () => {
	const files = await Promise.all([
		source('../../app/MinimalMeadowTreeSystem.js'),
		source('../../app/MinimalMeadowWaterSystem.js'),
		source('../../app/MinimalMeadowTerrainPackage.js'),
		source('../../app/MinimalMeadowVegetationSystem.js'),
		source('../../app/MinimalMeadowHousePopulation.js'),
		source('../../app/MinimalMeadowParticleEffects.js'),
		source('../../world/DynamicDoorPresentation.js')
	]);
	const text = files.join('\n');
	assert.match(text, /createNativeWorldGroup/);
	assert.doesNotMatch(text, /new\s+Group\b/);
});
