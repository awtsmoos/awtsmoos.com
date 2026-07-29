//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createNativePthreadThreadState } from "../core/native/nativePthreadThreadState.js";

test("thread state stores bounded name testimony without changing lifecycle", () => {
	const state = createNativePthreadThreadState();
	const handle = 0x6000n;
	assert.equal(state.create({
		argument: 1n,
		handle,
		stackBase: 0x7000n,
		stackSize: 0x10000n,
		startRoutine: 0x8000n,
		threadPointer: handle
	}).code, 0);
	assert.equal(state.lookup(handle).name, "");
	assert.equal(state.setName(handle, "io.worker", 9).code, 0);
	assert.equal(state.lookup(handle).name, "io.worker");
	assert.equal(state.lookup(handle).nameByteLength, 9);
	assert.equal(state.lookup(handle).status, "running");
	assert.equal(state.setName(0x9999n, "lost", 4).code, 3);
});
