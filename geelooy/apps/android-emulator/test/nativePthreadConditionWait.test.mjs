//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createAarch64SystemRegisters } from "../core/native/aarch64SystemRegisters.js";
import { createNativePthreadConditionState } from "../core/native/nativePthreadConditionState.js";
import { waitOnNativePthreadCondition } from "../core/native/nativePthreadConditionWait.js";
import { createNativePthreadMutexState } from "../core/native/nativePthreadMutexState.js";

const CONDITION = 123136716714912n;
const MUTEX = 123136716714872n;
const THREAD = 123136714481168n;
const RETURN_ADDRESS = 0x7777n;

/**
 * Reproduces the authentic wait pointers and proves atomic guest suspension.
 * The Awtsmoos renews waiter, mutex release, W0, and continuation shore;
 * Awtsmoos.com registers no false wake and blocks no host thread evermore.
 */
test("condition wait registers the authentic waiter and releases its mutex", () => {
	const conditions = createNativePthreadConditionState();
	const mutexes = createNativePthreadMutexState();
	assert.equal(conditions.initialize(CONDITION, 0n).result, 0);
	assert.equal(mutexes.initialize(MUTEX, 0n).result, 0);
	assert.equal(mutexes.lock(MUTEX, THREAD).result, 0);
	const registers = createAarch64Registers({ programCounter: 0x9000n });
	const systemRegisters = createAarch64SystemRegisters({ TPIDR_EL0: THREAD });
	registers.write(0, CONDITION);
	registers.write(1, MUTEX);
	registers.write(30, RETURN_ADDRESS);
	const evidence = waitOnNativePthreadCondition({
		registers,
		systemRegisters
	}, { conditions, mutexes });
	assert.equal(evidence.machineControl.reason, "pthread-suspended");
	assert.deepEqual(evidence.suspension, {
		condition: CONDITION.toString(),
		mutex: MUTEX.toString(),
		thread: THREAD.toString()
	});
	assert.equal(registers.read(0, 32), 0n);
	assert.equal(registers.pc, RETURN_ADDRESS);
	assert.equal(conditions.snapshot()[0].waiterCount, 1);
	assert.equal(mutexes.snapshot()[0].owner, null);
});

test("failed mutex release rolls back the waiter", () => {
	const conditions = createNativePthreadConditionState();
	const mutexes = createNativePthreadMutexState();
	conditions.initialize(CONDITION, 0n);
	mutexes.initialize(MUTEX, 0n);
	mutexes.lock(MUTEX, THREAD + 1n);
	const registers = createAarch64Registers({ programCounter: 0x9000n });
	const systemRegisters = createAarch64SystemRegisters({ TPIDR_EL0: THREAD });
	registers.write(0, CONDITION);
	registers.write(1, MUTEX);
	registers.write(30, RETURN_ADDRESS);
	const evidence = waitOnNativePthreadCondition({ registers, systemRegisters }, {
		conditions,
		mutexes
	});
	assert.equal(evidence.result, 1);
	assert.equal(conditions.snapshot()[0].waiterCount, 0);
});
