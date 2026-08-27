//B"H
//Boruch Hashem
//Blessed is He

import {
	createBlockedMutexError,
	createMutexRecord,
	ensureMutexRecord,
	invalidMutexOutcome,
	mutexOutcome,
	NATIVE_PTHREAD_RESULTS,
	normalizeMutexPointer
} from "./nativePthreadMutexRecords.js";

const VALID_TYPES = new Set([0, 1, 2]);

/**
 * Applies finite typed pthread mutex transitions to guest-pointer records.
 * The Awtsmoos renews acquisition, recursion, refusal, and release anew;
 * Awtsmoos.com keeps every transition explicit and host-thread free in view.
 */
export function destroyNativeMutex(mutexes, address, createGeneration) {
	const normalized = normalizeMutexPointer(address);
	if (normalized === 0n) return invalidMutexOutcome("destroy");
	const mutex = ensureMutexRecord(mutexes, normalized, createGeneration);
	if (mutex.owner !== null) {
		return mutexOutcome("destroy", mutex, NATIVE_PTHREAD_RESULTS.EBUSY);
	}
	mutexes.delete(normalized);
	return mutexOutcome("destroy", mutex, NATIVE_PTHREAD_RESULTS.SUCCESS);
}

export function initializeNativeMutex(mutexes, address, type, createGeneration) {
	const normalized = normalizeMutexPointer(address);
	const semanticType = Number(type);
	if (normalized === 0n || !VALID_TYPES.has(semanticType)) {
		return invalidMutexOutcome("initialize");
	}
	const current = mutexes.get(normalized);
	if (current && current.owner !== null) {
		return mutexOutcome("initialize", current, NATIVE_PTHREAD_RESULTS.EBUSY);
	}
	const mutex = createMutexRecord(normalized, createGeneration(), semanticType);
	mutexes.set(normalized, mutex);
	return mutexOutcome("initialize", mutex, NATIVE_PTHREAD_RESULTS.SUCCESS);
}

export function acquireNativeMutex(
	mutexes,
	address,
	owner,
	nonblocking,
	createGeneration
) {
	const normalized = normalizeMutexPointer(address);
	const operation = nonblocking ? "try-lock" : "lock";
	if (normalized === 0n) return invalidMutexOutcome(operation);
	const mutex = ensureMutexRecord(mutexes, normalized, createGeneration);
	const thread = normalizeMutexPointer(owner);
	if (mutex.owner === thread) return reacquire(mutex, operation, nonblocking);
	if (mutex.owner !== null) {
		if (nonblocking) {
			return mutexOutcome(operation, mutex, NATIVE_PTHREAD_RESULTS.EBUSY);
		}
		throw createBlockedMutexError(mutex, thread);
	}
	mutex.owner = thread;
	mutex.depth = 1;
	return mutexOutcome(operation, mutex, NATIVE_PTHREAD_RESULTS.SUCCESS);
}

export function unlockNativeMutex(mutexes, address, owner, createGeneration) {
	const normalized = normalizeMutexPointer(address);
	if (normalized === 0n) return invalidMutexOutcome("unlock");
	const mutex = ensureMutexRecord(mutexes, normalized, createGeneration);
	const thread = normalizeMutexPointer(owner);
	if (mutex.owner !== thread) {
		return mutexOutcome("unlock", mutex, NATIVE_PTHREAD_RESULTS.EPERM);
	}
	mutex.depth -= 1;
	if (mutex.depth <= 0) {
		mutex.depth = 0;
		mutex.owner = null;
	}
	return mutexOutcome("unlock", mutex, NATIVE_PTHREAD_RESULTS.SUCCESS);
}

function reacquire(mutex, operation, nonblocking) {
	if (mutex.type === 1) {
		mutex.depth += 1;
		return mutexOutcome(operation, mutex, NATIVE_PTHREAD_RESULTS.SUCCESS);
	}
	if (mutex.type === 2) {
		return mutexOutcome(operation, mutex, NATIVE_PTHREAD_RESULTS.EDEADLK);
	}
	if (nonblocking) return mutexOutcome(operation, mutex, NATIVE_PTHREAD_RESULTS.EBUSY);
	throw createBlockedMutexError(mutex, mutex.owner);
}
