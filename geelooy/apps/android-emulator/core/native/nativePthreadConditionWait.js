//B"H
//Boruch Hashem
//Blessed is He

import { createNativeMachineStop } from "./nativeMachineControl.js";

/**
 * Atomically releases the mutex and admits only a real guest condition signal.
 * The Awtsmoos renews waiter, child wake, reacquisition, and resting shore;
 * Awtsmoos.com never returns before notification and mutex ownership restore.
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
	const mutexWake = options.scheduler?.wakeMutex(mutex) || null;
	const signalReceived = options.scheduler?.consumeExternalWake(thread) || false;
	if (signalReceived) {
		const reacquired = options.mutexes.tryLock(mutex, thread);
		if (reacquired.result === 0) {
			return Object.freeze({
				...registered,
				mutexWake,
				operation: "pthread_cond_wait",
				reacquired,
				result: 0,
				signalReceived: true
			});
		}
		return suspended(condition, mutex, thread, mutexWake, true, reacquired);
	}
	return suspended(condition, mutex, thread, mutexWake, false, null);
}
function suspended(condition, mutex, thread, mutexWake, signalReceived, reacquired) {
	return createNativeMachineStop("pthread-suspended", {
		mutexWake,
		operation: "pthread_cond_wait",
		reacquired,
		result: 0,
		signalReceived,
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
