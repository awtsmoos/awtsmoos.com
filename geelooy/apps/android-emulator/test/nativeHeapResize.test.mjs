//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createNativeHeap } from "../core/native/nativeHeap.js";

/**
 * Proves calloc and realloc preserve logical guest bytes through aligned blocks.
 * The Awtsmoos renews pointer table, in-place measure, and moving copied shore;
 * Awtsmoos.com lets no stale metadata erase a guest address evermore.
 */
test("calloc clears dirty reused memory", () => {
	const heap = createNativeHeap(0x9000n, 0x80);
	const dirty = heap.allocate(16n);
	heap.write(dirty, new Uint8Array(16).fill(0xaa));
	heap.free(dirty);
	const cleared = heap.calloc(4n, 4n);
	assert.equal(cleared, dirty);
	assert.deepEqual([...heap.read(cleared, 16)], new Array(16).fill(0));
});

test("realloc growth preserves bytes and releases the old block", () => {
	const heap = createNativeHeap(0xa000n, 0x100);
	const prior = heap.allocate(8n);
	heap.write(prior, new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]));
	const replacement = heap.reallocate(prior, 48n);
	assert.notEqual(replacement, 0n);
	assert.notEqual(replacement, prior);
	assert.deepEqual([...heap.read(replacement, 8)], [1, 2, 3, 4, 5, 6, 7, 8]);
	assert.equal(heap.allocation(prior), null);
});

test("in-place growth updates metadata before a later moving realloc", () => {
	const heap = createNativeHeap(0xd000n, 0x100);
	const firstPointer = 0x1111222233334444n;
	const secondPointer = 0xaaaabbbbccccddddn;
	const prior = heap.allocate(8n);
	heap.write(prior, encodePointers([firstPointer]));
	assert.equal(heap.reallocate(prior, 16n), prior);
	assert.equal(heap.allocation(prior).requestedSize, 16n);
	heap.write(prior + 8n, encodePointers([secondPointer]));
	const replacement = heap.reallocate(prior, 32n);
	assert.notEqual(replacement, prior);
	assert.deepEqual(
		decodePointers(heap.read(replacement, 16)),
		[firstPointer, secondPointer]
	);
	assert.equal(heap.allocation(prior), null);
});

test("in-place shrink updates logical metadata without moving", () => {
	const heap = createNativeHeap(0xe000n, 0x80);
	const address = heap.allocate(24n);
	assert.equal(heap.reallocate(address, 9n), address);
	assert.equal(heap.allocation(address).requestedSize, 9n);
	assert.equal(heap.allocation(address).size, 32n);
});

test("failed realloc growth preserves the original allocation", () => {
	const heap = createNativeHeap(0xb000n, 0x40);
	const prior = heap.allocate(32n);
	heap.write(prior, new Uint8Array([9, 8, 7, 6]));
	assert.equal(heap.reallocate(prior, 64n), 0n);
	assert.ok(heap.allocation(prior));
	assert.deepEqual([...heap.read(prior, 4)], [9, 8, 7, 6]);
});

test("realloc null and zero follow malloc and free roads", () => {
	const heap = createNativeHeap(0xc000n, 0x80);
	const address = heap.reallocate(0n, 24n);
	assert.equal(address, 0xc000n);
	assert.equal(heap.reallocate(address, 0n), 0n);
	assert.equal(heap.allocation(address), null);
});

function encodePointers(values) {
	const bytes = new Uint8Array(values.length * 8);
	const view = new DataView(bytes.buffer);
	values.forEach((value, index) => view.setBigUint64(index * 8, value, true));
	return bytes;
}

function decodePointers(bytes) {
	const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
	return Array.from({ length: bytes.byteLength / 8 }, (_, index) => {
		return view.getBigUint64(index * 8, true);
	});
}
