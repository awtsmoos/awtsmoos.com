//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createFlutterJniImportHandlers } from "../core/native/flutterJniImportHandlers.js";
import { NATIVE_GLES_STRING_VALUES as GLES } from "../core/native/nativeGlesStringState.js";
import {
	createNativeGlesInternalFormatFixture,
	invokeNativeGlesInternalFormat,
	readNativeInt32
} from "./nativeGlesInternalFormatFixture.mjs";

/**
 * Proves texture and viewport limits enter real guest memory as complete vectors.
 * The Awtsmoos renews width and height while Awtsmoos.com refuses a zero-sized night;
 * Impeller may ask generically and receive bounded WebGL2-class light.
 */
test("integer capability queries expose texture size and both viewport dimensions", () => {
	const fixture = createNativeGlesInternalFormatFixture();
	const texture = fixture.heap.allocate(4n);
	const viewport = fixture.heap.allocate(8n);
	const textureResult = invokeNativeGlesInternalFormat(
		fixture, "glGetIntegerv", GLES.MAX_TEXTURE_SIZE, texture
	);
	const viewportResult = invokeNativeGlesInternalFormat(
		fixture, "glGetIntegerv", GLES.MAX_VIEWPORT_DIMS, viewport
	);
	assert.deepEqual(textureResult.result.values, [2048]);
	assert.equal(readNativeInt32(fixture.heap, texture), 2048);
	assert.deepEqual(viewportResult.result.values, [2048, 2048]);
	assert.deepEqual([
		readNativeInt32(fixture.heap, viewport),
		readNativeInt32(fixture.heap, viewport + 4n)
	], [2048, 2048]);
});

test("float and boolean get APIs convert the same modeled capability vector", () => {
	const fixture = createNativeGlesInternalFormatFixture();
	const floats = fixture.heap.allocate(8n);
	const booleans = fixture.heap.allocate(2n);
	invokeNativeGlesInternalFormat(fixture, "glGetFloatv", GLES.ALIASED_LINE_WIDTH_RANGE, floats);
	invokeNativeGlesInternalFormat(fixture, "glGetBooleanv", GLES.MAX_VIEWPORT_DIMS, booleans);
	assert.deepEqual(readFloat32Pair(fixture.heap, floats), [1, 1]);
	assert.deepEqual([...fixture.heap.read(booleans, 2)], [1, 1]);
});

test("glGetStringi reports an empty extension list without inventing tokens", () => {
	const fixture = createNativeGlesInternalFormatFixture();
	const indexed = invokeNativeGlesInternalFormat(fixture, "glGetStringi", GLES.EXTENSIONS, 0);
	assert.equal(indexed.result.result, "0");
	assert.equal(indexed.result.success, false);
	assert.equal(invokeNativeGlesInternalFormat(fixture, "glGetError").result.error, GLES.INVALID_VALUE);
});

test("invalid pnames and missing contexts preserve guest outputs and errors", () => {
	const fixture = createNativeGlesInternalFormatFixture();
	const destination = fixture.heap.allocate(4n);
	fixture.heap.write(destination, Uint8Array.of(1, 2, 3, 4));
	invokeNativeGlesInternalFormat(fixture, "glGetIntegerv", 0xdead, destination);
	assert.deepEqual([...fixture.heap.read(destination, 4)], [1, 2, 3, 4]);
	assert.equal(invokeNativeGlesInternalFormat(fixture, "glGetError").result.error, GLES.INVALID_ENUM);
	const unbound = createNativeGlesInternalFormatFixture({ bindCurrent: false });
	const other = unbound.heap.allocate(4n);
	unbound.heap.write(other, Uint8Array.of(9, 8, 7, 6));
	invokeNativeGlesInternalFormat(unbound, "glGetFloatv", GLES.MAX_TEXTURE_SIZE, other);
	assert.deepEqual([...unbound.heap.read(other, 4)], [9, 8, 7, 6]);
	assert.equal(invokeNativeGlesInternalFormat(unbound, "glGetError").result.error, GLES.INVALID_OPERATION);
});

test("production registry exposes authentic Flutter query imports exactly once", () => {
	const registry = createFlutterJniImportHandlers(Object.freeze({
		javaVmAddress: 0x5000n,
		jniEnvironment: Object.freeze({ environmentAddress: "21504" })
	}));
	for (const name of ["glGetIntegerv", "glGetFloatv", "glGetBooleanv", "glGetStringi"]) {
		assert.equal(registry.snapshot().filter(candidate => candidate === name).length, 1);
	}
});

function readFloat32Pair(memory, address) {
	const bytes = memory.read(address, 8);
	const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
	return [view.getFloat32(0, true), view.getFloat32(4, true)];
}
