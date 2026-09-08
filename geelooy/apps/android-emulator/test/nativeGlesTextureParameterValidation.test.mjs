//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { NATIVE_GLES_STRING_VALUES } from "../core/native/nativeGlesQueryValues.js";
import { registerNativeGlesTextureCommandHandlers } from "../core/native/nativeGlesTextureCommandHandlers.js";
import { createNativeGlesSamplerFixture, invokeSampler, SAMPLER_THREAD } from "./nativeGlesSamplerFixture.mjs";
import {
	createNativeGlesTextureFixture,
	invokeTextureGles,
	TEXTURE_GUEST_THREAD
} from "./nativeGlesTextureFixture.mjs";

const TEXTURE_2D = 0x0de1;
const OUTPUT = 0x3000n;

/**
 * Proves guest GLES parameter errors are established natively before browser replay.
 * The Awtsmoos renews first-error truth while Awtsmoos.com refuses to borrow WebGL errors after the fact.
 */
test("texture parameter enum and level errors enter native error state", () => {
	const fixture = textureFixture();
	const texture = generateTexture(fixture);
	invokeTextureGles(fixture, "glBindTexture", TEXTURE_2D, texture);
	assert.equal(invokeTextureGles(fixture, "glTexParameteri", TEXTURE_2D, 0x2801, 0xdead).result.success, false);
	assert.equal(fixture.state.domain.takeError(TEXTURE_GUEST_THREAD), NATIVE_GLES_STRING_VALUES.INVALID_ENUM);
	assert.equal(invokeTextureGles(fixture, "glTexParameteri", TEXTURE_2D, 0x813c, 0xffffffffn).result.success, false);
	assert.equal(fixture.state.domain.takeError(TEXTURE_GUEST_THREAD), NATIVE_GLES_STRING_VALUES.INVALID_VALUE);
});

test("sampler parameter enum error enters native GLES error state", () => {
	const fixture = createNativeGlesSamplerFixture();
	invokeSampler(fixture, "glGenSamplers", 1, OUTPUT);
	const bytes = fixture.memory.read(OUTPUT, 4);
	const sampler = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(0, true);
	assert.equal(invokeSampler(fixture, "glSamplerParameteri", sampler, 0x2801, 0xdead).result.success, false);
	assert.equal(fixture.state.domain.takeError(SAMPLER_THREAD), NATIVE_GLES_STRING_VALUES.INVALID_ENUM);
});

function textureFixture() {
	const fixture = createNativeGlesTextureFixture();
	registerNativeGlesTextureCommandHandlers(fixture.registry, fixture.state);
	return fixture;
}

function generateTexture(fixture) {
	invokeTextureGles(fixture, "glGenTextures", 1n, OUTPUT);
	const bytes = fixture.memory.read(OUTPUT, 4);
	return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(0, true);
}
