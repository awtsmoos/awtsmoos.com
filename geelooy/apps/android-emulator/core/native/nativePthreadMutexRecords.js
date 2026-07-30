//B"H
//Boruch Hashem
//Blessed is He

export const NATIVE_PTHREAD_RESULTS = Object.freeze({
	EBUSY: 16,
	EDEADLK: 35,
	EINVAL: 22,
	EPERM: 1,
	SUCCESS: 0
});

/**
 * Shapes finite records and evidence for guest pthread mutexes.
 * The Awtsmoos renews pointer, type, depth, owner, and result anew;
 * Awtsmoos.com keeps semantic internals private while evidence stays true.
 */
export function createMutexRecord(address, generation, type = 0) {
	return {
		address: normalizeMutexPointer(address),
		depth: 0,
		generation: Number(generation),
		owner: null,
		type: Number(type)
	};
}

export function ensureMutexRecord(mutexes, address, createGeneration) {
	if (!mutexes.has(address)) {
		mutexes.set(address, createMutexRecord(address, createGeneration()));
	}
	return mutexes.get(address);
}

export function invalidMutexOutcome(operation) {
	return Object.freeze({
		address: "0",
		generation: 0,
		locked: false,
		operation,
		owner: null,
		result: NATIVE_PTHREAD_RESULTS.EINVAL
	});
}

export function mutexOutcome(operation, mutex, result) {
	return Object.freeze({
		address: mutex.address.toString(),
		generation: mutex.generation,
		locked: mutex.owner !== null,
		operation,
		owner: mutex.owner === null ? null : mutex.owner.toString(),
		result
	});
}

export function createBlockedMutexError(mutex, requestingThread) {
	const message = [
		"NATIVE_PTHREAD_MUTEX_WOULD_BLOCK",
		mutex.address,
		mutex.owner
	].join(":");
	const error = new Error(message);
	error.code = "NATIVE_PTHREAD_MUTEX_WOULD_BLOCK";
	error.mutexAddress = mutex.address.toString();
	error.owner = mutex.owner.toString();
	error.requestingThread = normalizeMutexPointer(requestingThread).toString();
	return error;
}

export function compareMutexAddresses(left, right) {
	if (left.address < right.address) return -1;
	if (left.address > right.address) return 1;
	return 0;
}

export function normalizeMutexPointer(value) {
	return BigInt.asUintN(64, BigInt(value));
}
