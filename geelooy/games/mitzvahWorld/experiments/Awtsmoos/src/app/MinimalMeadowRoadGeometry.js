// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowRoadGeometry.js
 * @description Builds a seven-band Bézier road lifted slightly above terrain-owned collision.
 * The Awtsmoos distinguishes a visible road from the earth that supports it; Awtsmoos.com raises
 * only the rendered garment by six centimeters so cobblestone, dirt shoulder, and grass never fight.
 */

import { BufferAttribute, BufferGeometry } from '../../../light-three-gltf/tiny-runtime.js';
import {
	minimalMeadowRoadSamples,
	minimalMeadowRoadWeights
} from './MinimalMeadowBezierPath.js';

const CROSS_OFFSETS = Object.freeze([-7.6, -5.8, -4.4, 0, 4.4, 5.8, 7.6]);
const ROAD_TEXTURE_WORLD_LENGTH = 8;
export const MINIMAL_MEADOW_ROAD_SURFACE_LIFT = 0.06;

export function createMinimalMeadowRoadGeometryData(heightAt, options = {}) {
	const sampleCount = options.segments || (options.mobile ? 72 : 128);
	const samples = minimalMeadowRoadSamples(sampleCount);
	const arrays = createArrays();
	for (const sample of samples) appendCrossSection(sample, heightAt, arrays);
	appendIndices(samples.length, arrays.indices);
	return freezeGeometryData(samples.length, arrays);
}

export function createMinimalMeadowRoadGeometry(data) {
	const geometry = new BufferGeometry();
	geometry.setAttribute('position', new BufferAttribute(data.positions, 3));
	geometry.setAttribute('normal', new BufferAttribute(data.normals, 3));
	geometry.setAttribute('uv', new BufferAttribute(data.uvs, 2));
	geometry.setAttribute('zone', new BufferAttribute(data.zones, 4));
	geometry.setIndex(new BufferAttribute(data.indices, 1));
	return geometry;
}

function appendCrossSection(sample, heightAt, arrays) {
	for (const lateral of CROSS_OFFSETS) {
		const x = sample.point.x + sample.normal.x * lateral;
		const z = sample.point.z + sample.normal.z * lateral;
		const weights = minimalMeadowRoadWeights(x, z);
		arrays.positions.push(x, heightAt(x, z) + MINIMAL_MEADOW_ROAD_SURFACE_LIFT, z);
		arrays.normals.push(0, 1, 0);
		arrays.uvs.push(
			(lateral - CROSS_OFFSETS[0]) / roadWidth(),
			sample.distance / ROAD_TEXTURE_WORLD_LENGTH
		);
		arrays.zones.push(weights.grass, weights.center, weights.shoulder, 0);
	}
}

function appendIndices(rowCount, indices) {
	for (let row = 0; row < rowCount - 1; row += 1) {
		for (let column = 0; column < CROSS_OFFSETS.length - 1; column += 1) {
			const first = row * CROSS_OFFSETS.length + column;
			const next = first + CROSS_OFFSETS.length;
			indices.push(first, next, first + 1, first + 1, next, next + 1);
		}
	}
}

function createArrays() {
	return { indices: [], normals: [], positions: [], uvs: [], zones: [] };
}

function freezeGeometryData(crossSections, arrays) {
	return Object.freeze({
		evidence: Object.freeze({
			alignedToTerrainHeight: true,
			collisionOffset: 0,
			crossSections,
			finite: [...arrays.positions, ...arrays.uvs, ...arrays.zones].every(Number.isFinite),
			longitudinalTextureWorld: ROAD_TEXTURE_WORLD_LENGTH,
			surfaceOffset: MINIMAL_MEADOW_ROAD_SURFACE_LIFT,
			weightsPerVertex: 3
		}),
		indices: new Uint32Array(arrays.indices),
		normals: new Float32Array(arrays.normals),
		positions: new Float32Array(arrays.positions),
		uvs: new Float32Array(arrays.uvs),
		width: roadWidth(),
		zones: new Float32Array(arrays.zones)
	});
}

function roadWidth() {
	return CROSS_OFFSETS.at(-1) - CROSS_OFFSETS[0];
}
