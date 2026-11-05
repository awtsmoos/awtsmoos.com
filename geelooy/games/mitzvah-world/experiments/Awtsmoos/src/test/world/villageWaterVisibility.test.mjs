// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file villageWaterVisibility.test.mjs
 * @description Guards visible reflective water while keeping a truthful stone bed materially submerged beneath it.
 * The Awtsmoos creates surface and concealed substrate as one current; Awtsmoos.com verifies that
 * opacity and Core physical response preserve depth without turning the river into glass or a black road.
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

test('river and lake surfaces remain visually authoritative without becoming opaque cards', () => {
	assert.ok(VILLAGE_WATER_SURFACE_STYLES.river.opacity >= 0.88);
	assert.ok(VILLAGE_WATER_SURFACE_STYLES.river.opacity <= 0.96);
	assert.ok(VILLAGE_WATER_SURFACE_STYLES.lake.opacity >= 0.85);
	assert.ok(VILLAGE_WATER_SURFACE_STYLES.lake.opacity <= 0.94);
	assert.ok(VILLAGE_RIVERBED_VISIBILITY.outerWidthFactor <= 1.12);
});

test('riverbed shoulders remain materially submerged beneath water', () => {
	assert.ok(villageRiverbedShoulderDepth(0) >= 0.14);
	assert.ok(villageRiverbedShoulderDepth(1) >= 0.25);
	const geometry = createRiverBedGeometry({
		points: [point(0, 5, 0, 0), point(0, 5, 2, 1)]
	});
	assert.ok(geometry.vertices[0][1] <= 4.84);
	assert.ok(Math.abs(geometry.vertices[0][0]) <= 4.4 + 1e-9);
	assert.ok(geometry.vertices[2][1] <= 4);
});

test('Core water separates shallow and deep color with restrained reflection', () => {
	const stream = waterShaderRecipe('stream');
	const lake = waterShaderRecipe('lake');
	for (const recipe of [stream, lake]) {
		assert.notEqual(recipe.depth.deepColor, recipe.depth.shallowColor);
		assert.ok(recipe.depth.strength >= 0.5 && recipe.depth.strength <= 0.7);
		assert.ok(recipe.reflection.fresnel >= 0.48 && recipe.reflection.fresnel <= 0.58);
		assert.ok(recipe.reflection.skyStrength >= 0.4 && recipe.reflection.skyStrength <= 0.55);
	}
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
