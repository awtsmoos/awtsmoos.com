//B"H
//Boruch Hashem
//Blessed be He

const EBUSY = 16;

/**
 * Transfers one truly released mutex to the earliest valid managed waiter.
 *
 * Queue membership is diagnostic state, not authority over thread existence. A
 * terminated, externally-owned, or already-resumed identity can therefore become
 * stale if an earlier execution boundary is abandoned. Such entries are removed
 * with explicit evidence and the search continues; a live matching suspension is
 * the only record allowed to receive mutex ownership and resume guest execution.
 *
 * @param {bigint|number|string} mutexValue Guest mutex address being released.
 * @param {object} options Mutex queue, thread state, and continuation executor.
 * @returns {ReadonlyArray<object>} Stale/waiting/resumed evidence in FIFO order.
 */
export function resumeNativePthreadLock(mutexValue, options) {
	const mutex = BigInt(mutexValue);
	const results = [];
	while (true) {
		const handle = options.mutexWaitQueue.shift(mutex);
		if (handle === null) {
			return Object.freeze(results);
		}
		const suspended = options.threads.suspension(handle);
		const stale = staleReason(suspended, mutex);
		if (stale) {
			results.push(staleEvidence(handle, mutex, suspended, stale));
			continue;
		}
		const acquired = options.mutexes.tryLock(mutex, handle);
		if (acquired.result === EBUSY) {
			options.mutexWaitQueue.enqueue(mutex, handle);
			results.push(waitingEvidence(handle, mutex, acquired));
			return Object.freeze(results);
		}
		if (acquired.result !== 0) {
			throw resumeError(handle, mutex, acquired);
		}
		suspended.continuation.registers.write(0, 0n, 32, "zero");
		results.push(options.runContinuation(handle, suspended));
		return Object.freeze(results);
	}
}

/** Classifies queue membership that no longer points at this mutex suspension. */
function staleReason(suspended, mutex) {
	if (suspended.code !== 0) {
		return "missing-suspension";
	}
	if (suspended.wait?.type !== "mutex") {
		return "wait-type-mismatch";
	}
	return BigInt(suspended.wait.mutex) === mutex
		? null
		: "mutex-address-mismatch";
}

/** Records discarded queue membership without fabricating a resumed guest thread. */
function staleEvidence(handle, mutex, suspended, reason) {
	return Object.freeze({
		code: Number(suspended.code || 0),
		handle: handle.toString(),
		mutex: mutex.toString(),
		operation: "pthread-mutex-resume",
		reason,
		result: 0,
		status: "stale-mutex-waiter"
	});
}

/** Preserves a valid waiter when another owner still holds the mutex. */
function waitingEvidence(handle, mutex, acquired) {
	return Object.freeze({
		acquired,
		handle: handle.toString(),
		mutex: mutex.toString(),
		operation: "pthread-mutex-resume",
		result: 0,
		status: "waiting-mutex"
	});
}

/** Creates a coded failure when a live waiter cannot acquire an unlocked mutex. */
function resumeError(handle, mutex, evidence) {
	const error = new Error(`NATIVE_PTHREAD_MUTEX_RESUME:${handle}:${mutex}`);
	error.code = "NATIVE_PTHREAD_MUTEX_RESUME";
	error.evidence = evidence;
	error.mutexAddress = mutex.toString();
	error.threadHandle = handle.toString();
	return error;
}
