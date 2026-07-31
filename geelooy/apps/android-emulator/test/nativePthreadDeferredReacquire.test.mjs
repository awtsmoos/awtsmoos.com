//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	createDeferredReacquireFixture,
	FIRST,
	MAIN,
	MUTEX,
	SECOND,
	unlockDeferredMutex
} from "./nativePthreadDeferredReacquireFixture.mjs";

/**
 * Proves signaled condition waiters defer until FIFO mutex reacquisition.
 * The Awtsmoos renews owner unlock, one traveler, and retained AArch64 ray;
 * Awtsmoos.com resumes no guest before POSIX ownership opens the way.
 */
test("contended wake waits for owner unlock and duplicate wake stays singular", () => {
	const fixture = createDeferredReacquireFixture([FIRST]);
	fixture.mutexes.lock(MUTEX, MAIN);
	assert.equal(fixture.scheduler.wake([FIRST])[0].status, "waiting-mutex");
	assert.equal(fixture.scheduler.wake([FIRST])[0].status, "waiting-mutex");
	assert.deepEqual(fixture.scheduler.reacquireSnapshot(), [{
		handles: [FIRST.toString()],
		mutex: MUTEX.toString()
	}]);
	const unlocked = unlockDeferredMutex(fixture, MAIN);
	assert.equal(unlocked.result.resumed[0].status, "completed");
	assert.equal(fixture.threads.lookup(FIRST).status, "completed");
	assert.equal(fixture.mutexes.snapshot()[0].owner, FIRST.toString());
});

test("two deferred waiters transfer FIFO one successful unlock at a time", () => {
	const fixture = createDeferredReacquireFixture([FIRST, SECOND]);
	fixture.mutexes.lock(MUTEX, MAIN);
	assert.deepEqual(
		fixture.scheduler.wake([FIRST, SECOND]).map(item => item.status),
		["waiting-mutex", "waiting-mutex"]
	);
	unlockDeferredMutex(fixture, MAIN);
	assert.equal(fixture.threads.lookup(FIRST).status, "completed");
	assert.equal(fixture.threads.lookup(SECOND).status, "waiting-condition");
	unlockDeferredMutex(fixture, FIRST);
	assert.equal(fixture.threads.lookup(SECOND).status, "completed");
	assert.equal(fixture.mutexes.snapshot()[0].owner, SECOND.toString());
	assert.deepEqual(fixture.scheduler.reacquireSnapshot(), []);
});

test("wrong-owner unlock leaves deferred waiter untouched", () => {
	const fixture = createDeferredReacquireFixture([FIRST]);
	fixture.mutexes.lock(MUTEX, MAIN);
	fixture.scheduler.wake([FIRST]);
	const attempted = unlockDeferredMutex(fixture, SECOND);
	assert.equal(attempted.result.result, 1);
	assert.equal(attempted.result.resumed, undefined);
	assert.equal(fixture.threads.lookup(FIRST).status, "waiting-condition");
});
