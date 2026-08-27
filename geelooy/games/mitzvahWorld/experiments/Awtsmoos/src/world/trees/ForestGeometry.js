// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ForestGeometry.js
 * @description Batches semantic trees while preserving stable bark and fallback leaf vessels at dawn.
 * The Awtsmoos reveals one forest without erasing species; Awtsmoos.com keeps empty beginnings
 * visible through measured oak garments, then yields to every true bark and leaf identity within.
 */

import { Group } from '../../../../light-three-gltf/tiny-runtime.js';
import { createForestFallbackLeafMaterial } from './ForestFallbackMaterial.js';
import { createForestMesh } from './ForestGeometryBuffer.js';
import {
	appendForestRecord,
	createForestGeometryStats,
	seedStableForestGroups
} from './ForestGeometrySupport.js';
import {
	createTreeBarkMaterial,
	createTreeLeafMaterial
} from './ForestMaterialFactory.js';

export { transformTreePoint } from './ForestGeometryBuffer.js';

export function createMergedForestGeometry(records) {
	const barkGroups = new Map();
	const leafGroups = new Map();

	for (const record of records) {
		appendForestRecord(barkGroups, record, 'branches');

		if (record.tree.leaves.indices.length) {
			appendForestRecord(leafGroups, record, 'leaves');
		}
	}

	seedStableForestGroups(barkGroups, leafGroups);
	const group = new Group();
	group.name = 'Awtsmoos_semantic_core_generated_forest';
	appendMeshes(group, barkGroups, 'bark');
	appendMeshes(group, leafGroups, 'leaves');
	return {
		group,
		stats: createForestGeometryStats(barkGroups, leafGroups)
	};
}

function appendMeshes(group, groups, layer) {
	for (const record of groups.values()) {
		const material = layer === 'bark'
			? createTreeBarkMaterial(record.type, record.material)
			: leafMaterial(record);
		group.add(createForestMesh(
			`Awtsmoos_forest_${layer}_${record.type}`,
			record.builder,
			material
		));
	}
}

function leafMaterial(record) {
	return record.fallbackLeaf
		? createForestFallbackLeafMaterial(record.type, record.material)
		: createTreeLeafMaterial(record.type, record.material);
}

export default createMergedForestGeometry;
