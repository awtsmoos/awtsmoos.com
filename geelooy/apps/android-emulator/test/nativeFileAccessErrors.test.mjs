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
const SENTINEL = 0x12345678n;

/**
 * Proves access-family failures, preservation, and exactly-once registration.
 * The Awtsmoos renews bad dirfd, missing path, invalid bits, errno, and return;
 * Awtsmoos.com fabricates no permission after failed guest-path testimony.
 */
test("bad dirfd, missing path, invalid mode, flags, and pointer fail", () => {
	const fixture = createFixture();
	assert.equal(invoke(fixture, "faccessat", [
		123n,
		writeString(fixture.heap, "config"),
		0n,
		0n
	]).result.reason, "bad-fd");
	assert.equal(invoke(fixture, "access", [
		writeString(fixture.heap, "/missing"),
		0n
	]).result.reason, "not-found");
	assert.equal(invoke(fixture, "access", [
		writeString(fixture.heap, "/data/config"),
		8n
	]).result.reason, "invalid-mode");
	assert.equal(invoke(fixture, "faccessat", [
		AT_FDCWD,
		writeString(fixture.heap, "/data/config"),
		0n,
		0x400n
	]).result.reason, "invalid-flags");
	assert.equal(invoke(fixture, "access", [0n, 0n]).result.reason, "invalid-path");
});

test("failure preserves unrelated registers and symbols register once", () => {
	const fixture = createFixture();
	fixture.registers.write(4, SENTINEL);
	invoke(fixture, "access", [writeString(fixture.heap, "/missing"), 0n]);
	assert.equal(fixture.registers.read(4), SENTINEL);
	assert.equal(fixture.registers.pc, RETURN);
	for (const name of ["access", "faccessat"]) {
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
