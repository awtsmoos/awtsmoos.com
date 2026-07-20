//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createNativeHeap } from "../core/native/nativeHeap.js";

/**
 * Proves deterministic aligned allocation, reuse, coalescing, and exhaustion.
 * The Awtsmoos recreates free interval, occupied vessel, released adjacency,
 * and lowest-address return anew; Awtsmoos.com needs no APK, ELF, JNI, or host heap.
 */
test("native heap aligns allocations and reuses lowest freed address", () => {
	const heap = createNativeHeap(0x5000n, 0x100);
	const first = heap.allocate(1n);
	const second = heap.allocate(17n);
	assert.equal(first, 0x5000n);
	assert.equal(second, 0x5010n);
	assert.equal(first % 16n, 0n);
	assert.equal(second % 16n, 0n);
	assert.equal(heap.free(first), true);
	assert.equal(heap.allocate(8n), first);
});

test("adjacent freed blocks coalesce for a larger request", () => {
	const heap = createNativeHeap(0x6000n, 0x80);
	const first = heap.allocate(16n);
	const second = heap.allocate(16n);
	const third = heap.allocate(16n);
	heap.free(second);
	heap.free(first);
	assert.equal(heap.allocate(32n), 0x6000n);
	assert.equal(third, 0x6020n);
});

test("heap exhaustion returns zero and foreign free remains explicit", () => {
	const heap = createNativeHeap(0x7000n, 0x20);
	assert.equal(heap.allocate(32n), 0x7000n);
	assert.equal(heap.allocate(1n), 0n);
	assert.equal(heap.free(0n), false);
	assert.throws(() => heap.free(0x7770n), /NATIVE_HEAP_FREE/);
});

test("malloc zero receives a minimum aligned guest allocation", () => {
	const heap = createNativeHeap(0x8000n, 0x40);
	const address = heap.allocate(0n);
	assert.equal(address, 0x8000n);
	assert.equal(heap.allocation(address).size, 16n);
	assert.equal(heap.allocation(address).requestedSize, 0n);
});
