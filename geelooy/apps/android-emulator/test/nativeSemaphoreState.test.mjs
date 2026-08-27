//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	createNativeSemaphoreState,
	NATIVE_SEMAPHORE_VALUES
} from "../core/native/nativeSemaphoreState.js";

const ADDRESS = 0x7000n;

/**
 * Proves guest semaphore tokens change only through measured POSIX transitions.
 * The Awtsmoos renews count, generation, overflow, and waiting shore;
 * Awtsmoos.com keeps every blocked token visible at the synchronization door.
 */
test("authentic count-two semaphore consumes two tokens then blocks", () => {
	const state = createNativeSemaphoreState();
	const initialized = state.initialize(ADDRESS, 0, 2);
	assert.deepEqual(pick(initialized), {
		count: 2,
		errno: 0,
		processShared: false,
		result: 0,
		success: true
	});
	assert.equal(state.wait(ADDRESS).count, 1);
	assert.equal(state.wait(ADDRESS).count, 0);
	assert.throws(() => state.wait(ADDRESS), error => {
		assert.equal(error.code, "NATIVE_SEMAPHORE_WOULD_BLOCK");
		assert.equal(error.evidence.count, 0);
		assert.equal(error.evidence.success, false);
		return true;
	});
	assert.equal(state.getValue(ADDRESS).count, 0);
});

test("post, try-wait, destroy, and generation reuse stay deterministic", () => {
	const state = createNativeSemaphoreState();
	assert.equal(state.initialize(ADDRESS, 1, 1).generation, 1);
	assert.equal(state.wait(ADDRESS).count, 0);
	const empty = state.tryWait(ADDRESS);
	assert.equal(empty.errno, NATIVE_SEMAPHORE_VALUES.EAGAIN);
	assert.equal(empty.result, -1);
	assert.equal(state.post(ADDRESS).count, 1);
	assert.equal(state.tryWait(ADDRESS).count, 0);
	assert.equal(state.destroy(ADDRESS).count, 0);
	assert.equal(state.getValue(ADDRESS).errno, NATIVE_SEMAPHORE_VALUES.EINVAL);
	assert.equal(state.initialize(ADDRESS, 0, 3).generation, 2);
});

test("invalid addresses, invalid counts, and overflow never mutate state", () => {
	const state = createNativeSemaphoreState();
	assert.equal(state.initialize(0n, 0, 1).errno, NATIVE_SEMAPHORE_VALUES.EINVAL);
	assert.equal(state.initialize(ADDRESS, 0, -1).errno, NATIVE_SEMAPHORE_VALUES.EINVAL);
	assert.equal(state.initialize(ADDRESS, 0, 0x80000000).errno, NATIVE_SEMAPHORE_VALUES.EINVAL);
	state.initialize(ADDRESS, 0, NATIVE_SEMAPHORE_VALUES.SEM_VALUE_MAX);
	const overflow = state.post(ADDRESS);
	assert.equal(overflow.errno, NATIVE_SEMAPHORE_VALUES.EOVERFLOW);
	assert.equal(state.getValue(ADDRESS).count, NATIVE_SEMAPHORE_VALUES.SEM_VALUE_MAX);
});

test("snapshots are immutable and sorted by guest address", () => {
	const state = createNativeSemaphoreState();
	state.initialize(0x9000n, 0, 9);
	state.initialize(0x8000n, 0, 8);
	const snapshot = state.snapshot();
	assert.equal(Object.isFrozen(snapshot), true);
	assert.deepEqual(snapshot.map(record => record.address), ["32768", "36864"]);
	assert.equal(snapshot.every(Object.isFrozen), true);
});

function pick(outcome) {
	return {
		count: outcome.count,
		errno: outcome.errno,
		processShared: outcome.processShared,
		result: outcome.result,
		success: outcome.success
	};
}
