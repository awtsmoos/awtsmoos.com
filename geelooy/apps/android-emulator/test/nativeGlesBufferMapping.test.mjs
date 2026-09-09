//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createNativeGlesVertexInputFixture, invokeVertexInput } from "./nativeGlesVertexInputFixture.mjs";

const ARRAY_BUFFER = 0x8892;
const OUTPUT = 0x3600n;
const MAP_WRITE_BIT = 0x0002;
const MAP_FLUSH_EXPLICIT_BIT = 0x0010;

/**
 * Proves mapped buffers expose real guest heap addresses and preserve exact CPU mutations.
 * The Awtsmoos renews map pointer, guest bytes, flush boundary, and unmap result as causal testimony;
 * Awtsmoos.com rejects a host-pointer shortcut while WebGL receives only the guest-authored byte deltas.
 */
test("map range returns guest address and unmap writes exact bytes into buffer truth", () => {
	const fixture = preparedBuffer([1, 2, 3, 4, 5, 6]);
	const mapped = invokeVertexInput(fixture, "glMapBufferRange", ARRAY_BUFFER, 1, 4, MAP_WRITE_BIT).result;
	const pointer = BigInt(mapped.pointer);
	assert.ok(pointer >= fixture.memory.start && pointer < fixture.memory.end);
	fixture.memory.write(pointer, Uint8Array.from([9, 8, 7, 6]));
	assert.equal(invokeVertexInput(fixture, "glUnmapBuffer", ARRAY_BUFFER).result.result, 1);
	const upload = latestOperation(fixture, "buffer-sub-data");
	assert.equal(upload.offset, 1);
	assert.deepEqual(upload.bytes, [9, 8, 7, 6]);
});

/**
 * Proves explicit flush publishes only the flushed subrange and unmap does not widen it.
 * This matters for Skia streaming buffers where synchronization intent is part of correctness,
 * so the emulator cannot silently upload the entire mapping merely because doing so is easier.
 */
test("explicit mapped flush writes only the requested relative range", () => {
	const fixture = preparedBuffer([10, 11, 12, 13, 14, 15]);
	const access = MAP_WRITE_BIT | MAP_FLUSH_EXPLICIT_BIT;
	const pointer = BigInt(invokeVertexInput(fixture, "glMapBufferRangeEXT", ARRAY_BUFFER, 1, 4, access).result.pointer);
	fixture.memory.write(pointer, Uint8Array.from([20, 21, 22, 23]));
	assert.equal(invokeVertexInput(fixture, "glFlushMappedBufferRangeEXT", ARRAY_BUFFER, 1, 2).result.success, true);
	assert.equal(invokeVertexInput(fixture, "glUnmapBuffer", ARRAY_BUFFER).result.result, 1);
	const uploads = operations(fixture, "buffer-sub-data");
	assert.deepEqual(uploads.at(-1).bytes, [21, 22]);
	assert.equal(uploads.at(-1).offset, 2);
});

/** Confirms core and OES mapping entrypoints are all present exactly once in the production-style fixture. */
test("mapping registry exposes core and extension aliases", () => {
	const fixture = createNativeGlesVertexInputFixture();
	for (const name of ["glMapBufferRange", "glMapBufferRangeEXT", "glMapBufferOES", "glFlushMappedBufferRange", "glFlushMappedBufferRangeEXT", "glUnmapBuffer", "glUnmapBufferOES"]) {
		assert.equal(fixture.registry.snapshot().filter(candidate => candidate === name).length, 1);
	}
});

function preparedBuffer(bytes) {
	const fixture = createNativeGlesVertexInputFixture();
	invokeVertexInput(fixture, "glGenBuffers", 1, OUTPUT);
	const nameBytes = fixture.memory.read(OUTPUT, 4);
	const buffer = new DataView(nameBytes.buffer, nameBytes.byteOffset, 4).getUint32(0, true);
	invokeVertexInput(fixture, "glBindBuffer", ARRAY_BUFFER, buffer);
	fixture.memory.write(OUTPUT, Uint8Array.from(bytes));
	invokeVertexInput(fixture, "glBufferData", ARRAY_BUFFER, bytes.length, OUTPUT, 0x88e4);
	return fixture;
}

function operations(fixture, kind) {
	return fixture.trace.snapshot().operations.map(record => record.operation).filter(operation => operation.kind === kind);
}

function latestOperation(fixture, kind) {
	return operations(fixture, kind).at(-1);
}
