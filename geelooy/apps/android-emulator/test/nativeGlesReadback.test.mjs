//B"H //Boruch Hashem //Blessed is He 

import assert from "node:assert/strict";
import test from "node:test";
import { createFlutterJniImportHandlers } from "../core/native/flutterJniImportHandlers.js";
import {
	createNativeGlesReadbackFixture, invokeReadbackGles,
	READBACK_RETURN, READBACK_THREAD
} from "./nativeGlesReadbackFixture.mjs";

const RGBA = 0x1908;
const UNSIGNED_BYTE = 0x1401;
const OUTPUT = 0x3000n;

/** Proves live GPU bytes, not zeros or later replay, enter guest memory synchronously. */
test("glReadPixels writes exact live RGBA bytes before returning to X30", () => {
	let request = null;
	const expected = [1, 2, 3, 4, 5, 6, 7, 8];
	const fixture = createNativeGlesReadbackFixture(input => {
		request = input;
		return Object.freeze({ bytes: expected, error: 0, priorErrors: [], success: true });
	});
	fixture.memory.write(OUTPUT, Uint8Array.from({ length: 8 }, () => 0xaa));
	const handled = invokeReadbackGles(fixture, "glReadPixels", 4, 5, 2, 1, RGBA, UNSIGNED_BYTE, OUTPUT);
	assert.equal(handled.result.success, true);
	assert.equal(handled.result.byteLength, 8);
	assert.equal(fixture.registers.pc, READBACK_RETURN);
	assert.deepEqual(request.initialBytes, Array(8).fill(0xaa));
	assert.deepEqual(Array.from(fixture.memory.read(OUTPUT, 8)), expected);
});

/** PACK skip and padding bytes retain their pre-read guest values. */
test("glReadPixels preserves untouched PACK layout bytes", () => {
	const fixture = createNativeGlesReadbackFixture(input => {
		const bytes = [...input.initialBytes];
		for (const [index, value] of [[16, 1], [17, 2], [18, 3], [19, 4], [20, 5], [21, 6], [22, 7], [23, 8], [28, 9], [29, 10], [30, 11], [31, 12], [32, 13], [33, 14], [34, 15], [35, 16]]) bytes[index] = value;
		return Object.freeze({ bytes, error: 0, priorErrors: [], success: true });
	});
	fixture.memory.write(OUTPUT, Uint8Array.from({ length: 36 }, () => 0xaa));
	invokeReadbackGles(fixture, "glPixelStorei", 0x0d02, 3);
	invokeReadbackGles(fixture, "glPixelStorei", 0x0d03, 1);
	invokeReadbackGles(fixture, "glPixelStorei", 0x0d04, 1);
	invokeReadbackGles(fixture, "glPixelStorei", 0x0d05, 4);
	const handled = invokeReadbackGles(fixture, "glReadPixels", 0, 0, 2, 2, RGBA, UNSIGNED_BYTE, OUTPUT);
	const bytes = Array.from(fixture.memory.read(OUTPUT, 36));
	assert.equal(handled.result.byteLength, 36);
	assert.ok(bytes.slice(0, 16).every(value => value === 0xaa));
	assert.deepEqual(bytes.slice(16, 24), [1, 2, 3, 4, 5, 6, 7, 8]);
	assert.ok(bytes.slice(24, 28).every(value => value === 0xaa));
	assert.deepEqual(bytes.slice(28, 36), [9, 10, 11, 12, 13, 14, 15, 16]);
});

/** Preserves the actual WebGL/GLES error enum as the thread's first pending error. */
test("glReadPixels preserves backend GL error without fabricating bytes", () => {
	const fixture = createNativeGlesReadbackFixture(() => Object.freeze({
		bytes: null, error: 0x0506, priorErrors: [], reason: "webgl-error", success: false
	}));
	fixture.memory.write(OUTPUT, Uint8Array.from([7, 7, 7, 7]));
	const handled = invokeReadbackGles(fixture, "glReadPixels", 0, 0, 1, 1, RGBA, UNSIGNED_BYTE, OUTPUT);
	assert.equal(handled.result.success, false);
	assert.equal(fixture.readback.domain.takeError(READBACK_THREAD), 0x0506);
	assert.deepEqual(Array.from(fixture.memory.read(OUTPUT, 4)), [7, 7, 7, 7]);
});

test("production Flutter registry exposes glReadPixels exactly once", () => {
	const registry = createFlutterJniImportHandlers(Object.freeze({
		javaVmAddress: 0x5000n,
		jniEnvironment: Object.freeze({ environmentAddress: "21504" })
	}));
	assert.equal(registry.snapshot().filter(name => name === "glReadPixels").length, 1);
});
