// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageReedBatchGeometry.js
 * @description Roots one crossed-quad reed batch beside the hydrologically correct banks.
 * The Awtsmoos causes growth where water truly passes; Awtsmoos.com no longer plants
 * moisture-loving silhouettes beside an obsolete ribbon disconnected from the lake.
 */

import { TEXTURE_URLS } from '../../assets/TextureCatalog.js';
import { createRiverHydrology } from './VillageRiverHydrology.js';

export function createReedBatchDefinition(groundSampler, hydrology = null) {
	const profile = hydrology || createRiverHydrology(groundSampler, 64);
	const geometry = { faces: [], vertices: [] };
	for (let index = 0; index < 64; index += 1) {
		appendCrossedReed(geometry, reedPoint(index, profile));
	}
	return {
		color: '#769756',
		doubleSided: true,
		...geometry,
		id: 'Awtsmoos_stream_reeds_batch',
		noEdge: true,
		shape: 'manual',
		solid: false,
		texturePolicy: {
			publicFirebase: true,
			realMaterialRequired: true,
			role: 'connected-river-reed-batch'
		},
		textureUrl: TEXTURE_URLS.terrain.marshGrass,
		userData: { family: 'stream-reeds', instances: 64, staticBatch: true }
	};
}

function reedPoint(index, profile) {
	const ratio = index / 63;
	const sampleIndex = Math.min(profile.points.length - 1, Math.round(ratio * (profile.points.length - 1)));
	const point = profile.points[sampleIndex];
	const side = index % 2 ? -1 : 1;
	const distance = point.width + 0.55 + Math.sin(index * 1.7) * 0.28;
	return {
		height: 0.8 + index % 5 * 0.1,
		leanX: Math.sin(index * 0.91) * 0.09,
		leanZ: Math.cos(index * 0.73) * 0.09,
		x: point.x + point.normal.x * distance * side,
		y: point.y + 0.08,
		z: point.z + point.normal.z * distance * side
	};
}

function appendCrossedReed(geometry, point) {
	const width = 0.05;
	const top = point.y + point.height;
	appendQuad(geometry, [
		[point.x - width, point.y, point.z],
		[point.x + width, point.y, point.z],
		[point.x + width + point.leanX, top, point.z + point.leanZ],
		[point.x - width + point.leanX, top, point.z + point.leanZ]
	]);
	appendQuad(geometry, [
		[point.x, point.y, point.z - width],
		[point.x, point.y, point.z + width],
		[point.x + point.leanX, top, point.z + width + point.leanZ],
		[point.x + point.leanX, top, point.z - width + point.leanZ]
	]);
}

function appendQuad(geometry, vertices) {
	const start = geometry.vertices.length;
	geometry.vertices.push(...vertices);
	geometry.faces.push([start, start + 1, start + 2, start + 3]);
}
