//B"H
//Boruch Hashem
//Blessed be He

import assert from "node:assert/strict";
import test from "node:test";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createNativePthreadMutexState } from "../core/native/nativePthreadMutexState.js";
import { resumeNativePthreadLock } from "../core/native/nativePthreadMutexWait.js";
import { createNativePthreadMutexWaitQueue } from "../core/native/nativePthreadMutexWaitQueue.js";
import {
	createExternalMutexOwnershipFixture,
	EXTERNAL_MUTEX,
	EXTERNAL_OWNER,
	EXTERNAL_ROOT,
	STALE_WAITER,
	VALID_WAITER
} from "./nativePthreadMutexExternalOwnershipFixture.mjs";

/**
 * Proves the persistent Flutter/JNI TLS thread cannot poison a child wait queue.
 * The authentic root identity may reach a blocking mutex from a platform callback,
 * but only scheduler-owned pthread continuations are eligible for queued resumption.
 */
test("external root mutex contention never enters managed wait queue", () => {
	const fixture = createExternalMutexOwnershipFixture();
	const blocked = fixture.invoke("pthread_mutex_lock", EXTERNAL_ROOT);
	assert.equal(blocked.handled.result.machineControl.reason, "pthread-suspended");
	assert.equal(blocked.handled.result.suspension.managed, false);
	assert.deepEqual(fixture.scheduler.mutexWaitSnapshot(), []);
	const released = fixture.invoke("pthread_mutex_unlock", EXTERNAL_OWNER);
	assert.equal(released.handled.result.result, 0);
	assert.deepEqual(released.handled.result.resumed, []);
});

/**
 * Proves defensive cleanup cannot starve a valid FIFO waiter behind stale state.
 * A dead/root queue member is reported and discarded; the next matching managed
 * suspension still acquires the actually unlocked mutex and resumes exactly once.
 */
test("stale mutex waiter is discarded before next valid waiter resumes", () => {
	const mutexes = createNativePthreadMutexState();
	mutexes.initialize(EXTERNAL_MUTEX, { processShared: 0, type: 0 });
	const queue = createNativePthreadMutexWaitQueue();
	queue.enqueue(EXTERNAL_MUTEX, STALE_WAITER);
	queue.enqueue(EXTERNAL_MUTEX, VALID_WAITER);
	const registers = createAarch64Registers({ programCounter: 0x4444n });
	const suspension = Object.freeze({
		code: 0,
		continuation: Object.freeze({ registers }),
		wait: Object.freeze({
			mutex: EXTERNAL_MUTEX.toString(),
			type: "mutex"
		})
	});
	let resumes = 0;
	const results = resumeNativePthreadLock(EXTERNAL_MUTEX, {
		mutexes,
		mutexWaitQueue: queue,
		runContinuation(handle) {
			resumes += 1;
			return Object.freeze({
				handle: handle.toString(),
				status: "completed"
			});
		},
		threads: {
			suspension(handle) {
				return handle === STALE_WAITER
					? Object.freeze({ code: 3, record: null })
					: suspension;
			}
		}
	});
	assert.equal(results.length, 2);
	assert.equal(results[0].status, "stale-mutex-waiter");
	assert.equal(results[0].reason, "missing-suspension");
	assert.equal(results[0].handle, STALE_WAITER.toString());
	assert.equal(results[1].status, "completed");
	assert.equal(results[1].handle, VALID_WAITER.toString());
	assert.equal(resumes, 1);
	assert.equal(mutexes.snapshot()[0].owner, VALID_WAITER.toString());
	assert.equal(registers.read(0, 32, "zero"), 0n);
	assert.deepEqual(queue.snapshot(), []);
});
