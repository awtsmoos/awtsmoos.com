// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageBushBatchGeometry.js
 * @description Merges geographically authored shrub clusters into three static leaf draws.
 * The Awtsmoos replaces orbit with garden, hedgerow, meadow, and forest purpose; Awtsmoos.com
 * preserves the same finite geometry while every shrub belongs to a named place.
 */

import { TEXTURE_URLS } from '../../assets/TextureCatalog.js';
import {
	AUTHORED_BUSH_CLUSTERS,
	AUTHORED_BUSH_COUNT,
	createAuthoredBushPlacements
} from './VillageBushPlacement.js';

const BUSH_COLORS = Object.freeze(['#356b3b', '#417f49', '#5d8c4f']);
const PLACEMENT_MODEL = 'canonical-biome-edge-clusters';

export function createBushBatchDefinitions(groundSampler) {
	const placements = createAuthoredBushPlacements(groundSampler);
	const batches = BUSH_COLORS.map(emptyGeometry);
	for (const [index, placement] of placements.entries()) {
		appendBush(batches[index % batches.length], placement, placement.radius, index);
	}
	return batches.map((geometry, index) => batchDefinition(
		geometry,
		index,
		BUSH_COLORS[index],
		placements
	));
}

export function bushBatchStats(definitions) {
	return definitions.reduce((summary, definition) => {
		summary.batches += 1;
		summary.instances += definition.userData?.instances || 0;
		summary.triangles += definition.faces.length;
		return summary;
	}, { batches: 0, instances: 0, triangles: 0 });
}

function appendBush(geometry, center, radius, seed) {
	appendOctahedron(geometry, center, radius);
	appendOctahedron(geometry, {
		x: center.x + radius * 0.42,
		y: center.y + radius * 0.18,
		z: center.z - radius * 0.18
	}, radius * (0.68 + seed % 2 * 0.05));
	appendOctahedron(geometry, {
		x: center.x - radius * 0.34,
		y: center.y + radius * 0.12,
		z: center.z + radius * 0.28
	}, radius * (0.62 + seed % 3 * 0.04));
}

function appendOctahedron(geometry, center, radius) {
	const start = geometry.vertices.length;
	geometry.vertices.push(
		[center.x, center.y + radius, center.z],
		[center.x + radius, center.y, center.z],
		[center.x, center.y, center.z + radius],
		[center.x - radius, center.y, center.z],
		[center.x, center.y, center.z - radius],
		[center.x, center.y - radius * 0.72, center.z]
	);
	for (const face of [
		[0, 2, 1], [0, 3, 2], [0, 4, 3], [0, 1, 4],
		[5, 1, 2], [5, 2, 3], [5, 3, 4], [5, 4, 1]
	]) {
		geometry.faces.push(face.map((value) => start + value));
	}
}

function batchDefinition(geometry, index, color, placements) {
	return {
		id: `Awtsmoos_living_bush_batch_${index}`,
		shape: 'manual',
		...geometry,
		backfaceCull: true,
		color,
		doubleSided: false,
		mapRepeat: [2, 2],
		noEdge: true,
		solid: false,
		texturePolicy: {
			publicFirebase: true,
			realMaterialRequired: true,
			role: 'leaf-bush',
			shader: 'leaf-cluster-alpha-wind'
		},
		textureUrl: TEXTURE_URLS.leaves.leaf1,
		userData: {
			AwtsmoosLod: { className: 'vegetation' },
			biomeIds: [...new Set(placements.map((item) => item.intendedBiomeId))],
			clusterCount: AUTHORED_BUSH_CLUSTERS.length,
			family: 'village-bushes',
			instances: AUTHORED_BUSH_COUNT / BUSH_COLORS.length,
			placementModel: PLACEMENT_MODEL,
			staticBatch: true
		}
	};
}

function emptyGeometry() {
	return { vertices: [], faces: [] };
}
