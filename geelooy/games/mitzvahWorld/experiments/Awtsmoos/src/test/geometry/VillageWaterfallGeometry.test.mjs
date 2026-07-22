// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageWaterfallGeometry.test.mjs
 * @description Proves primary sheets, secondary strands, impact ribbons, and mist remain batched.
 * The Awtsmoos descends through measured geometry rather than floating cards; Awtsmoos.com
 * binds every cascade to shared hydrology while preserving fixed draw and vertex budgets.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createRiverHydrology, RIVER_CASCADES } from '../../world/village/VillageRiverHydrology.js';
import { createWaterfallImpactGeometry } from '../../world/village/VillageWaterfallImpactGeometry.js';
import { createWaterfallMistGeometry } from '../../world/village/VillageWaterfallMistGeometry.js';
import {
	createWaterfallSheetGeometry,
	WATERFALL_RIBBON_COUNT,
	WATERFALL_SHEET_ROWS
} from '../../world/village/VillageWaterfallSheetGeometry.js';

const sampler = {
	heightAt(x, z) {
		return { y: 0.4 + x * 0.004 + z * 0.003 };
	},
	sample(x, z) {
		return { height: 0.4 + x * 0.004 + z * 0.003, x, z };
	}
};

const profile = createRiverHydrology(sampler);

test('waterfall ribbons remain one deterministic batch with bounded secondary strands', () => {
	const geometry = createWaterfallSheetGeometry(profile);
	const rowsPerRibbon = WATERFALL_SHEET_ROWS + 1;
	const verticesPerRibbon = rowsPerRibbon * 2;

	assert.equal(WATERFALL_RIBBON_COUNT, 3);
	assert.equal(
		geometry.vertices.length,
		RIVER_CASCADES.length * WATERFALL_RIBBON_COUNT * verticesPerRibbon
	);
	assert.equal(
		geometry.faces.length,
		RIVER_CASCADES.length * WATERFALL_RIBBON_COUNT * WATERFALL_SHEET_ROWS
	);
	assert.equal(geometry.uvs.length, geometry.vertices.length * 2);
	assert.ok(geometry.vertices.flat().every(Number.isFinite));

	const primaryTop = geometry.vertices.slice(0, 2);
	const leftStrandTop = geometry.vertices.slice(verticesPerRibbon, verticesPerRibbon + 2);
	const rightStrandTop = geometry.vertices.slice(verticesPerRibbon * 2, verticesPerRibbon * 2 + 2);
	assert.ok(distance(primaryTop[0], leftStrandTop[1]) > 0.01);
	assert.ok(distance(primaryTop[1], rightStrandTop[0]) > 0.01);
});

test('impact and mist geometry use fixed cascade-scaled budgets', () => {
	const impacts = createWaterfallImpactGeometry(profile);
	const mist = createWaterfallMistGeometry(profile);

	assert.equal(impacts.faces.length, RIVER_CASCADES.length * 3);
	assert.equal(impacts.vertices.length, RIVER_CASCADES.length * 8);
	assert.equal(mist.faces.length, RIVER_CASCADES.length * 2);
	assert.equal(mist.vertices.length, RIVER_CASCADES.length * 8);

	for (const geometry of [impacts, mist]) {
		assert.equal(geometry.uvs.length, geometry.vertices.length * 2);
		assert.ok(geometry.vertices.flat().every(Number.isFinite));
	}
});

function distance(first, second) {
	return Math.hypot(
		first[0] - second[0],
		first[1] - second[1],
		first[2] - second[2]
	);
}
