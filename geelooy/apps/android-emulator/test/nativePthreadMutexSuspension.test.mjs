//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createAarch64SystemRegisters } from "../core/native/aarch64SystemRegisters.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";
import { registerNativePthreadMutexHandlers } from "../core/native/nativePthreadMutexHandlers.js";
import { createNativePthreadMutexState } from "../core/native/nativePthreadMutexState.js";
import { resumeNativePthreadLock } from "../core/native/nativePthreadMutexWait.js";
import { createNativePthreadMutexWaitQueue } from "../core/native/nativePthreadMutexWaitQueue.js";

const MUTEX = 0x6000n;
const OWNER = 0x7000n;
const WAITER = 0x8000n;
const RETURN = 0x9999n;

/**
 * Proves direct mutex contention retains and resumes one exact guest waiter.
 * The Awtsmoos renews owner, FIFO, W0, continuation, and returning shore;
 * Awtsmoos.com blocks no host lock and fabricates no unlock evermore.
 */
test("blocking lock suspends while trylock remains nonblocking", () => {
	const mutexes = createMutexes();
	const queued = [];
	const fixture = createFixture(mutexes, {
		waitMutex(address, handle) { queued.push([address, handle]); return true; },
		wakeMutex() { return Object.freeze([]); }
	}, WAITER);
	const suspended = invoke(fixture, "pthread_mutex_lock").result;
	assert.equal(suspended.machineControl.reason, "pthread-suspended");
	assert.equal(suspended.suspension.type, "mutex");
	assert.equal(suspended.suspension.owner, OWNER.toString());
	assert.deepEqual(queued, [[MUTEX, WAITER]]);
	assert.equal(fixture.registers.read(0, 32), 0n);
	assert.equal(fixture.registers.pc, RETURN);
	fixture.registers.write(0, MUTEX);
	assert.equal(invoke(fixture, "pthread_mutex_trylock").result.result, 16);
});

test("real unlock acquisition resumes the retained direct waiter", () => {
	const mutexes = createMutexes();
	mutexes.unlock(MUTEX, OWNER);
	const queue = createNativePthreadMutexWaitQueue();
	queue.enqueue(MUTEX, WAITER);
	const registers = createAarch64Registers({ programCounter: RETURN });
	const suspended = Object.freeze({
		code: 0,
		continuation: Object.freeze({ registers, systemRegisters: createAarch64SystemRegisters({ TPIDR_EL0: WAITER }) }),
		wait: Object.freeze({ mutex: MUTEX.toString(), thread: WAITER.toString(), type: "mutex" })
	});
	const result = resumeNativePthreadLock(MUTEX, {
		mutexes,
		mutexWaitQueue: queue,
		runContinuation(handle) { return Object.freeze({ handle: handle.toString(), status: "completed" }); },
		threads: { suspension() { return suspended; } }
	});
	assert.equal(result[0].status, "completed");
	assert.equal(mutexes.snapshot()[0].owner, WAITER.toString());
	assert.deepEqual(queue.snapshot(), []);
});

test("direct mutex wait queue is FIFO and rejects duplicate threads", () => {
	const queue = createNativePthreadMutexWaitQueue();
	assert.equal(queue.enqueue(MUTEX, WAITER), true);
	assert.equal(queue.enqueue(0x6100n, WAITER), false);
	assert.equal(queue.enqueue(MUTEX, 0x8100n), true);
	assert.equal(queue.shift(MUTEX), WAITER);
	assert.equal(queue.shift(MUTEX), 0x8100n);
});

function createMutexes() {
	const state = createNativePthreadMutexState();
	state.initialize(MUTEX, { processShared: 0, type: 0 });
	state.lock(MUTEX, OWNER);
	return state;
}
function createFixture(mutexes, scheduler, thread) {
	const registry = createNativeHostImportRegistry();
	registerNativePthreadMutexHandlers(registry, { attributes: {}, mutexes, scheduler });
	const registers = createAarch64Registers({ programCounter: 1n });
	registers.write(0, MUTEX);
	return { registry, registers, systemRegisters: createAarch64SystemRegisters({ TPIDR_EL0: thread }) };
}
function invoke(fixture, name) {
	fixture.registers.write(30, RETURN);
	return fixture.registry.handle({ name }, fixture);
}
