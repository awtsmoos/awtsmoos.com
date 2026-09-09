//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { NATIVE_GLES_UNIFORM_BUFFER } from "../core/native/nativeGlesIndexedBufferTargets.js";
import { createNativeGlesVertexInputFixture, invokeVertexInput, VERTEX_THREAD } from "./nativeGlesVertexInputFixture.mjs";

const OUTPUT = 0x3000n;
const DATA = 0x3200n;
const STATIC_DRAW = 0x88e4;

/** Proves whole-buffer indexed binding shares the exact generic buffer record. */
test("glBindBufferBase retains shared record in indexed UBO slot", () => {
	const fixture = createNativeGlesVertexInputFixture();
	const buffer = allocatedBuffer(fixture, 16);
	assert.equal(invokeVertexInput(fixture, "glBindBufferBase", NATIVE_GLES_UNIFORM_BUFFER, 3, buffer).result.success, true);
	const binding = fixture.state.indexed.binding(fixture.context, NATIVE_GLES_UNIFORM_BUFFER, 3);
	assert.equal(binding.record.handle, buffer);
	assert.equal(binding.offset, 0);
	assert.equal(binding.size, 16);
	assert.equal(binding.whole, true);
});

/** Proves explicit range validation and generic-binding rollback on invalid ranges. */
test("glBindBufferRange preserves prior generic binding when range is invalid", () => {
	const fixture = createNativeGlesVertexInputFixture();
	const first = allocatedBuffer(fixture, 16);
	const second = allocatedBuffer(fixture, 8);
	invokeVertexInput(fixture, "glBindBuffer", NATIVE_GLES_UNIFORM_BUFFER, first);
	assert.equal(invokeVertexInput(fixture, "glBindBufferRange", NATIVE_GLES_UNIFORM_BUFFER, 2, second, 4, 8).result.success, false);
	assert.equal(fixture.state.buffers.boundRecord(fixture.context, NATIVE_GLES_UNIFORM_BUFFER).handle, first);
	assert.notEqual(fixture.state.buffers.domain.takeError(VERTEX_THREAD), 0);
});

/** Proves deletion clears indexed binding points while object lifetime remains reference-safe. */
test("deleting an indexed buffer resets the context binding point", () => {
	const fixture = createNativeGlesVertexInputFixture();
	const buffer = allocatedBuffer(fixture, 12);
	invokeVertexInput(fixture, "glBindBufferRange", NATIVE_GLES_UNIFORM_BUFFER, 5, buffer, 2, 6);
	writeName(fixture, buffer);
	invokeVertexInput(fixture, "glDeleteBuffers", 1, OUTPUT);
	assert.equal(fixture.state.indexed.binding(fixture.context, NATIVE_GLES_UNIFORM_BUFFER, 5), null);
});

/** Allocates one named buffer, binds it to UBO target, and gives it exact byte storage. */
function allocatedBuffer(fixture, size) {
	invokeVertexInput(fixture, "glGenBuffers", 1, OUTPUT);
	const buffer = readName(fixture);
	invokeVertexInput(fixture, "glBindBuffer", NATIVE_GLES_UNIFORM_BUFFER, buffer);
	fixture.memory.write(DATA, new Uint8Array(size));
	invokeVertexInput(fixture, "glBufferData", NATIVE_GLES_UNIFORM_BUFFER, size, DATA, STATIC_DRAW);
	return buffer;
}

/** Reads one GLuint written by glGenBuffers from little-endian guest memory. */
function readName(fixture) {
	const bytes = fixture.memory.read(OUTPUT, 4);
	return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(0, true);
}

/** Writes one GLuint for glDeleteBuffers without bypassing the guest-memory ABI. */
function writeName(fixture, value) {
	const bytes = new Uint8Array(4);
	new DataView(bytes.buffer).setUint32(0, value, true);
	fixture.memory.write(OUTPUT, bytes);
}
