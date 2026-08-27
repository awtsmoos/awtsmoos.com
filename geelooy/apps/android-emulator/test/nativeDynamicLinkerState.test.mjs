//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { readNativeCString } from "../core/native/nativeCString.js";
import { createNativeDynamicLinkerState } from "../core/native/nativeDynamicLinkerState.js";
import { createNativeHeap } from "../core/native/nativeHeap.js";

test("empty heapless channel supports initial dlerror semantics", () => {
	const state = createNativeDynamicLinkerState();
	assert.equal(state.peek(0n), 0n);
	assert.equal(state.take(0n), 0n);
	assert.equal(state.clear(0n), false);
	assert.deepEqual(state.snapshot(), []);
	assert.throws(() => state.set(0n, "missing"), error => {
		return error.code === "NATIVE_DYNAMIC_LINKER_ERROR_HEAP";
	});
});

test("dynamic linker errors are stable, consumed, and thread isolated", () => {
	const heap = createNativeHeap(0x5000n, 0x400);
	const state = createNativeDynamicLinkerState(heap);
	assert.equal(state.take(1n), 0n);
	const first = state.set(1n, "symbol missing");
	const second = state.set(2n, "library missing");
	assert.equal(readNativeCString(heap, first).text, "symbol missing");
	assert.equal(state.take(1n), first);
	assert.equal(state.take(1n), 0n);
	assert.equal(state.take(2n), second);
	assert.equal(readNativeCString(heap, first).text, "symbol missing");
});

test("replacement allocates before releasing prior storage", () => {
	const heap = createNativeHeap(0x6000n, 0x100);
	const state = createNativeDynamicLinkerState(heap);
	const first = state.set(7n, "first");
	assert.equal(state.peek(7n), first);
	const second = state.set(7n, "second error");
	assert.notEqual(second, first);
	assert.equal(state.peek(7n), second);
	assert.equal(readNativeCString(heap, second).text, "second error");
	assert.equal(heap.allocation(first), null);
});

test("state validates text and preserves sorted immutable evidence", () => {
	const state = createNativeDynamicLinkerState(createNativeHeap(0x7000n, 0x200));
	assert.throws(() => state.set(1n, ""), error => {
		return error.code === "NATIVE_DYNAMIC_LINKER_ERROR_TEXT";
	});
	assert.throws(() => state.set(1n, "bad\0text"), error => {
		return error.code === "NATIVE_DYNAMIC_LINKER_ERROR_TEXT";
	});
	state.set(9n, "nine");
	state.set(3n, "three");
	assert.deepEqual(state.snapshot().map(item => item.thread), ["3", "9"]);
	assert.ok(Object.isFrozen(state.snapshot()));
});

test("allocation failure leaves the previous error pending", () => {
	const heap = createNativeHeap(0x8000n, 0x20);
	const state = createNativeDynamicLinkerState(heap);
	const first = state.set(1n, "one");
	assert.throws(() => state.set(1n, "x".repeat(40)), error => {
		return error.code === "NATIVE_DYNAMIC_LINKER_ERROR_ALLOCATION";
	});
	assert.equal(state.take(1n), first);
});
