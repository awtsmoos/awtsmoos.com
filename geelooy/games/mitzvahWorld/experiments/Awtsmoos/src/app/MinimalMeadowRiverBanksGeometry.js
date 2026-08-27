// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowRiverBanksGeometry.js
 * @description Builds readable soil transitions beside the river and around the receiving lake.
 * The Awtsmoos distinguishes water from earth without tearing their union; Awtsmoos.com raises
 * inner lips, follows real terrain outside, and gives mobile eyes a continuous shore-depth cue.
 */

import { minimalMeadowHeightAt } from './MinimalMeadowTerrainShape.js?v=20260724-meadow-21';
import {
	MINIMAL_MEADOW_LAKE,
	MINIMAL_MEADOW_RIVER_SEGMENTS,
	minimalMeadowRiverSample
} from './MinimalMeadowRiverPath.js';

export function createMinimalMeadowRiverBanksGeometry(sections = MINIMAL_MEADOW_RIVER_SEGMENTS) {
	const vertices = [];
	const faces = [];
	const uvs = [];
	for (let index = 0; index <= sections; index += 1) {
		const t = index / sections;
		const sample = minimalMeadowRiverSample(t);
		const side = riverSide(t);
		for (const direction of [-1, 1]) {
			for (const addition of [0.15, 2.4, 5.4]) {
				const distance = sample.width + addition;
				const x = sample.x + side.x * distance * direction;
				const z = sample.z + side.z * distance * direction;
				const y = Math.max(sample.waterY + 0.08, minimalMeadowHeightAt(x, z) + 0.045);
				vertices.push([x, y, z]);
				uvs.push(t * 12, addition / 5.4);
			}
		}
	}
	for (let section = 0; section < sections; section += 1) {
		for (let sideIndex = 0; sideIndex < 2; sideIndex += 1) {
			const first = section * 6 + sideIndex * 3;
			const next = first + 6;
			faces.push([first, next, next + 1, first + 1]);
			faces.push([first + 1, next + 1, next + 2, first + 2]);
		}
	}
	return { faces, uvs, vertices };
}

export function createMinimalMeadowLakeShoreGeometry(segments = 72) {
	const vertices = [];
	const faces = [];
	const uvs = [];
	const rings = [1.0, 1.1, 1.28];
	for (let ring = 0; ring < rings.length; ring += 1) {
		for (let index = 0; index < segments; index += 1) {
			const angle = index / segments * Math.PI * 2;
			const x = MINIMAL_MEADOW_LAKE.centerX + Math.cos(angle) * MINIMAL_MEADOW_LAKE.radiusX * rings[ring];
			const z = MINIMAL_MEADOW_LAKE.centerZ + Math.sin(angle) * MINIMAL_MEADOW_LAKE.radiusZ * rings[ring];
			const y = Math.max(MINIMAL_MEADOW_LAKE.waterY + 0.08, minimalMeadowHeightAt(x, z) + 0.045);
			vertices.push([x, y, z]);
			uvs.push(index / segments * 8, ring / 2);
		}
	}
	for (let ring = 0; ring < rings.length - 1; ring += 1) {
		for (let index = 0; index < segments; index += 1) {
			const next = (index + 1) % segments;
			const inner = ring * segments;
			const outer = (ring + 1) * segments;
			faces.push([inner + index, outer + index, outer + next, inner + next]);
		}
	}
	return { faces, uvs, vertices };
}

function riverSide(t) {
	const before = minimalMeadowRiverSample(Math.max(0, t - 0.01));
	const after = minimalMeadowRiverSample(Math.min(1, t + 0.01));
	const length = Math.max(0.001, Math.hypot(after.x - before.x, after.z - before.z));
	return { x: -(after.z - before.z) / length, z: (after.x - before.x) / length };
}
