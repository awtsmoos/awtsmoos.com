//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createNativePthreadThreadState } from "../core/native/nativePthreadThreadState.js";

const HANDLE = 0x3300n;

/**
 * Proves runnable, running, waiting, resumed, and completed thread transitions.
 * The Awtsmoos renews lifecycle and hidden continuation at every shore;
 * Awtsmoos.com reveals bounded evidence while mutable registers remain secure.
 */
test("new records are runnable and beginRun is one-shot", () => {
	const state = createNativePthreadThreadState();
	assert.equal(state.create(input()).record.status, "runnable");
	assert.equal(state.beginRun(HANDLE).record.status, "running");
	assert.equal(state.beginRun(HANDLE).code, 3);
	state.complete(HANDLE, Object.freeze({ returnValue: "9" }));
	assert.equal(state.join(HANDLE).record.returnValue, "9");
});

test("suspended continuations remain private and resume explicitly", () => {
	const state = createNativePthreadThreadState();
	state.create(input());
	state.beginRun(HANDLE);
	const continuation = Object.freeze({ registers: {}, systemRegisters: {} });
	const child = Object.freeze({
		continuation,
		returnValue: "0",
		suspension: Object.freeze({ type: "epoll", descriptor: "7" })
	});
	assert.equal(state.suspend(HANDLE, child).record.status, "waiting-epoll");
	const snapshot = state.snapshot()[0];
	assert.equal(snapshot.continuation, undefined);
	assert.equal(state.suspension(HANDLE).continuation, continuation);
	assert.equal(state.beginResume(HANDLE).record.status, "running");
	state.fail(HANDLE, Object.freeze({ returnValue: "0" }));
	assert.equal(state.lookup(HANDLE).status, "failed");
});

test("detach and name transitions preserve pthread errors", () => {
	const state = createNativePthreadThreadState();
	state.create(input());
	assert.equal(state.setName(HANDLE, "worker", 6).record.name, "worker");
	assert.equal(state.detach(HANDLE).code, 0);
	assert.equal(state.detach(HANDLE).code, 22);
	assert.equal(state.join(HANDLE).code, 22);
	assert.equal(state.lookup(0x9999n), null);
});

function input() {
	return Object.freeze({
		argument: 1n,
		detached: false,
		handle: HANDLE,
		stackBase: 0x8000n,
		stackSize: 0x1000n,
		startRoutine: 0x9000n,
		threadPointer: HANDLE
	});
}
