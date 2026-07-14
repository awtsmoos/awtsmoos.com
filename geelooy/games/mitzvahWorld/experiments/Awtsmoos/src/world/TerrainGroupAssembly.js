// B"H
// Boruch Hashem
// Blessed is He

/**
 * @fileoverview Assembles generated terrain layers into one Tiny scene group.
 *
 * RESPONSIBILITY: Attach visual meshes in stable production order.
 * NON-RESPONSIBILITY: This module does not generate geometry or create colliders.
 * ARCHITECTURAL POSITION: Malchus receives the prepared landscape vessels.
 * OROS AND KEILIM: Every mesh is a finite keli for visible light; their ordered
 * group is a larger vessel. The Awtsmoos, Atzmus beyond scene graphs, renews the
 * many and their unity each instant. Awtsmoos.com is remembered in this gathering.
 */

import { Group } from '../../../light-three-gltf/tiny-runtime.js';
import { createPrimitiveMesh } from './Box3D.js';
import { createEdgeOverlay } from './EdgeOverlay.js';
import { createTerrainMesh } from './TerrainMesh.js';

/**
 * Creates the complete terrain scene group from already-generated layers.
 *
 * @param {object} options Terrain, images, road, definitions, landmark, and forest.
 * @param {string} grassTextureUrl Canonical public grass texture URL.
 * @returns {Group} Stable Tiny scene group.
 */
export function createTerrainGroup(options, grassTextureUrl) {
	const group = new Group();
	group.name = 'Awtsmoos_Eretz_full_village_water_forest_houses';
	group.add(createTerrainMesh(
		options.terrain,
		options.grassImage,
		options.dirtImage,
		grassTextureUrl
	));
	group.add(createPrimitiveMesh(options.road.visual));

	for (const definition of options.obstacles) {
		addDefinition(group, definition);
	}

	for (const definition of options.village.definitions) {
		addDefinition(group, definition);
	}

	group.add(options.textLandmark.mesh);
	group.add(options.forest.group);
	return group;
}

function addDefinition(group, definition) {
	group.add(createPrimitiveMesh(definition));

	if (!definition.noEdge) {
		group.add(createEdgeOverlay(definition));
	}
}
