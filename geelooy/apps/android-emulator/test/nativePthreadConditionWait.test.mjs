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
const OTHER = THREAD + 1n;
const RETURN_ADDRESS = 0x7777n;

/**
 * Proves mutex handoff admits only a real signal and successful reacquisition.
 * The Awtsmoos renews waiter, child wake, mutex owner, and returning shore;
 * Awtsmoos.com registers no false signal and blocks no host thread evermore.
 */
test("condition wait without a real signal remains suspended", () => {
	const fixture = createFixture();
	const evidence = waitOnNativePthreadCondition(fixture.context, fixture.options);
	assert.equal(evidence.machineControl.reason, "pthread-suspended");
	assert.equal(evidence.signalReceived, false);
	assert.equal(fixture.wakeCalls, 1);
	assert.equal(fixture.conditions.snapshot()[0].waiterCount, 1);
	assert.equal(fixture.mutexes.snapshot()[0].owner, null);
	assert.equal(fixture.context.registers.pc, RETURN_ADDRESS);
});

test("synchronous child signal and free mutex complete the top-level wait", () => {
	const fixture = createFixture({ signal: true });
	const evidence = waitOnNativePthreadCondition(fixture.context, fixture.options);
	assert.equal(evidence.machineControl, undefined);
	assert.equal(evidence.signalReceived, true);
	assert.equal(evidence.reacquired.result, 0);
	assert.equal(fixture.conditions.snapshot()[0].waiterCount, 0);
	assert.equal(fixture.mutexes.snapshot()[0].owner, THREAD.toString());
});

test("real signal with contested mutex preserves suspension", () => {
	const fixture = createFixture({ contest: true, signal: true });
	const evidence = waitOnNativePthreadCondition(fixture.context, fixture.options);
	assert.equal(evidence.machineControl.reason, "pthread-suspended");
	assert.equal(evidence.signalReceived, true);
	assert.notEqual(evidence.reacquired.result, 0);
	assert.equal(fixture.mutexes.snapshot()[0].owner, OTHER.toString());
});

test("failed mutex release rolls back the waiter", () => {
	const fixture = createFixture({ wrongOwner: true });
	const evidence = waitOnNativePthreadCondition(fixture.context, fixture.options);
	assert.equal(evidence.result, 1);
	assert.equal(fixture.conditions.snapshot()[0].waiterCount, 0);
});

function createFixture(settings = {}) {
	const conditions = createNativePthreadConditionState();
	const mutexes = createNativePthreadMutexState();
	conditions.initialize(CONDITION, 0n);
	mutexes.initialize(MUTEX, 0n);
	mutexes.lock(MUTEX, settings.wrongOwner ? OTHER : THREAD);
	const registers = createAarch64Registers({ programCounter: 0x9000n });
	const systemRegisters = createAarch64SystemRegisters({ TPIDR_EL0: THREAD });
	registers.write(0, CONDITION);
	registers.write(1, MUTEX);
	registers.write(30, RETURN_ADDRESS);
	let externalWake = false;
	const fixture = {
		conditions,
		context: { registers, systemRegisters },
		mutexes,
		wakeCalls: 0
	};
	fixture.options = {
		conditions,
		mutexes,
		scheduler: {
			consumeExternalWake() {
				const value = externalWake;
				externalWake = false;
				return value;
			},
			wakeMutex() {
				fixture.wakeCalls += 1;
				if (settings.signal) {
					conditions.signal(CONDITION);
					externalWake = true;
				}
				if (settings.contest) mutexes.tryLock(MUTEX, OTHER);
				return Object.freeze({ operation: "pthread-mutex-wake", result: 0 });
			}
		}
	};
	return fixture;
}
