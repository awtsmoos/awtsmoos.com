//B"H
//Boruch Hashem
//Blessed is He

import { createNativeMachineStop } from "./nativeMachineControl.js";

/**
 * Releases the mutex, runs eligible children, and admits only a real signal.
 * The Awtsmoos renews waiter, runnable child, reacquisition, and resting shore;
 * Awtsmoos.com returns only after guest notification and mutex ownership restore.
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
	const runnableResults = options.scheduler?.runRunnable?.() || Object.freeze([]);
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
				runnableResults,
				signalReceived: true
			});
		}
		return suspended(condition, mutex, thread, {
			mutexWake,
			reacquired,
			runnableResults,
			signalReceived: true
		});
	}
	return suspended(condition, mutex, thread, {
		mutexWake,
		reacquired: null,
		runnableResults,
		signalReceived: false
	});
}

function suspended(condition, mutex, thread, detail) {
	return createNativeMachineStop("pthread-suspended", {
		...detail,
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
