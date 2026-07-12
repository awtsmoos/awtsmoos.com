// B"H
import { TEXTURE_URLS } from '../../assets/TextureCatalog.js';
import { sampleStream } from './VillageCurves.js';
import { villageGroundHeight } from './VillageGroundSampling.js';

/**
 * Holds sixty-four stream reeds inside one crossed-quad geometry batch.
 * Deterministic lean keeps the bank alive without sixty-four separate draw submissions.
 */
export function createReedBatchDefinition(groundSampler) {
	const geometry = { vertices: [], faces: [] };
	const streamPoints = sampleStream(64);
	for (let index = 0; index < 64; index += 1) {
		const point = reedPoint(index, streamPoints, groundSampler);
		appendCrossedReed(geometry, point);
	}
	return {
		id: 'Awtsmoos_stream_reeds_batch',
		shape: 'manual',
		...geometry,
		color: '#7f9f55',
		textureUrl: TEXTURE_URLS.terrain.marshGrass,
		doubleSided: true,
		solid: false,
		noEdge: true,
		texturePolicy: {
			role: 'stream-reed-batch',
			publicFirebase: true,
			realMaterialRequired: true
		},
		userData: { staticBatch: true, family: 'stream-reeds', instances: 64 }
	};
}

function reedPoint(index, streamPoints, groundSampler) {
	const streamPoint = streamPoints[index];
	const side = index % 2 ? -1 : 1;
	const x = streamPoint.x + side * (streamPoint.width + 0.75);
	const z = streamPoint.z + Math.sin(index * 1.7) * 0.55;
	return {
		x,
		y: villageGroundHeight(groundSampler, x, z) + 0.18,
		z,
		height: 0.85 + (index % 5) * 0.09,
		leanX: Math.sin(index * 0.91) * 0.09,
		leanZ: Math.cos(index * 0.73) * 0.09
	};
}

function appendCrossedReed(geometry, point) {
	const width = 0.045;
	const bottom = point.y;
	const top = point.y + point.height;
	appendQuad(geometry, [
		[point.x - width, bottom, point.z],
		[point.x + width, bottom, point.z],
		[point.x + width + point.leanX, top, point.z + point.leanZ],
		[point.x - width + point.leanX, top, point.z + point.leanZ]
	]);
	appendQuad(geometry, [
		[point.x, bottom, point.z - width],
		[point.x, bottom, point.z + width],
		[point.x + point.leanX, top, point.z + width + point.leanZ],
		[point.x + point.leanX, top, point.z - width + point.leanZ]
	]);
}

function appendQuad(geometry, vertices) {
	const start = geometry.vertices.length;
	geometry.vertices.push(...vertices);
	geometry.faces.push([start, start + 1, start + 2, start + 3]);
}
