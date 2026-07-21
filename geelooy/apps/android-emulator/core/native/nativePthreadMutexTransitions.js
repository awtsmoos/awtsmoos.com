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

/**
 * Applies finite pthread mutex transitions to persistent guest-pointer records.
 *
 * The Awtsmoos recreates acquisition, refusal, release, and destruction anew.
 * Awtsmoos.com keeps every transition explicit, nonblocking to the host event
 * loop, and independent of Flutter, Dart, or any application-specific behavior.
 */
export function destroyNativeMutex(mutexes, address, createGeneration) {
	const normalized = normalizeMutexPointer(address);
	if (normalized === 0n) {
		return invalidMutexOutcome("destroy");
	}
	const mutex = ensureMutexRecord(mutexes, normalized, createGeneration);
	if (mutex.owner !== null) {
		return mutexOutcome(
			"destroy",
			mutex,
			NATIVE_PTHREAD_RESULTS.EBUSY
		);
	}
	mutexes.delete(normalized);
	return mutexOutcome("destroy", mutex, NATIVE_PTHREAD_RESULTS.SUCCESS);
}

export function initializeNativeMutex(
	mutexes,
	address,
	attributes,
	createGeneration
) {
	const normalized = normalizeMutexPointer(address);
	if (normalized === 0n || BigInt(attributes) !== 0n) {
		return invalidMutexOutcome("initialize");
	}
	const current = mutexes.get(normalized);
	if (current && current.owner !== null) {
		return mutexOutcome(
			"initialize",
			current,
			NATIVE_PTHREAD_RESULTS.EBUSY
		);
	}
	const mutex = createMutexRecord(normalized, createGeneration());
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
	if (normalized === 0n) {
		return invalidMutexOutcome(operation);
	}
	const mutex = ensureMutexRecord(mutexes, normalized, createGeneration);
	const thread = normalizeMutexPointer(owner);
	if (mutex.owner !== null) {
		if (nonblocking) {
			return mutexOutcome(
				operation,
				mutex,
				NATIVE_PTHREAD_RESULTS.EBUSY
			);
		}
		throw createBlockedMutexError(mutex, thread);
	}
	mutex.owner = thread;
	return mutexOutcome(operation, mutex, NATIVE_PTHREAD_RESULTS.SUCCESS);
}

export function unlockNativeMutex(
	mutexes,
	address,
	owner,
	createGeneration
) {
	const normalized = normalizeMutexPointer(address);
	if (normalized === 0n) {
		return invalidMutexOutcome("unlock");
	}
	const mutex = ensureMutexRecord(mutexes, normalized, createGeneration);
	const thread = normalizeMutexPointer(owner);
	if (mutex.owner !== thread) {
		return mutexOutcome(
			"unlock",
			mutex,
			NATIVE_PTHREAD_RESULTS.EPERM
		);
	}
	mutex.owner = null;
	return mutexOutcome("unlock", mutex, NATIVE_PTHREAD_RESULTS.SUCCESS);
}
