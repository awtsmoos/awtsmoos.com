// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowWaterGeometry.js
 * @description Builds aligned river/lake surfaces and beds from the same sampled hydrology.
 * The Awtsmoos carries one current above one carved channel; Awtsmoos.com keeps every lane,
 * bed vertex, UV, and receiving basin finite so water neither floats nor vanishes underground.
 */

import { minimalMeadowHeightAt } from './MinimalMeadowTerrainShape.js?v=20260724-meadow-21';
import {
	MINIMAL_MEADOW_LAKE,
	MINIMAL_MEADOW_RIVER_SEGMENTS,
	minimalMeadowRiverSample
} from './MinimalMeadowRiverPath.js';

const LANES = Object.freeze([-1, -0.68, -0.32, 0, 0.32, 0.68, 1]);

export function createMinimalMeadowRiverGeometry(sections = MINIMAL_MEADOW_RIVER_SEGMENTS) {
	return createRiverRibbon(sections, false);
}

export function createMinimalMeadowRiverBedGeometry(sections = MINIMAL_MEADOW_RIVER_SEGMENTS) {
	return createRiverRibbon(sections, true);
}

export function createMinimalMeadowLakeGeometry(segments = 72, rings = 5) {
	return createLakeFan(segments, rings, false);
}

export function createMinimalMeadowLakeBedGeometry(segments = 72, rings = 5) {
	return createLakeFan(segments, rings, true);
}

function createRiverRibbon(sections, bed) {
	const vertices = [];
	const faces = [];
	const uvs = [];
	for (let index = 0; index <= sections; index += 1) {
		const t = index / sections;
		const sample = minimalMeadowRiverSample(t);
		const side = riverSide(t);
		for (const lane of LANES) {
			const x = sample.x + side.x * sample.width * lane;
			const z = sample.z + side.z * sample.width * lane;
			const surfaceY = sample.waterY - (1 - Math.abs(lane)) * 0.035;
			vertices.push([x, bed ? minimalMeadowHeightAt(x, z) + 0.035 : surfaceY, z]);
			uvs.push(t * 18, lane * 0.5 + 0.5);
		}
	}
	appendStripFaces(faces, sections, LANES.length);
	return { faces, uvs, vertices };
}

function createLakeFan(segments, rings, bed) {
	const centerY = bed
		? minimalMeadowHeightAt(MINIMAL_MEADOW_LAKE.centerX, MINIMAL_MEADOW_LAKE.centerZ) + 0.035
		: MINIMAL_MEADOW_LAKE.waterY;
	const vertices = [[MINIMAL_MEADOW_LAKE.centerX, centerY, MINIMAL_MEADOW_LAKE.centerZ]];
	const faces = [];
	const uvs = [0.5, 0.5];
	for (let ring = 1; ring <= rings; ring += 1) {
		const ratio = ring / rings;
		for (let index = 0; index < segments; index += 1) {
			const angle = index / segments * Math.PI * 2;
			const ripple = 1 + Math.sin(angle * 5) * 0.035 + Math.cos(angle * 9) * 0.02;
			const x = MINIMAL_MEADOW_LAKE.centerX + Math.cos(angle) * MINIMAL_MEADOW_LAKE.radiusX * ratio * ripple;
			const z = MINIMAL_MEADOW_LAKE.centerZ + Math.sin(angle) * MINIMAL_MEADOW_LAKE.radiusZ * ratio * ripple;
			const y = bed ? minimalMeadowHeightAt(x, z) + 0.035 : MINIMAL_MEADOW_LAKE.waterY;
			vertices.push([x, y, z]);
			uvs.push(Math.cos(angle) * ratio * 0.5 + 0.5, Math.sin(angle) * ratio * 0.5 + 0.5);
		}
	}
	for (let index = 0; index < segments; index += 1) {
		faces.push([0, 1 + index, 1 + (index + 1) % segments]);
	}
	for (let ring = 1; ring < rings; ring += 1) {
		appendRingFaces(faces, ring, segments);
	}
	return { faces, uvs, vertices };
}

function appendStripFaces(faces, sections, laneCount) {
	for (let section = 0; section < sections; section += 1) {
		for (let lane = 0; lane < laneCount - 1; lane += 1) {
			const first = section * laneCount + lane;
			const next = first + laneCount;
			faces.push([first, next, next + 1, first + 1]);
		}
	}
}

function appendRingFaces(faces, ring, segments) {
	const inner = 1 + (ring - 1) * segments;
	const outer = 1 + ring * segments;
	for (let index = 0; index < segments; index += 1) {
		const next = (index + 1) % segments;
		faces.push([inner + index, outer + index, outer + next, inner + next]);
	}
}

function riverSide(t) {
	const before = minimalMeadowRiverSample(Math.max(0, t - 0.01));
	const after = minimalMeadowRiverSample(Math.min(1, t + 0.01));
	const length = Math.max(0.001, Math.hypot(after.x - before.x, after.z - before.z));
	return { x: -(after.z - before.z) / length, z: (after.x - before.x) / length };
}
