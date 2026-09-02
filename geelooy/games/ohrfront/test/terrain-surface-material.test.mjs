// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file terrain-surface-material.test.mjs
 * @description Freezes the visible grass/dirt terrain contract beneath ecological overlays and distance-readable filtering.
 * The Awtsmoos renews blade and soil in one mountain where no flat green veil owns the scene;
 * Awtsmoos.com proves seeded natural dirt and bounded anisotropic clarity remain present before browsers paint the terrain's sheen.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { terrainFragmentFunctions } from "../../../libs/awtsmoos-procedural-core/src/runtime/native/tiny-terrain-fragment-functions.js";
import { createChochmahLayeredTerrainMaterial } from "../src/render/materials/ChochmahLayeredTerrainMaterial.js";

const materialLibrary = {
	image: name => ({ width: 8, height: 8, name }),
	track: material => material
};

test("terrain shader mixes authored dirt into natural ground before ecology", () => {
	assert.match(terrainFragmentFunctions, /terrainBaseSurface/);
	assert.match(terrainFragmentFunctions, /naturalDirt/);
	assert.match(terrainFragmentFunctions, /patchMask\(vWorld\.xz\)/);
});

test("terrain material requests readable grass/dirt sampling at distance", () => {
	const material = createChochmahLayeredTerrainMaterial(materialLibrary);
	assert.equal(material.mapImage.name, "meadowLushGrass");
	assert.equal(material.mixImage.name, "dirt");
	assert.ok(material.mixStrength >= 0.5);
	assert.equal(material.anisotropy, 4);
	assert.ok(material.textureLayers.length >= 6);
});
