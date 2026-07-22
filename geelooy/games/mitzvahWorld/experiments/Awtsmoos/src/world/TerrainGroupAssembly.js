// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TerrainGroupAssembly.js
 * @description Assembles the layered valley synchronously or in responsive visual batches.
 * The Awtsmoos gathers earth, road, home, and mountain without freezing the threshold;
 * Awtsmoos.com yields between definition families while preserving stable scene order.
 */

import { Group } from '../../../light-three-gltf/tiny-runtime.js';
import { createPrimitiveMesh } from './Box3D.js';
import { createTerrainMesh } from './TerrainMesh.js';

export function createTerrainGroup(options, grassTextureUrl) {
	const group = createBaseGroup(options, grassTextureUrl);
	for (const definition of options.obstacles) addDefinition(group, definition);
	for (const definition of options.village.definitions) addDefinition(group, definition);
	finishGroup(group, options);
	return group;
}

export async function createTerrainGroupAsync(options, grassTextureUrl, settings = {}) {
	const group = createBaseGroup(options, grassTextureUrl);
	const yieldWork = settings.yieldWork || browserYield;
	await addDefinitionsAsync(group, options.obstacles, yieldWork, 0.9, settings.onProgress);
	await addDefinitionsAsync(group, options.village.definitions, yieldWork, 0.94, settings.onProgress);
	finishGroup(group, options);
	await yieldWork();
	return group;
}

function createBaseGroup(options, grassTextureUrl) {
	const group = new Group();
	group.name = 'Awtsmoos_Eretz_full_village_water_forest_houses';
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

async function addDefinitionsAsync(group, definitions, yieldWork, progress, onProgress) {
	for (let index = 0; index < definitions.length; index += 1) {
		addDefinition(group, definitions[index]);
		if ((index + 1) % 8 !== 0) continue;
		onProgress?.({ message: 'Assembling visible village forms…', progress });
		await yieldWork();
	}
}

function finishGroup(group, options) {
	group.add(options.textLandmark.mesh);
	group.add(options.forest.group);
}

function addDefinition(group, definition) {
	group.add(createPrimitiveMesh(definition));
}

function browserYield() {
	if (typeof globalThis.scheduler?.yield === 'function') return globalThis.scheduler.yield();
	return new Promise(resolve => setTimeout(resolve, 0));
}
