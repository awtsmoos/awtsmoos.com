//B"H
//Boruch Hashem
//Blessed be He

import assert from "node:assert/strict";
import test from "node:test";
import { registerNativeGles3BufferQueryHandlers } from "../core/native/nativeGles3BufferQueryHandlers.js";
import { NATIVE_GLES_ARRAY_BUFFER } from "../core/native/nativeGlesBufferTargets.js";
import { NATIVE_GLES_UNIFORM_BUFFER } from "../core/native/nativeGlesIndexedBufferTargets.js";
import { createNativeGlesVertexInputFixture, invokeVertexInput } from "./nativeGlesVertexInputFixture.mjs";

const OUTPUT = 0x3000n;
const DATA = 0x3200n;
const STATIC_DRAW = 0x88e4;

/** Proves GLES3 mapped-buffer and indexed-binding queries return retained guest truth. */
test("GLES3 buffer queries expose size, mapped pointer, and indexed UBO range", () => {
	const fixture = createNativeGlesVertexInputFixture();
	registerNativeGles3BufferQueryHandlers(fixture.registry, fixture.state);
	const buffer = generateBuffer(fixture);
	invokeVertexInput(fixture, "glBindBuffer", NATIVE_GLES_ARRAY_BUFFER, buffer);
	fixture.memory.write(DATA, new Uint8Array(16));
	invokeVertexInput(fixture, "glBufferData", NATIVE_GLES_ARRAY_BUFFER, 16, DATA, STATIC_DRAW);
	invokeVertexInput(fixture, "glGetBufferParameteri64v", NATIVE_GLES_ARRAY_BUFFER, 0x8764, OUTPUT);
	assert.equal(readInt64(fixture.memory, OUTPUT), 16n);
	const mapped = invokeVertexInput(fixture, "glMapBufferRange", NATIVE_GLES_ARRAY_BUFFER, 0, 16, 0x0002);
	invokeVertexInput(fixture, "glGetBufferPointerv", NATIVE_GLES_ARRAY_BUFFER, 0x88bd, OUTPUT);
	assert.equal(readUint64(fixture.memory, OUTPUT), BigInt(mapped.result.pointer));
	invokeVertexInput(fixture, "glBindBufferBase", NATIVE_GLES_UNIFORM_BUFFER, 2, buffer);
	invokeVertexInput(fixture, "glGetIntegeri_v", 0x8a28, 2, OUTPUT);
	assert.equal(readInt32(fixture.memory, OUTPUT), buffer);
	invokeVertexInput(fixture, "glGetInteger64i_v", 0x8a2a, 2, OUTPUT);
	assert.equal(readInt64(fixture.memory, OUTPUT), 16n);
});

function generateBuffer(fixture) {
	invokeVertexInput(fixture, "glGenBuffers", 1, OUTPUT);
	return readInt32(fixture.memory, OUTPUT) >>> 0;
}
function readInt32(memory, address) {
	const bytes = memory.read(address, 4);
	return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getInt32(0, true);
}
function readInt64(memory, address) {
	const bytes = memory.read(address, 8);
	return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getBigInt64(0, true);
}
function readUint64(memory, address) {
	const bytes = memory.read(address, 8);
	return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getBigUint64(0, true);
}
