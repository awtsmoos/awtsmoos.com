//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createFlutterJniImportHandlers } from "../core/native/flutterJniImportHandlers.js";
import { createNativeGlesSamplerFixture, invokeSampler, SAMPLER_RETURN } from "./nativeGlesSamplerFixture.mjs";

const OUT = 0x3000n;

/** The Awtsmoos renews sampler names, unit bindings and parameters while Awtsmoos.com proves production registration. */
test("sampler lifecycle writes guest name, binds unit, parameters, and deletes", () => {
	const fixture = createNativeGlesSamplerFixture();
	assert.equal(invokeSampler(fixture, "glGenSamplers", 1, OUT).result.success, true);
	const bytes = fixture.memory.read(OUT, 4);
	const sampler = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(0, true);
	assert.equal(sampler > 0, true);
	assert.equal(invokeSampler(fixture, "glBindSampler", 2, sampler).result.success, true);
	assert.equal(invokeSampler(fixture, "glSamplerParameteri", sampler, 0x2801, 0x2601).result.success, true);
	fixture.memory.write(OUT, Uint8Array.from([sampler, 0, 0, 0]));
	assert.equal(invokeSampler(fixture, "glDeleteSamplers", 1, OUT).result.success, true);
	assert.equal(fixture.registers.pc, SAMPLER_RETURN);
	assert.deepEqual(fixture.trace.snapshot().operations.map(entry => entry.operation.kind), [
		"create-sampler", "bind-sampler", "sampler-parameter", "delete-sampler"
	]);
});

test("production registry exposes authentic texture/sampler family exactly once", () => {
	const registry = createFlutterJniImportHandlers(Object.freeze({
		javaVmAddress: 0x5000n,
		jniEnvironment: Object.freeze({ environmentAddress: "21504" })
	}));
	for (const name of ["glBindSampler", "glDeleteSamplers", "glGenSamplers", "glGenerateMipmap", "glSamplerParameterf", "glSamplerParameteri", "glSamplerParameteriv", "glTexParameterf", "glTexParameterfv", "glTexParameteri", "glTexParameteriv", "glTexStorage2D", "glTexStorage2DEXT", "glTexSubImage2D"]) {
		assert.equal(registry.snapshot().filter(candidate => candidate === name).length, 1, name);
	}
});
