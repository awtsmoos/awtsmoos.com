// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageWaterfallGeometry.test.mjs
 * @description Proves subdivided sheets, impact ribbons, and crossed mist remain batched.
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

test('waterfall sheets are subdivided and remain one deterministic batch', () => {
	const geometry = createWaterfallSheetGeometry(profile);
	assert.equal(geometry.vertices.length, RIVER_CASCADES.length * (WATERFALL_SHEET_ROWS + 1) * 2);
	assert.equal(geometry.faces.length, RIVER_CASCADES.length * WATERFALL_SHEET_ROWS);
	assert.equal(geometry.uvs.length, geometry.vertices.length * 2);
	for (let index = 0; index < geometry.vertices.length; index += 2) {
		assert.ok(geometry.vertices[index][1] >= geometry.vertices[index + 1][1] - 0.0001);
	}
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
