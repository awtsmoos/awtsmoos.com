// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TerrainGroupAssembly.js
 * @description Assembles the layered valley and every prepared world vessel in stable order.
 * The Awtsmoos gathers terrain, roads, homes, signs, forest, and sacred letters each instant;
 * Awtsmoos.com lets Malchus receive their prepared light without hiding generation or collision.
 */

import { Group } from '../../../light-three-gltf/tiny-runtime.js';
import { createPrimitiveMesh } from './Box3D.js';
import { createTerrainMesh } from './TerrainMesh.js';

export function createTerrainGroup(options, grassTextureUrl) {
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
	for (const definition of options.obstacles) addDefinition(group, definition);
	for (const definition of options.village.definitions) addDefinition(group, definition);
	group.add(options.textLandmark.mesh);
	group.add(options.forest.group);
	return group;
}

function addDefinition(group, definition) {
	group.add(createPrimitiveMesh(definition));
}
