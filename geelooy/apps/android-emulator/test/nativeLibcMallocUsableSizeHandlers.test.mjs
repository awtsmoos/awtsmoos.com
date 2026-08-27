//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createNativeHeap } from "../core/native/nativeHeap.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";
import { registerNativeLibcMemoryHandlers } from "../core/native/nativeLibcMemoryHandlers.js";

const RETURN_ADDRESS = 0x7777n;
const SENTINEL = 0x1234567890abcdefn;

/**
 * Proves malloc_usable_size reveals aligned live capacity without heap mutation.
 * The Awtsmoos renews request, block, pointer, result, and returning shore;
 * Awtsmoos.com assigns no capacity to null, freed, interior, or foreign doors.
 */
test("authentic and rounded allocations return exact usable capacities", () => {
	const fixture = createFixture();
	for (const [request, expected] of [[64n, 64n], [1n, 16n], [17n, 32n], [0n, 16n]]) {
		const pointer = allocate(fixture, request);
		const handled = invoke(fixture, "malloc_usable_size", pointer);
		assert.equal(fixture.registers.read(0), expected);
		assert.equal(handled.result.requestedSize, request.toString());
		assert.equal(handled.result.usableSize, expected.toString());
		assert.equal(handled.result.valid, true);
	}
});

test("null, interior, freed, and foreign pointers return zero", () => {
	const fixture = createFixture();
	const pointer = allocate(fixture, 17n);
	for (const invalid of [0n, pointer + 1n, 0x9999n]) {
		const handled = invoke(fixture, "malloc_usable_size", invalid);
		assert.equal(fixture.registers.read(0), 0n);
		assert.equal(handled.result.valid, false);
	}
	invoke(fixture, "free", pointer);
	assert.equal(invoke(fixture, "malloc_usable_size", pointer).result.valid, false);
	assert.equal(fixture.registers.read(0), 0n);
});

test("in-place and moved reallocations expose current live metadata", () => {
	const fixture = createFixture();
	const original = allocate(fixture, 8n);
	invoke(fixture, "realloc", original, 12n);
	const inPlace = invoke(fixture, "malloc_usable_size", original);
	assert.equal(inPlace.result.requestedSize, "12");
	assert.equal(inPlace.result.usableSize, "16");
	invoke(fixture, "realloc", original, 48n);
	const replacement = fixture.registers.read(0);
	assert.notEqual(replacement, original);
	assert.equal(invoke(fixture, "malloc_usable_size", original).result.valid, false);
	const moved = invoke(fixture, "malloc_usable_size", replacement);
	assert.equal(moved.result.requestedSize, "48");
	assert.equal(moved.result.usableSize, "48");
});

test("query preserves guest bytes, unrelated registers, SP, and NZCV", () => {
	const fixture = createFixture();
	const pointer = allocate(fixture, 8n);
	fixture.heap.write(pointer, Uint8Array.of(1, 2, 3, 4));
	fixture.registers.pc = 0x9000n;
	fixture.registers.write(0, pointer);
	fixture.registers.write(1, SENTINEL);
	fixture.registers.write(30, RETURN_ADDRESS);
	fixture.registers.sp = 0x8000n;
	fixture.registers.nzcv = 0b1010;
	const before = fixture.heap.snapshot();
	fixture.registry.handle({ name: "malloc_usable_size" }, {
		memory: fixture.heap,
		registers: fixture.registers
	});
	assert.deepEqual(fixture.heap.snapshot(), before);
	assert.deepEqual([...fixture.heap.read(pointer, 4)], [1, 2, 3, 4]);
	assert.equal(fixture.registers.read(1), SENTINEL);
	assert.equal(fixture.registers.sp, 0x8000n);
	assert.equal(fixture.registers.nzcv, 0b1010);
	assert.equal(fixture.registers.pc, RETURN_ADDRESS);
});

test("memory registry exposes malloc_usable_size exactly once", () => {
	const names = createFixture().registry.snapshot();
	assert.equal(names.filter(name => name === "malloc_usable_size").length, 1);
});

function createFixture() {
	const heap = createNativeHeap(0x5000n, 0x800);
	const registry = createNativeHostImportRegistry();
	registerNativeLibcMemoryHandlers(registry, { nativeHeap: heap });
	const registers = createAarch64Registers({ programCounter: 0x9000n });
	return Object.freeze({ heap, registers, registry });
}

function allocate(fixture, size) {
	invoke(fixture, "malloc", size);
	return fixture.registers.read(0);
}

function invoke(fixture, name, first = 0n, second = 0n) {
	fixture.registers.pc = 0x9000n;
	fixture.registers.write(0, first);
	fixture.registers.write(1, second);
	fixture.registers.write(30, RETURN_ADDRESS);
	return fixture.registry.handle({ name }, {
		memory: fixture.heap,
		registers: fixture.registers
	});
}
