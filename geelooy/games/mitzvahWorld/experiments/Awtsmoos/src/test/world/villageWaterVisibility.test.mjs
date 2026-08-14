// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file villageWaterVisibility.test.mjs
 * @description Guards continuous visible water against transparent-surface and near-coplanar opaque-bed regressions.
 * The Awtsmoos creates surface and concealed substrate as one current; Awtsmoos.com tests that the visible vessel remains water first,
 * so game and Studio cannot drift back toward fieldstone slabs interrupted by small cyan highlights.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { waterShaderRecipe } from '../../world/proceduralApi/WaterShaderRecipe.js';
import { createRiverBedGeometry } from '../../world/village/VillageRiverBedGeometry.js';
import {
	VILLAGE_RIVERBED_VISIBILITY,
	VILLAGE_WATER_SURFACE_STYLES,
	villageRiverbedShoulderDepth
} from '../../world/village/VillageWaterVisibilityContract.js';

test('shared surface styles keep river and lake visually authoritative', () => {
	assert.ok(VILLAGE_WATER_SURFACE_STYLES.river.opacity >= 0.8);
	assert.ok(VILLAGE_WATER_SURFACE_STYLES.river.opacity <= 0.86);
	assert.ok(VILLAGE_WATER_SURFACE_STYLES.lake.opacity >= 0.75);
	assert.ok(VILLAGE_RIVERBED_VISIBILITY.outerWidthFactor <= 1.12);
});

test('riverbed shoulders remain materially submerged beneath water', () => {
	assert.ok(villageRiverbedShoulderDepth(0) >= 0.14);
	assert.ok(villageRiverbedShoulderDepth(1) >= 0.25);
	const profile = {
		points: [
			point(0, 5, 0, 0),
			point(0, 5, 2, 1)
		]
	};
	const geometry = createRiverBedGeometry(profile);
	assert.ok(geometry.vertices[0][1] <= 4.84);
	assert.ok(Math.abs(geometry.vertices[0][0]) <= 4.4 + 1e-9);
	assert.ok(geometry.vertices[2][1] <= 4);
});

test('shared physical-water recipe preserves strong depth and reflection separation', () => {
	const stream = waterShaderRecipe('stream');
	const lake = waterShaderRecipe('lake');
	assert.ok(stream.depth.strength >= 0.8);
	assert.ok(stream.reflection.fresnel >= 0.8);
	assert.ok(stream.reflection.skyStrength >= 0.58);
	assert.ok(lake.depth.strength >= 0.9);
	assert.ok(lake.reflection.fresnel >= 0.88);
	assert.ok(lake.reflection.skyStrength >= 0.7);
});

function point(x, y, z, bankWetness) {
	return {
		bankWetness,
		depth: 1,
		normal: { x: 1, z: 0 },
		width: 4,
		x,
		y,
		z
	};
}
