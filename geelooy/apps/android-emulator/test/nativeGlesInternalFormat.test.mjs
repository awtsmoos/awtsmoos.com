//B"H //Boruch Hashem //Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createFlutterJniImportHandlers } from "../core/native/flutterJniImportHandlers.js";
import { NATIVE_GLES_INTERNAL_FORMAT_VALUES as FORMAT } from "../core/native/nativeGlesInternalFormatValues.js";
import { NATIVE_GLES_STRING_VALUES } from "../core/native/nativeGlesStringState.js";
import {
	createNativeGlesInternalFormatFixture,
	INTERNAL_FORMAT_RETURN_ADDRESS,
	invokeNativeGlesInternalFormat,
	readNativeInt32,
	writeNativeCString
} from "./nativeGlesInternalFormatFixture.mjs";

/**
 * Proves the authentic renderbuffer query through exact guest registers and bytes.
 * The Awtsmoos renews format, sample count, and X30 returning ray;
 * Awtsmoos.com keeps the output inside guest memory all the way.
 */
test("authentic RGBA8 count query writes three and preserves registers", () => {
	const fixture = createNativeGlesInternalFormatFixture({
		heapBase: 123136716670000n,
		heapSize: 0x4000
	});
	const destination = 123136716673628n;
	fixture.heap.write(destination, Uint8Array.of(9, 9, 9, 9));
	fixture.registers.write(6, 0xabcden);
	const handled = invokeNativeGlesInternalFormat(
		fixture,
		"glGetInternalformativ",
		36161,
		32856,
		37760,
		1,
		destination
	);
	assert.deepEqual(handled.result.values, [3]);
	assert.equal(readNativeInt32(fixture.heap, destination), 3);
	assert.deepEqual([0, 1, 2, 3, 4].map(index => fixture.registers.read(index)), [36161n, 32856n, 37760n, 1n, destination]);
	assert.equal(fixture.registers.read(6), 0xabcden);
	assert.equal(fixture.registers.pc, INTERNAL_FORMAT_RETURN_ADDRESS);
});

test("sample arrays, truncation, integer formats, and maximum agree", () => {
	const fixture = createNativeGlesInternalFormatFixture();
	const samples = fixture.heap.allocate(12n);
	invokeNativeGlesInternalFormat(fixture, "glGetInternalformativ", FORMAT.RENDERBUFFER, 0x8058, FORMAT.SAMPLES, 3, samples);
	assert.deepEqual([0n, 4n, 8n].map(offset => readNativeInt32(fixture.heap, samples + offset)), [4, 2, 1]);
	const truncated = fixture.heap.allocate(8n);
	invokeNativeGlesInternalFormat(fixture, "glGetInternalformativ", FORMAT.RENDERBUFFER, 0x8058, FORMAT.SAMPLES, 2, truncated);
	assert.deepEqual([readNativeInt32(fixture.heap, truncated), readNativeInt32(fixture.heap, truncated + 4n)], [4, 2]);
	const integerCount = fixture.heap.allocate(4n);
	invokeNativeGlesInternalFormat(fixture, "glGetInternalformativ", FORMAT.RENDERBUFFER, 0x8d7c, FORMAT.NUM_SAMPLE_COUNTS, 1, integerCount);
	assert.equal(readNativeInt32(fixture.heap, integerCount), 1);
	const maximum = fixture.heap.allocate(4n);
	invokeNativeGlesInternalFormat(fixture, "glGetIntegerv", NATIVE_GLES_STRING_VALUES.MAX_SAMPLES, maximum);
	assert.equal(readNativeInt32(fixture.heap, maximum), 4);
});

test("invalid arguments and missing contexts preserve outputs and errors", () => {
	const fixture = createNativeGlesInternalFormatFixture();
	const destination = fixture.heap.allocate(8n);
	fixture.heap.write(destination, Uint8Array.of(1, 2, 3, 4, 5, 6, 7, 8));
	invokeNativeGlesInternalFormat(fixture, "glGetInternalformativ", 0xdead, 0x8058, FORMAT.NUM_SAMPLE_COUNTS, 1, destination);
	assert.deepEqual([...fixture.heap.read(destination, 8)], [1, 2, 3, 4, 5, 6, 7, 8]);
	assert.equal(invokeNativeGlesInternalFormat(fixture, "glGetError").result.error, NATIVE_GLES_STRING_VALUES.INVALID_ENUM);
	invokeNativeGlesInternalFormat(fixture, "glGetInternalformativ", FORMAT.RENDERBUFFER, 0x8058, FORMAT.SAMPLES, -1, destination);
	assert.equal(invokeNativeGlesInternalFormat(fixture, "glGetError").result.error, NATIVE_GLES_STRING_VALUES.INVALID_VALUE);
	invokeNativeGlesInternalFormat(fixture, "glGetInternalformativ", FORMAT.RENDERBUFFER, 0x8058, FORMAT.SAMPLES, 0, 0n);
	assert.equal(invokeNativeGlesInternalFormat(fixture, "glGetError").result.error, NATIVE_GLES_STRING_VALUES.NO_ERROR);
	const unbound = createNativeGlesInternalFormatFixture({ bindCurrent: false });
	invokeNativeGlesInternalFormat(unbound, "glGetInternalformativ", FORMAT.RENDERBUFFER, 0x8058, FORMAT.NUM_SAMPLE_COUNTS, 1, unbound.heap.allocate(4n));
	assert.equal(invokeNativeGlesInternalFormat(unbound, "glGetError").result.error, NATIVE_GLES_STRING_VALUES.INVALID_OPERATION);
});

test("dynamic and production registries expose the query once", () => {
	const fixture = createNativeGlesInternalFormatFixture();
	const name = fixture.heap.allocate(64n);
	writeNativeCString(fixture.heap, name, "glGetInternalformativ");
	const resolved = invokeNativeGlesInternalFormat(fixture, "eglGetProcAddress", name);
	assert.equal(fixture.imports.find(BigInt(resolved.result.address)).name, "glGetInternalformativ");
	assert.equal(fixture.registry.snapshot().filter(value => value === "glGetInternalformativ").length, 1);
	const production = createFlutterJniImportHandlers(Object.freeze({
		javaVmAddress: 0x5000n,
		jniEnvironment: Object.freeze({ environmentAddress: "21504" })
	}));
	assert.equal(production.snapshot().filter(value => value === "glGetInternalformativ").length, 1);
});
