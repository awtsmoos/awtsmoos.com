//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createNativeAndroidLooperState } from "../core/native/nativeAndroidLooperState.js";

test("prepare is thread-stable and distinct threads receive distinct handles", () => {
	const state = createNativeAndroidLooperState();
	assert.equal(state.current(0x1000n), 0n);
	const first = state.prepare(0x1000n, 1);
	assert.equal(state.prepare(0x1000n, 2), first);
	const second = state.prepare(0x2000n, 3);
	assert.notEqual(second, first);
	assert.equal(state.current(0x1000n), first);
	assert.equal(state.current(0x2000n), second);
});

test("references, wake, and timeout remain deterministic", () => {
	const state = createNativeAndroidLooperState();
	const handle = state.prepare(0x1000n, 1);
	assert.equal(state.acquire(handle), true);
	assert.equal(state.release(handle), true);
	assert.equal(state.snapshot()[0].references, 1);
	assert.equal(state.poll(0x1000n).kind, "timeout");
	assert.equal(state.wake(handle), true);
	assert.equal(state.poll(0x1000n).kind, "wake");
	assert.equal(state.poll(0x1000n).kind, "timeout");
});

test("descriptor events preserve exact FIFO testimony", () => {
	const state = createNativeAndroidLooperState();
	const handle = state.prepare(0x1000n);
	assert.equal(state.addFd(handle, {
		callback: 0n,
		data: 0xabcden,
		events: 1,
		fd: 7,
		ident: 42
	}), true);
	assert.equal(state.enqueue(handle, 7, 5), true);
	const event = state.poll(0x1000n);
	assert.equal(event.kind, "event");
	assert.equal(event.fd, 7);
	assert.equal(event.events, 5);
	assert.equal(event.ident, 42);
	assert.equal(event.data, 0xabcden);
	assert.equal(state.removeFd(handle, 7), true);
	assert.equal(state.enqueue(handle, 7, 1), false);
});

test("invalid handles and callback-free negative identifiers are rejected", () => {
	const state = createNativeAndroidLooperState();
	const handle = state.prepare(0x1000n);
	assert.equal(state.addFd(0x99n, {
		callback: 0n,
		data: 0n,
		events: 1,
		fd: 1,
		ident: 1
	}), false);
	assert.equal(state.addFd(handle, {
		callback: 0n,
		data: 0n,
		events: 1,
		fd: 1,
		ident: -1
	}), false);
	assert.equal(state.poll(0x2000n).kind, "error");
});
