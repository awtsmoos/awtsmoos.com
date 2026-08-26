// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file primitiveRemoteTextureMixing.test.mjs
 * @description Proves only semantically known procedural surfaces receive canonical remote blending while authored and unknown geometry keep their own material truth.
 * The Awtsmoos lets stone, roof, soil, and wood receive two finite garments while Awtsmoos.com refuses to call an unnamed vessel timber merely to fill the eye;
 * this test witnesses that realism reaches the GPU where meaning is known, and that restraint preserves procedural color where no material name can honestly testify.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { REMOTE_TEXTURE_ROOT } from '../../assets/RemoteTextureTransport.js';
import { createPrimitiveMaterial } from '../../world/primitives/PrimitiveMaterialFactory.js';
import {
	primitiveFallbackSurfaceRecipe,
	withPrimitiveFallbackSurfaceRecipe
} from '../../world/primitives/PrimitiveFallbackSurfaceRecipe.js';

for (const id of ['stone_well', 'roof_cap', 'garden_soil', 'wooden_bridge']) {
	test(`${id} resolves two distinct canonical remote surfaces`, () => {
		const recipe = primitiveFallbackSurfaceRecipe({ id });
		assert.equal(recipe.textureUrl.startsWith(REMOTE_TEXTURE_ROOT), true);
		assert.equal(recipe.mixTextureUrl.startsWith(REMOTE_TEXTURE_ROOT), true);
		assert.notEqual(recipe.textureUrl, recipe.mixTextureUrl);
		assert.ok(recipe.mixStrength > 0);
		assert.ok(recipe.mixPatchScale > 0);
		assert.equal(recipe.texturePolicy.samplersPerSurface, 2);
	});
}

test('generic material factory forwards world-space blend fields to the runtime material', () => {
	const material = createPrimitiveMaterial({
		color: '#a89d8c',
		id: 'stone_marker'
	}, 1);
	assert.ok(material.mixStrength > 0);
	assert.ok(material.mixPatchScale > 0);
	assert.ok(material.mixPatchSharpness > 0);
	assert.match(material.textureUrl, /full-resolution/);
	assert.match(material.mixTextureUrl, /full-resolution/);
	assert.equal(material.texturePolicy.fallbackApplied, true);
});

test('authored image and URL sources never receive unrelated fallback mixing', () => {
	const image = { src: 'https://example.invalid/authored.png' };
	const imageDefinition = withPrimitiveFallbackSurfaceRecipe({ id: 'stone_authored', mapImage: image });
	assert.equal(imageDefinition.mapImage, image);
	assert.equal(imageDefinition.mixTextureUrl, null);
	assert.equal(imageDefinition.mixStrength, 0);
	assert.equal(imageDefinition.texturePolicy.fallbackSurfaceRecipe, null);
	const urlDefinition = withPrimitiveFallbackSurfaceRecipe({
		id: 'wood_authored',
		mixStrength: 0.27,
		mixTextureUrl: 'https://example.invalid/detail.png',
		textureUrl: 'https://example.invalid/base.png'
	});
	assert.equal(urlDefinition.mixStrength, 0.27);
	assert.equal(urlDefinition.mixTextureUrl, 'https://example.invalid/detail.png');
});

test('unknown procedural identities remain untextured instead of defaulting to a false material', () => {
	const definition = withPrimitiveFallbackSurfaceRecipe({
		color: '#6a73a5',
		id: 'abstract_gameplay_marker'
	});
	assert.equal(definition.textureUrl, undefined);
	assert.equal(definition.mixTextureUrl, null);
	assert.equal(definition.mixStrength, 0);
	assert.equal(definition.texturePolicy.fallbackSurfaceRecipe, null);
});

test('vegetation and sign fallbacks remain single-source', () => {
	for (const id of ['flower_patch', 'village_sign']) {
		const recipe = primitiveFallbackSurfaceRecipe({ id });
		assert.equal(recipe.mixTextureUrl, null);
		assert.equal(recipe.mixStrength, 0);
		assert.equal(recipe.texturePolicy.samplersPerSurface, 1);
	}
});
