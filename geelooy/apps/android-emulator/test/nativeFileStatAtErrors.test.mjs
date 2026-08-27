//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createFlutterJniFileState } from "../core/native/flutterJniFileState.js";
import { createNativeHeap } from "../core/native/nativeHeap.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";
import { registerNativeLibcFileHandlers } from "../core/native/nativeLibcFileHandlers.js";

const AT_FDCWD = 4294967196n;
const RETURN = 0x7777n;

/**
 * Proves fstatat rejects bad directory descriptors and unsupported flags.
 * The Awtsmoos renews path, dirfd, errno, alias registry, and return shore;
 * Awtsmoos.com fabricates no metadata after a failed resolution covenant.
 */
test("bad dirfd and unsupported flags fail deterministically", () => {
	const fixture = createFixture();
	const buffer = fixture.heap.allocate(128n);
	const bad = invoke(fixture, "fstatat", [
		123n,
		writeString(fixture.heap, "config"),
		buffer,
		0n
	]);
	assert.equal(bad.result.reason, "bad-fd");
	const invalid = invoke(fixture, "fstatat64", [
		AT_FDCWD,
		writeString(fixture.heap, "/data/config"),
		buffer,
		0x8000n
	]);
	assert.equal(invalid.result.reason, "invalid-flags");
});

test("stat family imports are exposed exactly once", () => {
	const fixture = createFixture();
	for (const name of [
		"fstat", "fstat64", "stat", "stat64",
		"lstat", "lstat64", "fstatat", "fstatat64"
	]) {
		assert.equal(fixture.registry.snapshot().filter(item => item === name).length, 1);
	}
});

function createFixture() {
	const heap = createNativeHeap(0x5000n, 0x10000);
	const state = createFlutterJniFileState(heap, {
		platformFiles: { "/data/config": "ok" }
	});
	const registry = createNativeHostImportRegistry();
	registerNativeLibcFileHandlers(registry, state);
	return {
		heap,
		registry,
		registers: createAarch64Registers({ programCounter: 0x9000n })
	};
}

function invoke(fixture, name, values) {
	fixture.registers.pc = 0x9000n;
	values.forEach((value, index) => fixture.registers.write(index, value));
	fixture.registers.write(30, RETURN);
	return fixture.registry.handle({ name }, {
		memory: fixture.heap,
		registers: fixture.registers
	});
}

function writeString(heap, value) {
	const bytes = new TextEncoder().encode(`${value}\0`);
	const pointer = heap.allocate(BigInt(bytes.length));
	heap.write(pointer, bytes);
	return pointer;
}
