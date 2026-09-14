//B"H
//Boruch Hashem
//Blessed be He

import assert from "node:assert/strict";
import test from "node:test";
import { registerNativeGles3SamplerQueryHandlers } from "../core/native/nativeGles3SamplerQueryHandlers.js";
import { createNativeGlesSamplerFixture, invokeSampler } from "./nativeGlesSamplerFixture.mjs";

const OUTPUT = 0x3000n;

/** Proves GLES3 sampler identity and typed query APIs observe retained sampler state. */
test("GLES3 sampler query family returns real retained values", () => {
	const fixture = createNativeGlesSamplerFixture();
	registerNativeGles3SamplerQueryHandlers(fixture.registry, fixture.state);
	invokeSampler(fixture, "glGenSamplers", 1, OUTPUT);
	const sampler = readUint(fixture.memory, OUTPUT);
	assert.equal(invokeSampler(fixture, "glIsSampler", sampler).result.value, 1);
	invokeSampler(fixture, "glSamplerParameteri", sampler, 0x2801, 0x2600);
	invokeSampler(fixture, "glGetSamplerParameteriv", sampler, 0x2801, OUTPUT);
	assert.equal(readInt(fixture.memory, OUTPUT), 0x2600);
});

function readInt(memory, address) {
	const bytes = memory.read(address, 4);
	return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getInt32(0, true);
}

function readUint(memory, address) {
	return readInt(memory, address) >>> 0;
}
