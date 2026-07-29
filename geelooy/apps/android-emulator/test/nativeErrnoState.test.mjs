//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createNativeErrnoState } from "../core/native/nativeErrnoState.js";
import { createNativeHeap } from "../core/native/nativeHeap.js";

test("errno allocates stable isolated four-byte cells per thread", () => {
	const heap = createNativeHeap(0x5000n, 0x100);
	const errno = createNativeErrnoState(heap);
	const first = errno.address(0x1111n);
	assert.equal(errno.address(0x1111n), first);
	const second = errno.address(0x2222n);
	assert.notEqual(second, first);
	assert.deepEqual([...heap.read(first, 4)], [0, 0, 0, 0]);
});

test("errno writes signed int bits in guest little endian", () => {
	const heap = createNativeHeap(0x6000n, 0x100);
	const errno = createNativeErrnoState(heap);
	errno.set(7n, 22);
	assert.equal(errno.get(7n), 22);
	assert.deepEqual([...heap.read(errno.address(7n), 4)], [22, 0, 0, 0]);
	errno.set(7n, -1);
	assert.deepEqual([...heap.read(errno.address(7n), 4)], [255, 255, 255, 255]);
});

test("errno snapshots sort thread identities", () => {
	const errno = createNativeErrnoState(createNativeHeap(0x7000n, 0x100));
	errno.set(9n, 2);
	errno.set(3n, 12);
	assert.deepEqual(errno.snapshot().map(item => [item.thread, item.value]), [
		["3", 12],
		["9", 2]
	]);
});
