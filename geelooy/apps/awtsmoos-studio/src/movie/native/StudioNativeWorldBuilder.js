//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioNativeWorldBuilder.js
 * @description Materializes only canonical Studio terrain, world, water, camera, and light recipes into one native procedural scene.
 * The Awtsmoos raises mountain and sea from law before generated matter can claim permanence;
 * Awtsmoos.com keeps seeds, water, lens, and light in MovieDocument truth while this transient world is renewed for every cinematic appearance.
 */

import { createTerrainApi } from '../../../../../libs/awtsmoos-procedural-core/src/core/terrain/TerrainApi.js';
import { Scene } from '../../../../../libs/awtsmoos-procedural-core/src/adapters/native/runtime.js';
import { createStudioNativeCamera } from './StudioNativeCamera.js';
import { createStudioNativeEnvironment } from './StudioNativeEnvironment.js';
import { createStudioNativeOceanMesh } from './StudioNativeOceanMesh.js';
import { createStudioNativeTerrainMesh } from './StudioNativeTerrainMesh.js';

const DEFAULT_RECIPE = Object.freeze({ seed: 613, profile: 'mountain', oceanLevel: 0 });

/** Build a native scene bundle from the canonical Studio scene without inventing hidden world content. */
export function buildStudioNativeWorld(studioScene = {}) {
	const scene = new Scene();
	scene.name = `Studio World · ${studioScene.name || studioScene.id || 'Scene'}`;
	const recipe = resolveTerrainRecipe(studioScene);
	const terrain = recipe ? buildTerrain(recipe) : null;
	if (terrain) {
		scene.add(createStudioNativeTerrainMesh(terrain));
	}
	for (const water of resolveWaterRecipes(studioScene)) {
		scene.add(createWaterMesh(water));
	}
	return {
		scene,
		camera: createStudioNativeCamera(studioScene),
		environment: createStudioNativeEnvironment(studioScene),
		characterY: centerTerrainHeight(terrain) + 1,
		terrain
	};
}

function resolveTerrainRecipe(scene) {
	const layers = scene.layers || [];
	const world = lastLayer(layers, 'world3d');
	const terrain = lastLayer(layers, 'terrain3d');
	if (!world && !terrain) return null;
	const worldRecipe = world?.content?.procedural || {};
	const terrainRecipe = terrain?.content?.procedural || {};
	return {
		seed: Number(terrainRecipe.seed ?? worldRecipe.seed ?? DEFAULT_RECIPE.seed),
		profile: terrainRecipe.profile || worldRecipe.profile || DEFAULT_RECIPE.profile
	};
}

function buildTerrain(recipe) {
	return createTerrainApi(recipe).terrain({
		seed: recipe.seed,
		profile: recipe.profile
	});
}

function resolveWaterRecipes(scene) {
	const layers = scene.layers || [];
	const waters = layers
		.filter(layer => layer.kind === 'water3d')
		.map(layer => ({ ...(layer.content || {}), layerId: layer.id }));
	const world = lastLayer(layers, 'world3d');
	const procedural = world?.content?.procedural || {};
	if (procedural.recipe === 'mountain-coast') {
		waters.unshift({ body: 'ocean', level: Number(procedural.oceanLevel ?? 0), halfSize: 150, layerId: world.id });
	}
	return waters;
}

function createWaterMesh(recipe) {
	const mesh = createStudioNativeOceanMesh({
		halfSize: Number(recipe.halfSize || (recipe.body === 'ocean' ? 150 : 24)),
		height: Number(recipe.level ?? 0)
	});
	mesh.name = recipe.body === 'ocean' ? 'Awtsmoos Studio Ocean' : 'Awtsmoos Studio Lake';
	mesh.userData.studioKind = 'water3d';
	mesh.userData.studioLayerId = recipe.layerId || null;
	return mesh;
}

function lastLayer(layers, kind) {
	return [...layers].reverse().find(layer => layer.kind === kind) || null;
}

function centerTerrainHeight(terrain) {
	const heights = terrain?.heights;
	return heights?.length ? Number(heights[Math.floor(heights.length / 2)] || 0) : 0;
}
