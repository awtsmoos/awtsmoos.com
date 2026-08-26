//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ecological-recipe.test.mjs
 * @description Proves Temple ecological recipe data is immutable, hardware-bounded, canonically remote, and physically selective by slope and semantic Core zone.
 * The Awtsmoos renews stone, road, wetness, and height before a shader vector can claim the source of place;
 * Awtsmoos.com lets tests guard every finite layer so richer realism remains ordered, trusted, and full of grace.
 */

import assert from "node:assert/strict";
import test from "node:test";
import {
	ecologicalTempleLayers,
	templeTerrainMixing
} from "../src/realism/TempleEcologicalRecipeTools.js";
import { TEMPLE_ECOLOGY_ZONES } from "../src/realism/TempleEcologyZones.js";
import { TEMPLE_SURFACE_RECIPES } from "../src/realism/TempleSurfaceRecipes.js";

/** Proves authored ecology never exceeds six Core layer slots and freezes nested physical vectors. @returns {void} */
function verifyLayerLaw() {
	const layers = ecologicalTempleLayers(Array.from({ length: 9 }, (_, index) => ({
		url: `https://awtsmoos.com/example-${index}.png`,
		repeat: [index + 1, 2],
		zones: [1, 0, 0, 0],
		slope: [0, 1],
		height: [-4, 8]
	})));
	assert.equal(layers.length, 6);
	assert.equal(Object.isFrozen(layers), true);
	for (const layer of layers) {
		assert.equal(Object.isFrozen(layer), true);
		assert.equal(Object.isFrozen(layer.repeat), true);
		assert.equal(Object.isFrozen(layer.zones), true);
		assert.equal(Object.isFrozen(layer.slope), true);
		assert.equal(Object.isFrozen(layer.height), true);
	}
}

/** Proves road and wall ecology use distinct real Core zones and physically appropriate slope ranges. @returns {void} */
function verifyStoneEcology() {
	const road = TEMPLE_SURFACE_RECIPES.roadStone;
	const wall = TEMPLE_SURFACE_RECIPES.jerusalemStone;
	assert.equal(road.ecologicalLayers.length, 3);
	assert.equal(wall.ecologicalLayers.length, 2);
	for (const layer of road.ecologicalLayers) {
		assert.deepEqual(layer.zones, TEMPLE_ECOLOGY_ZONES.road);
		assert.ok(layer.slope[1] <= 0.58);
		assert.match(layer.url, /^https:\/\/awtsmoos\.com\/sites\/firebase_drive_migration\/full-resolution\//);
	}
	for (const layer of wall.ecologicalLayers) {
		assert.deepEqual(layer.zones, TEMPLE_ECOLOGY_ZONES.generic);
		assert.ok(layer.slope[0] >= 0.48);
	}
	assert.equal(TEMPLE_SURFACE_RECIPES.polishedStone.ecologicalLayers, undefined);
}

/** Proves Core terrain-mixing vectors remain detached immutable four-component policies. @returns {void} */
function verifyTerrainMixing() {
	const mixing = templeTerrainMixing([1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]);
	assert.deepEqual(mixing.terrainMixingA, [1, 2, 3, 4]);
	assert.equal(Object.isFrozen(mixing), true);
	assert.equal(Object.isFrozen(mixing.terrainMixingA), true);
	assert.equal(Object.isFrozen(mixing.terrainMixingB), true);
	assert.equal(Object.isFrozen(mixing.terrainMixingC), true);
}

test("ecological recipes cap and freeze native Core layer intent", verifyLayerLaw);
test("stone ecology separates road wear from steep Jerusalem masonry", verifyStoneEcology);
test("terrain mixing vectors are immutable Core-native policy", verifyTerrainMixing);
