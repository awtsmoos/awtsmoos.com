//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createNativePthreadKeyState } from "../core/native/nativePthreadKeyState.js";

test("keys allocate lowest free slot and preserve destructor testimony", () => {
	const state = createNativePthreadKeyState({ capacity: 3 });
	assert.equal(state.allocate(0x1111n), 0);
	assert.equal(state.allocate(0x2222n), 1);
	assert.equal(state.delete(0), true);
	assert.equal(state.allocate(0x3333n), 0);
	assert.deepEqual(state.snapshot().map(item => [item.key, item.destructor]), [
		[0, "13107"],
		[1, "8738"]
	]);
});

test("thread values remain isolated and NULL clears one thread", () => {
	const state = createNativePthreadKeyState();
	const key = state.allocate(0x4444n);
	assert.equal(state.set(key, 0x1000n, 0xaaaan), true);
	assert.equal(state.set(key, 0x2000n, 0xbbbbn), true);
	assert.equal(state.get(key, 0x1000n), 0xaaaan);
	assert.equal(state.get(key, 0x2000n), 0xbbbbn);
	assert.equal(state.set(key, 0x1000n, 0n), true);
	assert.equal(state.get(key, 0x1000n), 0n);
	assert.equal(state.get(key, 0x2000n), 0xbbbbn);
});

test("deletion clears values and invalid operations stay bounded", () => {
	const state = createNativePthreadKeyState({ capacity: 1 });
	const key = state.allocate();
	state.set(key, 0x1000n, 0x55n);
	assert.equal(state.allocate(), null);
	assert.equal(state.delete(key), true);
	assert.equal(state.get(key, 0x1000n), 0n);
	assert.equal(state.set(key, 0x1000n, 1n), false);
	assert.equal(state.delete(key), false);
	assert.equal(state.allocate(), 0);
});
