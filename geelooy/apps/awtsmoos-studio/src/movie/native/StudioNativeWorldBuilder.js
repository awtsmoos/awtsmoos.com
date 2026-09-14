//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file StudioNativeWorldBuilder.js
 * @description Translates MovieDocument world semantics into one Procedural Core cinematic world.
 * Studio keeps seeds, layer identity, camera, and authoring meaning; Core alone builds terrain, water,
 * atmosphere, materials, remote textures, shaders, readiness, and renderer-facing native world matter.
 */
import { Scene } from '../../../../../libs/awtsmoos-procedural-core/src/adapters/native/runtime.js';
import { createCinematicWorldBuildingApi } from '../../../../../libs/awtsmoos-procedural-core/src/core/worldBuilding/index.js';
import { createStudioNativeCamera } from './StudioNativeCamera.js';
import { createStudioEnvironmentIntent } from './StudioNativeEnvironment.js';

const WORLD = createCinematicWorldBuildingApi();
const DEFAULT_RECIPE = Object.freeze({ seed: 613, profile: 'mountain' });

/**
 * Build transient native world matter from canonical Studio semantics.
 * @param {object} studioScene Canonical MovieDocument scene.
 * @param {object} options Test/integration seams; production normally supplies none.
 * @returns {object} Native scene bundle plus a Core readiness barrier for exact export.
 */
export function buildStudioNativeWorld(studioScene = {}, options = {}) {
	const scene = new Scene();
	const worldApi = options.worldApi || (options.coreDefaults ? WORLD.with(options.coreDefaults) : WORLD);
	const terrainIntent = resolveTerrainIntent(studioScene);
	const waterIntents = resolveWaterIntents(studioScene);
	const coreWorld = worldApi.world({
		environment: createStudioEnvironmentIntent(studioScene),
		sky: hasWorldLayer(studioScene) ? { quality: 'low' } : false,
		terrain: terrainIntent || false,
		waters: waterIntents
	});
	scene.name = `Studio World · ${studioScene.name || studioScene.id || 'Scene'}`;
	addWorldMatter(scene, coreWorld, studioScene, waterIntents);
	return {
		camera: createStudioNativeCamera(studioScene),
		characterY: centerTerrainHeight(coreWorld.terrainPlan) + 1,
		coreWorld,
		environment: coreWorld.environment,
		ready: coreWorld.ready,
		scene,
		terrain: coreWorld.terrainPlan
	};
}

function resolveTerrainIntent(scene) {
	const world = lastLayer(scene, 'world3d');
	const terrain = lastLayer(scene, 'terrain3d');
	if (!world && !terrain) return null;
	const worldRecipe = world?.content?.procedural || {};
	const terrainRecipe = terrain?.content?.procedural || {};
	return {
		name: 'Awtsmoos Studio Mountain Terrain',
		profile: terrainRecipe.profile || worldRecipe.profile || DEFAULT_RECIPE.profile,
		seed: Number(terrainRecipe.seed ?? worldRecipe.seed ?? DEFAULT_RECIPE.seed),
		waterLevel: Number(worldRecipe.oceanLevel ?? 0)
	};
}

function resolveWaterIntents(scene) {
	const waters = (scene?.layers || [])
		.filter(layer => layer.kind === 'water3d')
		.map(layer => ({
			...(layer.content || {}),
			height: Number(layer.content?.level ?? 0),
			layerId: layer.id,
			variant: layer.content?.body || 'lake'
		}));
	const world = lastLayer(scene, 'world3d');
	const recipe = world?.content?.procedural || {};
	if (recipe.recipe === 'mountain-coast') {
		waters.unshift({ body: 'ocean', halfSize: 150, height: Number(recipe.oceanLevel ?? 0), layerId: world.id, variant: 'lake' });
	}
	return waters;
}

function addWorldMatter(scene, coreWorld, studioScene, waterIntents) {
	if (coreWorld.sky) scene.add(coreWorld.sky);
	if (coreWorld.terrain) {
		tag(coreWorld.terrain, 'terrain3d', lastLayer(studioScene, 'terrain3d')?.id || lastLayer(studioScene, 'world3d')?.id);
		scene.add(coreWorld.terrain);
	}
	coreWorld.waters.forEach((mesh, index) => {
		tag(mesh, 'water3d', waterIntents[index]?.layerId);
		scene.add(mesh);
	});
}

function tag(mesh, kind, layerId) {
	mesh.userData.studioKind = kind;
	mesh.userData.studioLayerId = layerId || null;
}

function hasWorldLayer(scene) {
	return Boolean(lastLayer(scene, 'world3d'));
}

function lastLayer(scene, kind) {
	return [...(scene?.layers || [])].reverse().find(layer => layer.kind === kind) || null;
}

function centerTerrainHeight(terrain) {
	const heights = terrain?.heights;
	return heights?.length ? Number(heights[Math.floor(heights.length / 2)] || 0) : 0;
}
