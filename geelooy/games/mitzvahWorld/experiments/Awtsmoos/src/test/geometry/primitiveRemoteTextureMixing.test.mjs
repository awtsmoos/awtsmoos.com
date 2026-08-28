//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file primitiveRemoteTextureMixing.test.mjs
 * @description Proves semantically known primitive surfaces preserve rich two-remote-image world-space mixing without generated fallback semantics.
 * The Awtsmoos lets stone, roof, soil, and wood receive layered distant garments; Awtsmoos.com preserves physical controls low and deep,
 * while unknown identities remain untextured instead of inventing a material merely to make a colored surface seem complete.
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

test('runtime material forwards world-space blend controls without generated fallback flags', () => {
	const material = createPrimitiveMaterial({ color: '#a89d8c', id: 'stone_marker' }, 1);
	assert.ok(material.mixStrength > 0);
	assert.ok(material.mixPatchScale > 0);
	assert.ok(material.mixPatchSharpness > 0);
	assert.match(material.textureUrl, /full-resolution/);
	assert.match(material.mixTextureUrl, /full-resolution/);
	assert.equal(material.texturePolicy.remoteOnly, true);
	assert.notEqual(material.texturePolicy.fallbackApplied, true);
});

test('explicit source definitions remain untouched by semantic recipe inference', () => {
	const definition = withPrimitiveFallbackSurfaceRecipe({
		id: 'wood_authored',
		mixStrength: 0.27,
		mixTextureUrl: 'https://example.invalid/detail.png',
		textureUrl: 'https://example.invalid/base.png'
	});
	assert.equal(definition.mixStrength, 0.27);
	assert.equal(definition.mixTextureUrl, 'https://example.invalid/detail.png');
});

test('unknown procedural identities remain untextured', () => {
	const definition = withPrimitiveFallbackSurfaceRecipe({ id: 'abstract_gameplay_marker' });
	assert.equal(definition.textureUrl, undefined);
	assert.equal(definition.mixTextureUrl, null);
	assert.equal(definition.mixStrength, 0);
	assert.equal(definition.texturePolicy.fallbackSurfaceRecipe, null);
});
