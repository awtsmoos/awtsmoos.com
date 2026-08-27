//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";
import { registerNativePthreadConditionHandlers } from "../core/native/nativePthreadConditionHandlers.js";
import { createNativePthreadConditionState } from "../core/native/nativePthreadConditionState.js";

const CONDITION = 0x6000n;
const FIRST = 0x7000n;
const SECOND = 0x8000n;
const RETURN_ADDRESS = 0x9999n;

/**
 * Proves queued workers reach condition waits before a real guest notification.
 * The Awtsmoos renews runnable order, waiter, wake, and returning shore;
 * Awtsmoos.com lets no valid broadcast pass sleeping workers at the door.
 */
test("broadcast drains workers before waking both registered waiters", () => {
	const fixture = createFixture([FIRST, SECOND]);
	const handled = invoke(fixture, "pthread_cond_broadcast", CONDITION);
	assert.deepEqual(fixture.order, ["run-runnable", "wake"]);
	assert.deepEqual(handled.result.woken, [FIRST.toString(), SECOND.toString()]);
	assert.deepEqual(handled.result.resumed, [FIRST.toString(), SECOND.toString()]);
	assert.deepEqual(handled.result.runnableResults, ["workers-registered"]);
	assert.equal(fixture.registers.read(0, 32), 0n);
	assert.equal(fixture.registers.read(1), 0xabcden);
	assert.equal(fixture.registers.pc, RETURN_ADDRESS);
});

test("signal wakes only the first waiter after runnable progress", () => {
	const fixture = createFixture([FIRST, SECOND]);
	const handled = invoke(fixture, "pthread_cond_signal", CONDITION);
	assert.deepEqual(handled.result.woken, [FIRST.toString()]);
	assert.deepEqual(handled.result.resumed, [FIRST.toString()]);
	assert.equal(fixture.conditions.snapshot()[0].waiterCount, 1);
});

test("null notifications return EINVAL without running queued children", () => {
	const fixture = createFixture([FIRST]);
	const handled = invoke(fixture, "pthread_cond_broadcast", 0n);
	assert.equal(handled.result.result, 22);
	assert.deepEqual(fixture.order, []);
	assert.equal(fixture.registers.read(0, 32), 22n);
});

test("reentrant empty drains remain valid immutable evidence", () => {
	const fixture = createFixture([], true);
	const handled = invoke(fixture, "pthread_cond_signal", CONDITION);
	assert.deepEqual(handled.result.runnableResults, []);
	assert.deepEqual(handled.result.resumed, []);
	assert.equal(Object.isFrozen(handled.result), true);
});

function createFixture(waiters, reentrant = false) {
	const conditions = createNativePthreadConditionState();
	conditions.initialize(CONDITION, 0n);
	const order = [];
	const scheduler = {
		runRunnable() {
			order.push("run-runnable");
			if (!reentrant) waiters.forEach(handle => conditions.registerWaiter(CONDITION, handle));
			return reentrant ? Object.freeze([]) : Object.freeze(["workers-registered"]);
		},
		wake(handles) {
			order.push("wake");
			return Object.freeze(handles.map(handle => handle.toString()));
		}
	};
	const registry = createNativeHostImportRegistry();
	registerNativePthreadConditionHandlers(registry, { conditions, scheduler });
	const registers = createAarch64Registers({ programCounter: 0x1234n });
	registers.write(1, 0xabcden);
	return { conditions, order, registers, registry };
}

function invoke(fixture, name, address) {
	fixture.registers.pc = 0x1234n;
	fixture.registers.write(0, address);
	fixture.registers.write(30, RETURN_ADDRESS);
	return fixture.registry.handle({ name }, { registers: fixture.registers });
}
