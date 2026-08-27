//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createNativePthreadConditionState } from "../core/native/nativePthreadConditionState.js";
import { NATIVE_PTHREAD_RESULTS } from "../core/native/nativePthreadMutexRecords.js";

test("authentic-style broadcast lazily creates an idle condition", () => {
	const conditions = createNativePthreadConditionState();
	const result = conditions.broadcast(11301792n);
	assert.equal(result.result, 0);
	assert.equal(result.broadcastEpoch, 1);
	assert.equal(result.waiterCount, 0);
	assert.deepEqual(result.woken, []);
});

test("signal wakes one waiter and broadcast wakes the remainder", () => {
	const conditions = createNativePthreadConditionState();
	conditions.registerWaiter(0x6000n, 0x1111n);
	conditions.registerWaiter(0x6000n, 0x2222n);
	conditions.registerWaiter(0x6000n, 0x3333n);
	const signaled = conditions.signal(0x6000n);
	assert.deepEqual(signaled.woken, ["4369"]);
	assert.equal(signaled.waiterCount, 2);
	const broadcast = conditions.broadcast(0x6000n);
	assert.deepEqual(broadcast.woken, ["8738", "13107"]);
	assert.equal(broadcast.waiterCount, 0);
});

test("init, busy destroy, removal, destroy, and reuse preserve generations", () => {
	const conditions = createNativePthreadConditionState();
	const initialized = conditions.initialize(0x7000n, 0n);
	conditions.registerWaiter(0x7000n, 0x1111n);
	assert.equal(
		conditions.destroy(0x7000n).result,
		NATIVE_PTHREAD_RESULTS.EBUSY
	);
	conditions.removeWaiter(0x7000n, 0x1111n);
	const destroyed = conditions.destroy(0x7000n);
	assert.equal(destroyed.result, 0);
	const reused = conditions.initialize(0x7000n, 0n);
	assert.ok(reused.generation > initialized.generation);
});

test("null pointers and nonzero attributes return EINVAL", () => {
	const conditions = createNativePthreadConditionState();
	assert.equal(conditions.signal(0n).result, NATIVE_PTHREAD_RESULTS.EINVAL);
	assert.equal(conditions.broadcast(0n).result, NATIVE_PTHREAD_RESULTS.EINVAL);
	assert.equal(
		conditions.initialize(0x8000n, 1n).result,
		NATIVE_PTHREAD_RESULTS.EINVAL
	);
	assert.equal(conditions.snapshot().length, 0);
});

test("snapshots are sorted and expose notification epochs", () => {
	const conditions = createNativePthreadConditionState();
	conditions.broadcast(0x9000n);
	conditions.signal(0x8000n);
	assert.deepEqual(
		conditions.snapshot().map(item => [
			item.address,
			item.signalEpoch,
			item.broadcastEpoch
		]),
		[["32768", 1, 0], ["36864", 0, 1]]
	);
});
