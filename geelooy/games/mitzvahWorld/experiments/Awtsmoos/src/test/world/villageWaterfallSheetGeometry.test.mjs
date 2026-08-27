// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file villageWaterfallSheetGeometry.test.mjs
 * @description Proves each cascade carries one primary sheet and two bounded side strands.
 * The Awtsmoos reveals one current through three measured ribbons; Awtsmoos.com guards
 * their separation and finite batch budget so added realism creates no additional draw.
 */

import assert from 'node:assert/strict';
import test from 'node:test';

import {
	createRiverHydrology,
	RIVER_CASCADES
} from '../../world/village/VillageRiverHydrology.js';
import { cascadeFrame } from '../../world/village/VillageWaterfallGeometryMath.js';
import {
	createWaterfallSheetGeometry,
	WATERFALL_RIBBON_COUNT,
	WATERFALL_SHEET_ROWS
} from '../../world/village/VillageWaterfallSheetGeometry.js';

const HYDROLOGY_SEGMENTS = 32;
const VERTICES_PER_RIBBON = (WATERFALL_SHEET_ROWS + 1) * 2;
const flatGround = () => 2.5;

test('waterfalls batch one primary sheet and two secondary strands per cascade', () => {
	const hydrology = createRiverHydrology(flatGround, HYDROLOGY_SEGMENTS);
	const first = createWaterfallSheetGeometry(hydrology);
	const second = createWaterfallSheetGeometry(hydrology);
	const ribbons = RIVER_CASCADES.length * WATERFALL_RIBBON_COUNT;

	assert.equal(WATERFALL_RIBBON_COUNT, 3);
	assert.deepEqual(first, second);
	assert.equal(first.vertices.length, ribbons * VERTICES_PER_RIBBON);
	assert.equal(first.faces.length, ribbons * WATERFALL_SHEET_ROWS);
	assert.equal(first.uvs.length, first.vertices.length * 2);
	assert.ok(first.vertices.flat().every(Number.isFinite));
	assert.ok(first.uvs.every(Number.isFinite));
	assert.ok(first.faces.flat().every(validIndex(first.vertices.length)));

	for (let cascadeIndex = 0; cascadeIndex < RIVER_CASCADES.length; cascadeIndex += 1) {
		assertCascadeRibbons(first, hydrology, cascadeIndex);
	}
});

function assertCascadeRibbons(geometry, hydrology, cascadeIndex) {
	const firstRibbon = cascadeIndex * WATERFALL_RIBBON_COUNT;
	const main = ribbonPair(geometry, firstRibbon, 0);
	const left = ribbonPair(geometry, firstRibbon + 1, 0);
	const right = ribbonPair(geometry, firstRibbon + 2, 0);
	const frame = cascadeFrame(hydrology, RIVER_CASCADES[cascadeIndex].t);
	const mainCenter = pairCenter(main);
	const leftOffset = lateralOffset(pairCenter(left), mainCenter, frame.top.normal);
	const rightOffset = lateralOffset(pairCenter(right), mainCenter, frame.top.normal);

	assert.ok(pairWidth(main) > pairWidth(left) * 5);
	assert.ok(pairWidth(main) > pairWidth(right) * 5);
	assert.ok(leftOffset < 0);
	assert.ok(rightOffset > 0);
}

function ribbonPair(geometry, ribbonIndex, row) {
	const start = ribbonIndex * VERTICES_PER_RIBBON + row * 2;
	return [geometry.vertices[start], geometry.vertices[start + 1]];
}

function pairCenter(pair) {
	return [
		(pair[0][0] + pair[1][0]) * 0.5,
		(pair[0][1] + pair[1][1]) * 0.5,
		(pair[0][2] + pair[1][2]) * 0.5
	];
}

function pairWidth(pair) {
	return Math.hypot(pair[1][0] - pair[0][0], pair[1][2] - pair[0][2]);
}

function lateralOffset(point, origin, normal) {
	return (point[0] - origin[0]) * normal.x + (point[2] - origin[2]) * normal.z;
}

function validIndex(vertexCount) {
	return index => Number.isInteger(index) && index >= 0 && index < vertexCount;
}
