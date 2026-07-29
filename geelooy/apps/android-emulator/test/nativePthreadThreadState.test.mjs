//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createNativePthreadThreadState } from "../core/native/nativePthreadThreadState.js";

function createInput(handle = 0x9000n) {
	return {
		argument: 0x44n,
		detached: false,
		handle,
		stackBase: 0x10000n,
		stackSize: 0x200000n,
		startRoutine: 0x4b0458n,
		threadPointer: handle
	};
}

test("thread state records name, completion, return, and join evidence", () => {
	const state = createNativePthreadThreadState();
	const created = state.create(createInput());
	assert.equal(created.code, 0);
	assert.equal(created.record.name, "");
	assert.equal(created.record.nameByteLength, 0);
	const named = state.setName(0x9000n, "io.flutter.ui", 13);
	assert.equal(named.code, 0);
	assert.equal(named.record.name, "io.flutter.ui");
	assert.equal(named.record.nameByteLength, 13);
	assert.equal(state.join(0x9000n).code, 22);
	assert.equal(state.complete(0x9000n, {
		report: { reason: "return" },
		returnValue: "77"
	}).code, 0);
	const joined = state.join(0x9000n);
	assert.equal(joined.code, 0);
	assert.equal(joined.record.returnValue, "77");
	assert.equal(joined.record.name, "io.flutter.ui");
});

test("detached, duplicate, and unknown handles reject transitions", () => {
	const state = createNativePthreadThreadState();
	assert.equal(state.create(createInput(0xa000n)).code, 0);
	assert.equal(state.create(createInput(0xa000n)).code, 22);
	assert.equal(state.setName(0xdeadn, "missing", 7).code, 3);
	assert.equal(state.detach(0xa000n).code, 0);
	assert.equal(state.detach(0xa000n).code, 22);
	assert.equal(state.join(0xa000n).code, 22);
	assert.equal(state.join(0xdeadn).code, 3);
});
