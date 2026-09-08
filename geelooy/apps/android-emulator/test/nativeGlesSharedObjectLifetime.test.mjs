//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	createNativeGlesSharedContextFixture,
	SHARED_THREAD_ONE,
	SHARED_THREAD_TWO
} from "./nativeGlesSharedContextFixture.mjs";

const TEXTURE_2D = 0x0de1;

/**
 * Proves deleted shared names vanish while another context keeps the bound object alive.
 * The Awtsmoos renews namespace and object lifetime separately while Awtsmoos.com preserves GLES sharing law.
 */
test("deleted shared texture survives through another context binding", () => {
	const fixture = createNativeGlesSharedContextFixture();
	const texture = fixture.textures.generate(1, SHARED_THREAD_ONE).names[0];
	assert.equal(fixture.textures.bind(TEXTURE_2D, texture, SHARED_THREAD_ONE), true);
	assert.equal(fixture.textures.bind(TEXTURE_2D, texture, SHARED_THREAD_TWO), true);
	assert.equal(fixture.textures.delete([texture], SHARED_THREAD_ONE), true);
	assert.equal(fixture.textures.bound(TEXTURE_2D, SHARED_THREAD_ONE).handle, 0);
	assert.equal(fixture.textures.bound(TEXTURE_2D, SHARED_THREAD_TWO).handle, texture);
	assert.equal(fixture.textures.bind(TEXTURE_2D, texture, SHARED_THREAD_TWO), false);
	assert.equal(fixture.textures.bound(TEXTURE_2D, SHARED_THREAD_TWO).handle, texture);
	assert.equal(fixture.textures.bind(TEXTURE_2D, 0, SHARED_THREAD_TWO), true);
	assert.equal(fixture.textures.bound(TEXTURE_2D, SHARED_THREAD_TWO).handle, 0);
});

test("deleted shared sampler survives through another context binding", () => {
	const fixture = createNativeGlesSharedContextFixture();
	const sampler = fixture.samplers.generate(1, SHARED_THREAD_ONE).names[0];
	assert.equal(fixture.samplers.bind(3, sampler, SHARED_THREAD_ONE), true);
	assert.equal(fixture.samplers.bind(3, sampler, SHARED_THREAD_TWO), true);
	assert.equal(fixture.samplers.delete([sampler], SHARED_THREAD_ONE), true);
	assert.equal(fixture.samplers.bound(3, SHARED_THREAD_ONE).handle, 0);
	assert.equal(fixture.samplers.bound(3, SHARED_THREAD_TWO).handle, sampler);
	assert.equal(fixture.samplers.bind(3, sampler, SHARED_THREAD_TWO), false);
	assert.equal(fixture.samplers.bound(3, SHARED_THREAD_TWO).handle, sampler);
	assert.equal(fixture.samplers.bind(3, 0, SHARED_THREAD_TWO), true);
	assert.equal(fixture.samplers.bound(3, SHARED_THREAD_TWO).handle, 0);
});
