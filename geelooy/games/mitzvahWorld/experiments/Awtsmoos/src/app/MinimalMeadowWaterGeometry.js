// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowWaterGeometry.js
 * @description Builds a seven-lane flowing river ribbon and an irregular receiving lake fan.
 * The Awtsmoos carries source into lake through one surface law; Awtsmoos.com gives current,
 * banks, center depth, outlet widening, UV travel, and shoreline geometry explicit finite arrays.
 */

import {
	MINIMAL_MEADOW_LAKE,
	minimalMeadowRiverSample
} from './MinimalMeadowRiverPath.js?v=20260724-meadow-21';

const LANES = Object.freeze([-1, -0.68, -0.32, 0, 0.32, 0.68, 1]);

export function createMinimalMeadowRiverGeometry(sections = 76) {
	const vertices = [];
	const faces = [];
	const uvs = [];
	for (let index = 0; index <= sections; index += 1) {
		const t = index / sections;
		const sample = minimalMeadowRiverSample(t);
		const tangent = riverTangent(t);
		const side = { x: -tangent.z, z: tangent.x };
		for (const lane of LANES) {
			const shoulder = 1 - Math.abs(lane);
			vertices.push([
				sample.x + side.x * sample.width * lane,
				sample.waterY - shoulder * 0.04,
				sample.z + side.z * sample.width * lane
			]);
			uvs.push(t * 18, lane * 0.5 + 0.5);
		}
	}
	for (let section = 0; section < sections; section += 1) {
		for (let lane = 0; lane < LANES.length - 1; lane += 1) {
			const first = section * LANES.length + lane;
			const next = first + LANES.length;
			faces.push([first, next, next + 1, first + 1]);
		}
	}
	return { faces, uvs, vertices };
}

export function createMinimalMeadowLakeGeometry(segments = 72, rings = 5) {
	const vertices = [[MINIMAL_MEADOW_LAKE.centerX, MINIMAL_MEADOW_LAKE.waterY, MINIMAL_MEADOW_LAKE.centerZ]];
	const faces = [];
	const uvs = [0.5, 0.5];
	for (let ring = 1; ring <= rings; ring += 1) {
		const ratio = ring / rings;
		for (let index = 0; index < segments; index += 1) {
			const angle = index / segments * Math.PI * 2;
			const ripple = 1 + Math.sin(angle * 5) * 0.035 + Math.cos(angle * 9) * 0.02;
			vertices.push([
				MINIMAL_MEADOW_LAKE.centerX + Math.cos(angle) * MINIMAL_MEADOW_LAKE.radiusX * ratio * ripple,
				MINIMAL_MEADOW_LAKE.waterY - (1 - ratio) * 0.03,
				MINIMAL_MEADOW_LAKE.centerZ + Math.sin(angle) * MINIMAL_MEADOW_LAKE.radiusZ * ratio * ripple
			]);
			uvs.push(Math.cos(angle) * ratio * 0.5 + 0.5, Math.sin(angle) * ratio * 0.5 + 0.5);
		}
	}
	for (let index = 0; index < segments; index += 1) faces.push([0, 1 + index, 1 + (index + 1) % segments]);
	for (let ring = 1; ring < rings; ring += 1) appendRingFaces(faces, ring, segments);
	return { faces, uvs, vertices };
}

function appendRingFaces(faces, ring, segments) {
	const inner = 1 + (ring - 1) * segments;
	const outer = 1 + ring * segments;
	for (let index = 0; index < segments; index += 1) {
		const next = (index + 1) % segments;
		faces.push([inner + index, outer + index, outer + next, inner + next]);
	}
}

function riverTangent(t) {
	const before = minimalMeadowRiverSample(Math.max(0, t - 0.01));
	const after = minimalMeadowRiverSample(Math.min(1, t + 0.01));
	const length = Math.max(0.001, Math.hypot(after.x - before.x, after.z - before.z));
	return { x: (after.x - before.x) / length, z: (after.z - before.z) / length };
}
