//B"H
//Boruch Hashem
//Blessed be He

import { createNativeMachineStop } from "./nativeMachineControl.js";

/**
 * Executes `pthread_mutex_lock` without confusing root and child thread ownership.
 *
 * Scheduler-created pthreads may enter the direct mutex wait queue because the
 * scheduler owns their retained continuation. The persistent Flutter/JNI platform
 * TLS identity has no child-thread record, so it receives an explicit external
 * suspension boundary and is never inserted into a queue that cannot resume it.
 *
 * @param {object} context Live AArch64 host-import context.
 * @param {object} mutexes Pointer-keyed pthread mutex state.
 * @param {?object} scheduler Cooperative pthread scheduler when available.
 * @returns {object} Mutex evidence or an explicit native-machine suspension stop.
 */
export function lockNativePthreadMutex(context, mutexes, scheduler) {
	const address = argument(context, 0);
	const current = thread(context);
	try {
		return finish(context, mutexes.lock(address, current));
	} catch (error) {
		if (error?.code !== "NATIVE_PTHREAD_MUTEX_WOULD_BLOCK" || !scheduler) {
			throw error;
		}
		const managed = isManagedThread(scheduler, current);
		if (managed && !scheduler.waitMutex(address, current)) {
			throw queueError(address, current);
		}
		context.registers.write(0, 0n, 32, "zero");
		context.registers.pc = context.registers.read(30, 64, "zero");
		return createNativeMachineStop("pthread-suspended", {
			operation: "pthread_mutex_lock",
			owner: error.owner,
			result: 0,
			suspension: Object.freeze({
				managed,
				mutex: address.toString(),
				owner: error.owner,
				thread: current.toString(),
				type: "mutex"
			})
		});
	}
}

/** Returns true only when the scheduler owns a resumable child-thread record. */
function isManagedThread(scheduler, handle) {
	return typeof scheduler.isManagedThread === "function"
		? scheduler.isManagedThread(handle)
		: true;
}

/** Creates a coded queue-integrity error for duplicate managed wait ownership. */
function queueError(address, threadValue) {
	const error = new Error(`NATIVE_PTHREAD_MUTEX_QUEUE:${address}:${threadValue}`);
	error.code = "NATIVE_PTHREAD_MUTEX_QUEUE";
	return error;
}

/** Reads the current guest pthread/TLS identity from TPIDR_EL0. */
function thread(context) {
	return context.systemRegisters?.read("TPIDR_EL0") || 0n;
}

/** Reads one unsigned general-register argument using Android AAPCS64 rules. */
function argument(context, index) {
	return context.registers.read(index, 64, "zero");
}

/** Writes a completed pthread result and returns through the guest link register. */
function finish(context, evidence) {
	context.registers.write(0, BigInt(evidence.result), 32, "zero");
	context.registers.pc = context.registers.read(30, 64, "zero");
	return evidence;
}
