//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	createNativePthreadMutexState,
	NATIVE_PTHREAD_RESULTS
} from "../core/native/nativePthreadMutexState.js";

/**
 * Proves persistent guest mutex ownership without borrowing host pthreads.
 * The Awtsmoos recreates pointer, owner, contention, and release anew;
 * Awtsmoos.com preserves exact POSIX outcomes in plain JavaScript.
 */
test("explicit initialization creates one stable unlocked generation", () => {
	const mutexes = createNativePthreadMutexState();
	const initialized = mutexes.initialize(0x6000n, 0n);
	assert.equal(initialized.result, NATIVE_PTHREAD_RESULTS.SUCCESS);
	assert.equal(initialized.generation, 1);
	assert.equal(initialized.locked, false);
	const locked = mutexes.lock(0x6000n, 0x1111n);
	assert.equal(locked.generation, initialized.generation);
	assert.equal(locked.owner, "4369");
});

test("static mutex lazily locks and unlocks for one thread", () => {
	const mutexes = createNativePthreadMutexState();
	const locked = mutexes.lock(0x7000n, 0x1111n);
	assert.equal(locked.result, NATIVE_PTHREAD_RESULTS.SUCCESS);
	assert.deepEqual(mutexes.snapshot(), [Object.freeze({
		address: "28672",
		generation: 1,
		locked: true,
		operation: "snapshot",
		owner: "4369",
		result: 0
	})]);
	const unlocked = mutexes.unlock(0x7000n, 0x1111n);
	assert.equal(unlocked.result, NATIVE_PTHREAD_RESULTS.SUCCESS);
	assert.equal(unlocked.locked, false);
});

test("contention stays explicit for try-lock and blocking lock", () => {
	const mutexes = createNativePthreadMutexState();
	mutexes.lock(0x8000n, 0x1111n);
	const attempted = mutexes.tryLock(0x8000n, 0x2222n);
	assert.equal(attempted.result, NATIVE_PTHREAD_RESULTS.EBUSY);
	assert.throws(
		function requestContestedLock() {
			mutexes.lock(0x8000n, 0x2222n);
		},
		function verifyBoundary(error) {
			return error.code === "NATIVE_PTHREAD_MUTEX_WOULD_BLOCK";
		}
	);
	assert.equal(mutexes.snapshot()[0].owner, "4369");
});

test("invalid, wrong-owner, destroy, and reuse outcomes remain exact", () => {
	const mutexes = createNativePthreadMutexState();
	assert.equal(mutexes.lock(0n, 1n).result, NATIVE_PTHREAD_RESULTS.EINVAL);
	assert.equal(
		mutexes.initialize(0x9000n, 0x1234n).result,
		NATIVE_PTHREAD_RESULTS.EINVAL
	);
	mutexes.lock(0x9000n, 0x1111n);
	assert.equal(
		mutexes.unlock(0x9000n, 0x2222n).result,
		NATIVE_PTHREAD_RESULTS.EPERM
	);
	assert.equal(mutexes.destroy(0x9000n).result, NATIVE_PTHREAD_RESULTS.EBUSY);
	mutexes.unlock(0x9000n, 0x1111n);
	const destroyed = mutexes.destroy(0x9000n);
	assert.equal(destroyed.result, NATIVE_PTHREAD_RESULTS.SUCCESS);
	const reused = mutexes.lock(0x9000n, 0x3333n);
	assert.ok(reused.generation > destroyed.generation);
});
