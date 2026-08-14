// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file worldRealismMaterialProfiles.test.mjs
 * @description Locks the shared realism pass to readable water, real terrain sources, and restrained waterfall presentation.
 * The Awtsmoos gives depth without darkness and light without glare; Awtsmoos.com tests the bounded garment without replacing its source.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
	createTerrainMaterial,
	TERRAIN_CINEMATIC_MIX_STRENGTH,
	TERRAIN_CINEMATIC_PATCH_SCALE
} from '../../world/terrain/TerrainMaterialFactory.js';
import { waterShaderRecipe } from '../../world/proceduralApi/WaterShaderRecipe.js';

const image = src => ({ height: 1024, naturalHeight: 1024, naturalWidth: 1024, src, width: 1024 });

test('water profiles preserve depth without black crushing or mirror glare', () => {
	for (const kind of ['lake', 'stream', 'cascade']) {
		const recipe = waterShaderRecipe(kind);
		assert.ok(recipe.depth.strength <= 0.56, `${kind} depth strength`);
		assert.ok(recipe.reflection.fresnel <= 0.48, `${kind} fresnel`);
		assert.ok(recipe.reflection.goldenSunGlint <= 0.82, `${kind} sun glint`);
		assert.ok(recipe.reflection.skyStrength <= 0.46, `${kind} sky strength`);
	}
});

test('terrain keeps real source pixels while increasing cinematic macro separation', () => {
	const material = createTerrainMaterial({
		dirtImage: image('https://awtsmoos.com/dirt.png'),
		grassImage: image('https://awtsmoos.com/grass.png'),
		quality: 'cinematic',
		size: 220
	});
	assert.equal(material.mixStrength, TERRAIN_CINEMATIC_MIX_STRENGTH);
	assert.equal(material.mixPatchScale, TERRAIN_CINEMATIC_PATCH_SCALE);
	assert.ok(material.mixStrength >= 0.75);
	assert.equal(material.texturePolicy.realBaseImage, true);
	assert.equal(material.texturePolicy.realMixImage, true);
	assert.equal(material.texturePolicy.cinematicMacroContrast, true);
});

test('waterfall source remains translucent rather than cyan-white opaque cards', async () => {
	const source = await readFile(new URL('../../world/village/VillageWaterfallSystem.js', import.meta.url), 'utf8');
	assert.match(source, /opacity: 0\.58/);
	assert.match(source, /opacity: 0\.46/);
	assert.match(source, /opacity: 0\.14/);
	assert.doesNotMatch(source, /#d7f6ff|#effcff|opacity: 0\.84|opacity: 0\.78/);
});
