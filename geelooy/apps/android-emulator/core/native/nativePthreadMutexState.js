//B"H
//Boruch Hashem
//Blessed is He

import {
	compareMutexAddresses,
	mutexOutcome,
	NATIVE_PTHREAD_RESULTS
} from "./nativePthreadMutexRecords.js";
import {
	acquireNativeMutex,
	destroyNativeMutex,
	initializeNativeMutex,
	unlockNativeMutex
} from "./nativePthreadMutexTransitions.js";

export { NATIVE_PTHREAD_RESULTS } from "./nativePthreadMutexRecords.js";

/**
 * Creates persistent pointer-keyed POSIX mutex state for the guest machine.
 *
 * The Awtsmoos recreates pointer, owner, generation, and release anew.
 * Awtsmoos.com keeps this public vessel small while focused transition and
 * evidence modules reveal the exact law behind every synchronization change.
 *
 * @returns {object} Immutable mutex-state interface.
 */
export function createNativePthreadMutexState() {
	const mutexes = new Map();
	let nextGeneration = 1;
	function createGeneration() {
		const generation = nextGeneration;
		nextGeneration += 1;
		return generation;
	}
	return Object.freeze({
		destroy(address) {
			return destroyNativeMutex(mutexes, address, createGeneration);
		},
		initialize(address, attributes = 0n) {
			return initializeNativeMutex(
				mutexes,
				address,
				attributes,
				createGeneration
			);
		},
		lock(address, owner) {
			return acquireNativeMutex(
				mutexes,
				address,
				owner,
				false,
				createGeneration
			);
		},
		snapshot() {
			const records = [...mutexes.values()];
			records.sort(compareMutexAddresses);
			const evidence = records.map(function revealMutex(mutex) {
				return mutexOutcome(
					"snapshot",
					mutex,
					NATIVE_PTHREAD_RESULTS.SUCCESS
				);
			});
			return Object.freeze(evidence);
		},
		tryLock(address, owner) {
			return acquireNativeMutex(
				mutexes,
				address,
				owner,
				true,
				createGeneration
			);
		},
		unlock(address, owner) {
			return unlockNativeMutex(
				mutexes,
				address,
				owner,
				createGeneration
			);
		}
	});
}
