//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createNativePthreadOnceState } from "../core/native/nativePthreadOnceState.js";

const BASE = Object.freeze({
	control: 0x3000n,
	initializer: 0x1100n,
	originalReturn: 0x100cn,
	thread: 0x5000n,
	trampoline: 0x7000n
});

test("first frame completes once and later calls are already complete", () => {
	const state = createNativePthreadOnceState();
	assert.equal(state.begin(BASE).status, "started");
	const completed = state.complete(BASE.thread);
	assert.equal(completed.status, "completed");
	assert.equal(completed.frame.originalReturn, BASE.originalReturn);
	assert.equal(state.begin(BASE).status, "already-complete");
	assert.deepEqual(state.snapshot(), [{
		control: "12288",
		initializer: "4352",
		owner: "20480",
		runs: 1,
		status: "complete"
	}]);
});

test("distinct nested controls complete in LIFO order", () => {
	const state = createNativePthreadOnceState();
	state.begin(BASE);
	state.begin({ ...BASE, control: 0x3010n, initializer: 0x1200n });
	assert.equal(state.complete(BASE.thread).control, 0x3010n);
	assert.equal(state.complete(BASE.thread).control, BASE.control);
	assert.deepEqual(state.snapshot().map(item => item.runs), [1, 1]);
});

test("same-owner reentry and another-owner contention remain explicit", () => {
	const state = createNativePthreadOnceState();
	state.begin(BASE);
	assert.throws(() => state.begin(BASE), error => {
		return error.code === "NATIVE_PTHREAD_ONCE_REENTRANT";
	});
	assert.throws(() => state.begin({ ...BASE, thread: 0x6000n }), error => {
		return error.code === "NATIVE_PTHREAD_ONCE_BUSY";
	});
});

test("invalid frames and unmatched completion are rejected", () => {
	const state = createNativePthreadOnceState();
	for (const name of ["control", "initializer", "originalReturn", "thread", "trampoline"]) {
		assert.throws(() => state.begin({ ...BASE, [name]: 0n }), error => {
			return error.code === "NATIVE_PTHREAD_ONCE_ARGUMENT";
		});
	}
	assert.throws(() => state.complete(BASE.thread), error => {
		return error.code === "NATIVE_PTHREAD_ONCE_FRAME_MISSING";
	});
});
