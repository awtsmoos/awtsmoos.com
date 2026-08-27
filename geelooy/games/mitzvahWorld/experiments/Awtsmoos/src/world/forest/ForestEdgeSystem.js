// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ForestEdgeSystem.js
 * @description Builds a readable dense side forest with floor, fern, moss, and fallen wood layers.
 * The Awtsmoos renews hidden life beneath bark and leaf; Awtsmoos.com keeps deep forest shadow
 * while original-resolution litter and moss remain legible beneath the cool alpine return light.
 */

import { FOREST_MATERIALS } from '../../assets/ForestMaterialCatalog.js';
import { createVillageBoxBatch } from '../village/VillageBoxBatch.js';
import { villageGroundHeight } from '../village/VillageGroundSampling.js';

const TREE_POINTS = Object.freeze(Array.from({ length: 34 }, (_, index) => {
	const column = index % 7;
	const row = Math.floor(index / 7);
	return [
		64 + column * 13 + Math.sin(index * 2.1) * 5,
		-78 - row * 18 + Math.cos(index) * 6
	];
}));
const FLOOR_PATCHES = Object.freeze([
	[82, -104, 56, 62],
	[119, -104, 42, 62],
	[81, -146, 54, 36],
	[122, -146, 46, 36]
]);
const LOG_POINTS = Object.freeze([
	[77, -105], [87, -118], [104, -132],
	[118, -101], [129, -145], [73, -151]
]);

export function createForestEdgeDefinitions(groundSampler, quality = 'high') {
	const treeLimit = quality === 'low'
		? 14
		: quality === 'medium' ? 24 : TREE_POINTS.length;
	const parts = { ferns: [], logs: [], moss: [] };
	TREE_POINTS.slice(0, treeLimit).forEach((point, index) => {
		appendTree(parts, point, index, groundSampler);
	});
	LOG_POINTS.slice(0, quality === 'low' ? 2 : LOG_POINTS.length).forEach(point => {
		appendLog(parts, point, groundSampler);
	});
	const definitions = [
		...floorDefinitions(groundSampler, quality),
		batch('forest-ferns', parts.ferns, '#4f7948', FOREST_MATERIALS.fern, 'undergrowth'),
		batch('forest-moss', parts.moss, '#638154', FOREST_MATERIALS.moss, 'undergrowth'),
		batch('forest-fallen-logs', parts.logs, '#684d37', FOREST_MATERIALS.roots, 'fallen-wood')
	].filter(Boolean);
	definitions.stats = {
		definitions: definitions.length,
		fallenLogs: parts.logs.length,
		floorPatches: quality === 'low' ? 2 : FLOOR_PATCHES.length,
		forestRadius: 160,
		primitiveTrees: 0,
		proceduralTreeSitesSupported: treeLimit,
		undergrowthClusters: parts.ferns.length + parts.moss.length
	};
	return definitions;
}

function floorDefinitions(groundSampler, quality) {
	const count = quality === 'low' ? 2 : FLOOR_PATCHES.length;
	return FLOOR_PATCHES.slice(0, count).map((patch, index) => {
		const [x, z, width, depth] = patch;
		return {
			color: index % 2 ? '#394631' : '#45402f',
			id: `Awtsmoos_forest_floor_${index}`,
			mapRepeat: [8, 8],
			position: { x, y: villageGroundHeight(groundSampler, x, z) + 0.02, z },
			shape: 'box',
			size: { x: width, y: 0.05, z: depth },
			solid: false,
			texturePolicy: { forestUndergrowth: true, publicFirebase: true, tileWorld: 5 },
			textureUrl: index % 2
				? FOREST_MATERIALS.forestFloorLeaves
				: FOREST_MATERIALS.forestFloorDark,
			userData: { family: 'reference-forest-edge', part: 'forest-floor' }
		};
	});
}

function appendTree(parts, point, index, groundSampler) {
	const [x, z] = point;
	const y = villageGroundHeight(groundSampler, x, z);
	parts.ferns.push(box(x + Math.sin(index) * 2, y + 0.32, z + Math.cos(index) * 2, 2.4, 0.6, 2.4));
	parts.moss.push(box(x - Math.cos(index) * 1.7, y + 0.09, z + Math.sin(index) * 1.7, 2.8, 0.16, 2.8));
}

function appendLog(parts, point, groundSampler) {
	const [x, z] = point;
	const y = villageGroundHeight(groundSampler, x, z);
	parts.logs.push({
		position: { x, y: y + 0.28, z },
		size: { x: 3.8, y: 0.55, z: 0.65 },
		yaw: 0.35
	});
}

function batch(id, boxes, color, textureUrl, part) {
	if (!boxes.length) return null;
	return createVillageBoxBatch(id, boxes, {
		color,
		family: 'reference-forest-edge',
		part,
		texturePolicy: { forestUndergrowth: true },
		textureUrl
	});
}

function box(x, y, z, sx, sy, sz) {
	return {
		position: { x, y, z },
		size: { x: sx, y: sy, z: sz },
		yaw: 0
	};
}
