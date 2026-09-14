//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file TerrainGroupAssembly.js
 * @description Assembles the layered valley synchronously or in responsive visual batches without owning native hierarchy construction.
 * Earth, road, village, text, and forest preserve stable scene order while Procedural Core creates the renderer group vessel.
 */

import { createNativeWorldGroup } from '../../../../../../libs/awtsmoos-procedural-core/src/core/worldBuilding/index.js';
import { createPrimitiveMesh } from './Box3D.js';
import { createTerrainMesh } from './TerrainMesh.js';

/**
 * Builds the complete terrain hierarchy synchronously from semantic world components.
 * @param {object} options Terrain, road, village, text, forest, material, and quality inputs.
 * @param {string|null} grassTextureUrl Optional remote grass texture URL.
 * @returns {object} Core-owned world group.
 */
export function createTerrainGroup(options, grassTextureUrl) {
	const group = createBaseGroup(options, grassTextureUrl);
	for (const definition of options.obstacles) {
		addDefinition(group, definition);
	}
	for (const definition of options.village.definitions) {
		addDefinition(group, definition);
	}
	finishGroup(group, options);
	return group;
}

/**
 * Builds the same terrain hierarchy while yielding between larger definition families.
 * @param {object} options Terrain assembly inputs.
 * @param {string|null} grassTextureUrl Optional remote grass texture URL.
 * @param {object} [settings={}] Yield and progress dependencies.
 * @returns {Promise<object>} Core-owned completed world group.
 */
export async function createTerrainGroupAsync(
	options,
	grassTextureUrl,
	settings = {}
) {
	const group = createBaseGroup(options, grassTextureUrl);
	const yieldWork = settings.yieldWork || browserYield;
	await addDefinitionsAsync(
		group,
		options.obstacles,
		yieldWork,
		0.9,
		settings.onProgress
	);
	await addDefinitionsAsync(
		group,
		options.village.definitions,
		yieldWork,
		0.94,
		settings.onProgress
	);
	finishGroup(group, options);
	await yieldWork();
	return group;
}

/** Creates the shared terrain/road base beneath later semantic definition families. */
function createBaseGroup(options, grassTextureUrl) {
	const group = createNativeWorldGroup({
		name: 'Awtsmoos_Eretz_full_village_water_forest_houses'
	});
	group.add(createTerrainMesh(
		options.terrain,
		options.grassImage,
		options.dirtImage,
		grassTextureUrl,
		options.quality
	));
	group.add(createPrimitiveMesh(options.road.visual));
	return group;
}

/** Adds one definition family responsively while preserving stable creation order. */
async function addDefinitionsAsync(group, definitions, yieldWork, progress, onProgress) {
	for (let index = 0; index < definitions.length; index += 1) {
		addDefinition(group, definitions[index]);
		if ((index + 1) % 8 !== 0) {
			continue;
		}
		onProgress?.({
			message: 'Assembling visible village forms…',
			progress
		});
		await yieldWork();
	}
}

/** Attaches deferred text and forest vessels after structural terrain definitions. */
function finishGroup(group, options) {
	group.add(options.textLandmark.mesh);
	group.add(options.forest.group);
}

/** Adds one primitive definition through the shared native primitive adapter. */
function addDefinition(group, definition) {
	group.add(createPrimitiveMesh(definition));
}

/** Yields through native scheduler support when available, otherwise one zero-delay task. */
function browserYield() {
	if (typeof globalThis.scheduler?.yield === 'function') {
		return globalThis.scheduler.yield();
	}
	return new Promise(resolve => setTimeout(resolve, 0));
}
