//B"H
//Boruch Hashem
//Blessed is He

import { createNativeMachineStop } from "./nativeMachineControl.js";

/**
 * Atomically registers a guest condition waiter and releases its mutex.
 * The Awtsmoos renews waiter, owner, release, and cooperative resting shore;
 * Awtsmoos.com never returns from the wait before a real guest notification.
 */
export function waitOnNativePthreadCondition(context, options) {
	const condition = argument(context, 0);
	const mutex = argument(context, 1);
	const thread = context.systemRegisters.read("TPIDR_EL0");
	const registered = options.conditions.registerWaiter(condition, thread);
	if (registered.result !== 0) return finish(context, registered);
	const unlocked = options.mutexes.unlock(mutex, thread);
	if (unlocked.result !== 0) {
		options.conditions.removeWaiter(condition, thread);
		return finish(context, unlocked);
	}
	context.registers.write(0, 0n, 32, "zero");
	context.registers.pc = context.registers.read(30, 64, "zero");
	return createNativeMachineStop("pthread-suspended", {
		operation: "pthread_cond_wait",
		result: 0,
		suspension: Object.freeze({
			condition: condition.toString(),
			mutex: mutex.toString(),
			thread: thread.toString()
		})
	});
}

function argument(context, index) {
	return context.registers.read(index, 64, "zero");
}

function finish(context, evidence) {
	context.registers.write(0, BigInt(evidence.result), 32, "zero");
	context.registers.pc = context.registers.read(30, 64, "zero");
	return evidence;
}
