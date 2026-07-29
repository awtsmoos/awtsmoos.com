//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	createNativePipeState,
	NATIVE_PIPE_CAPACITY
} from "../core/native/nativePipeState.js";
import {
	NATIVE_PIPE_EVENT_ERROR,
	NATIVE_PIPE_EVENT_HANGUP,
	NATIVE_PIPE_EVENT_INPUT,
	NATIVE_PIPE_EVENT_OUTPUT
} from "../core/native/nativePipeRecord.js";

test("pipe FIFO preserves byte order across partial reads", () => {
	const state = createNativePipeState({ capacity: 8 });
	const pair = state.create(0);
	assert.equal(pair.ok, true);
	assert.equal(state.write(pair.writeFd, Uint8Array.of(1, 2, 3, 4)).count, 4);
	assert.deepEqual([...state.read(pair.readFd, 2).bytes], [1, 2]);
	assert.deepEqual([...state.read(pair.readFd, 8).bytes], [3, 4]);
	assert.equal(state.read(pair.readFd, 1).ready, false);
});

test("capacity, close, EOF, and broken pipe stay explicit", () => {
	const state = createNativePipeState({ capacity: 3 });
	const pair = state.create(0);
	assert.equal(state.write(pair.writeFd, Uint8Array.of(1, 2, 3, 4)).count, 3);
	assert.equal(state.write(pair.writeFd, Uint8Array.of(5)).ready, false);
	assert.equal(state.close(pair.writeFd), true);
	assert.deepEqual([...state.read(pair.readFd, 8).bytes], [1, 2, 3]);
	assert.equal(state.read(pair.readFd, 8).eof, true);
	const second = state.create(0);
	assert.equal(state.close(second.readFd), true);
	assert.equal(state.write(second.writeFd, Uint8Array.of(1)).error, "broken-pipe");
	assert.equal(NATIVE_PIPE_CAPACITY, 65536);
});

test("event bits reveal bytes, capacity, hangup, and error", () => {
	const state = createNativePipeState({ capacity: 2 });
	const pair = state.create(0);
	assert.equal(state.events(pair.writeFd), NATIVE_PIPE_EVENT_OUTPUT);
	state.write(pair.writeFd, Uint8Array.of(1, 2));
	assert.equal(state.events(pair.readFd), NATIVE_PIPE_EVENT_INPUT);
	assert.equal(state.events(pair.writeFd), 0);
	state.close(pair.writeFd);
	assert.equal(state.events(pair.readFd),
		NATIVE_PIPE_EVENT_INPUT | NATIVE_PIPE_EVENT_HANGUP);
	const second = state.create(0);
	state.close(second.readFd);
	assert.equal(state.events(second.writeFd), NATIVE_PIPE_EVENT_ERROR);
});

test("invalid flags and bounded pair capacity are rejected", () => {
	const state = createNativePipeState({ maximumPairs: 1 });
	assert.equal(state.create(4).error, "invalid");
	assert.equal(state.create(0).ok, true);
	assert.equal(state.create(0).error, "capacity");
});
