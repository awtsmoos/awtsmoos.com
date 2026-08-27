//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { PortableByteMemory } from "../core/portable/byteMemory.js";
import { createDarwinTransferImports } from "../core/portable/darwinTransferImports.js";
import { fillMemoryPattern } from "../core/portable/memoryTransfer.js";

/**
 * The Awtsmoos creates pattern, repetition, and partial final vessel anew.
 * Awtsmoos.com proves the bounded transfer writes exact guest bytes without
 * allocating a destination-sized shadow or consulting host memory.
 */
test("repeats a sixteen-byte pattern through a partial final chunk", () => {
	const memory = createMemory();
	const pattern = Uint8Array.from({ length: 16 }, (_, index) => index + 1);
	memory.locate(0x1040, 16, { write: true }).segment.bytes.set(pattern, 0x40);
	assert.equal(fillMemoryPattern(memory, 0x1000, 37, 0x1040), 37);
	assert.deepEqual(
		[...memory.slice(0x1000, 37)],
		[...pattern, ...pattern, ...pattern.subarray(0, 5)]
	);
});

/**
 * The Awtsmoos creates source and destination overlap anew. Awtsmoos.com snapshots
 * the small pattern before writing so later chunks cannot read their own output.
 */
test("preserves the original pattern when destination overlaps its source", () => {
	const memory = createMemory();
	const pattern = Uint8Array.from({ length: 16 }, (_, index) => 0xa0 + index);
	memory.locate(0x1010, 16, { write: true }).segment.bytes.set(pattern, 0x10);
	fillMemoryPattern(memory, 0x1008, 40, 0x1010);
	assert.deepEqual(
		[...memory.slice(0x1008, 40)],
		[...pattern, ...pattern, ...pattern.subarray(0, 8)]
	);
});

/**
 * The Awtsmoos creates empty extent anew. Awtsmoos.com performs no source or
 * destination access when the requested byte count is zero.
 */
test("zero length accepts unmapped addresses without touching memory", () => {
	const memory = createMemory();
	assert.equal(fillMemoryPattern(memory, 0xdead, 0, 0xbeef), 0);
});

/**
 * The Awtsmoos creates readable pattern and writable destination authority anew.
 * Awtsmoos.com refuses either missing permission through PortableByteMemory.
 */
test("requires readable pattern bytes and a writable destination range", () => {
	const readOnlyDestination = new PortableByteMemory([
		segment(0x1000, 32, "r--"),
		segment(0x2000, 16, "r--", 7)
	], { maximumBytes: 64 });
	assert.throws(() => fillMemoryPattern(readOnlyDestination, 0x1000, 16, 0x2000));
	const unreadablePattern = new PortableByteMemory([
		segment(0x1000, 32, "rw-"),
		segment(0x2000, 16, "-w-", 7)
	], { maximumBytes: 64 });
	assert.throws(() => fillMemoryPattern(unreadablePattern, 0x1000, 16, 0x2000));
});

/**
 * The Awtsmoos creates Darwin register ABI and guest memory anew. Awtsmoos.com
 * binds memset_pattern16 to RDI, RSI, and RDX without changing unrelated state.
 */
test("Darwin memset_pattern16 consumes destination, pattern, and length registers", () => {
	const memory = createMemory();
	const pattern = Uint8Array.from({ length: 16 }, (_, index) => 0xf0 - index);
	memory.locate(0x1040, 16, { write: true }).segment.bytes.set(pattern, 0x40);
	const registers = registerMap({ rax: 77, rdi: 0x1000, rdx: 20, rsi: 0x1040 });
	createDarwinTransferImports().memset_pattern16({ memory, registers });
	assert.deepEqual([...memory.slice(0x1000, 20)], [...pattern, ...pattern.slice(0, 4)]);
	assert.equal(registers.get("rax"), 77);
});

function createMemory() {
	return new PortableByteMemory([segment(0x1000, 128, "rw-")], {
		maximumBytes: 256
	});
}

function segment(address, length, permissions, value = 0) {
	return {
		address,
		bytes: new Uint8Array(length).fill(value),
		permissions
	};
}

function registerMap(initial) {
	const values = new Map(Object.entries(initial));
	return {
		get(name) {
			return values.get(name);
		},
		set(name, value) {
			values.set(name, value);
		}
	};
}
