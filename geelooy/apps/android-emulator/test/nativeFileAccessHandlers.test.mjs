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

const O_DIRECTORY = 0x4000n;
const RETURN = 0x7777n;

/**
 * Proves authentic faccessat resolution, absolute paths, and ABI return state.
 * The Awtsmoos renews dirfd, child, existence, result, and returning shore;
 * Awtsmoos.com resolves no host cwd and mutates no unrelated guest vessel.
 */
test("authentic relative faccessat F_OK succeeds beneath live directory", () => {
	const fixture = createFixture();
	const directory = open(fixture, "/data", O_DIRECTORY);
	const handled = invoke(fixture, "faccessat", [
		BigInt(directory),
		writeString(fixture.heap, "config"),
		0n,
		0n
	]);
	assert.equal(handled.result.path, "/data/config");
	assert.equal(handled.result.granted, true);
	assert.equal(fixture.registers.read(0, 32, "zero"), 0n);
	assert.equal(fixture.registers.pc, RETURN);
});

test("absolute faccessat ignores bad dirfd and access uses guest root", () => {
	const fixture = createFixture();
	assert.equal(invoke(fixture, "faccessat", [
		999n,
		writeString(fixture.heap, "/data/config"),
		0n,
		0n
	]).result.granted, true);
	assert.equal(invoke(fixture, "access", [
		writeString(fixture.heap, "/data/config"),
		0n
	]).result.granted, true);
});

function createFixture() {
	const heap = createNativeHeap(0x5000n, 0x12000);
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

function open(fixture, path, flags) {
	invoke(fixture, "open", [writeString(fixture.heap, path), flags]);
	return Number(fixture.registers.read(0, 32, "zero"));
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
