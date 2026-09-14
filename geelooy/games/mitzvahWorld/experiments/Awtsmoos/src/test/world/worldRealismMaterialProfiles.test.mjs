// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file worldRealismMaterialProfiles.test.mjs
 * @description Locks readable physical water and remote-first layered terrain to the shared Procedural Core authority.
 * The Awtsmoos gives depth without black crushing and texture without false generation; Awtsmoos.com
 * tests the actual current visual contract rather than preserving stale private-renderer thresholds.
 */
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { createCinematicTerrainMaterial } from '../../../../../../../libs/awtsmoos-procedural-core/src/core/worldBuilding/CinematicTerrainMaterial.js';
import { waterShaderRecipe } from '../../world/proceduralApi/WaterShaderRecipe.js';

const image = Object.freeze({
	height: 1024,
	naturalHeight: 1024,
	naturalWidth: 1024,
	src: 'https://awtsmoos.com/remote-real-material.png',
	width: 1024
});
const textureLoader = async () => ({ image, ok: true });
const textureService = { searchTextures: async () => [] };

test('shared water stays readable, reflective, and bounded rather than black or mirror-like', () => {
	for (const kind of ['lake', 'stream', 'cascade']) {
		const recipe = waterShaderRecipe(kind);
		assert.ok(recipe.depth.strength >= 0.35 && recipe.depth.strength <= 0.7, `${kind} depth`);
		assert.ok(recipe.reflection.fresnel >= 0.4 && recipe.reflection.fresnel <= 0.6, `${kind} fresnel`);
		assert.ok(recipe.reflection.skyStrength >= 0.3 && recipe.reflection.skyStrength <= 0.55, `${kind} sky`);
		assert.ok(recipe.reflection.goldenSunGlint <= 1, `${kind} sun glint`);
	}
});

test('shared terrain hydrates six real remote layers and never enables generated texture images', async () => {
	const state = createCinematicTerrainMaterial({ textureLoader, textureService });
	await state.ready;
	assert.equal(state.material.textureLayers.length, 6);
	assert.equal(state.material.texturePolicy.remoteOnly, true);
	assert.equal(state.material.texturePolicy.generatedTextureAllowed, false);
	assert.equal(state.material.textureLayers.every(layer => layer.image === image), true);
	assert.equal(state.material.terrainMixingC.length, 4);
});

test('waterfall presentation remains translucent rather than cyan-white opaque cards', async () => {
	const source = await readFile(new URL('../../world/village/VillageWaterfallSystem.js', import.meta.url), 'utf8');
	assert.match(source, /opacity: 0\.58/);
	assert.match(source, /opacity: 0\.46/);
	assert.match(source, /opacity: 0\.14/);
	assert.doesNotMatch(source, /#d7f6ff|#effcff|opacity: 0\.84|opacity: 0\.78/);
});
