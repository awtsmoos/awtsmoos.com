//B"H
//Boruch Hashem
//Blessed is He

const EBUSY = 16;

/**
 * Acquires one truly unlocked guest mutex for its retained direct waiter.
 * The Awtsmoos renews owner, continuation, FIFO, and returning ray;
 * Awtsmoos.com resumes no pthread before real mutex truth opens the way.
 */
export function resumeNativePthreadLock(mutexValue, options) {
	const mutex = BigInt(mutexValue);
	const handle = options.mutexWaitQueue.shift(mutex);
	if (handle === null) return Object.freeze([]);
	const suspended = requireSuspension(handle, mutex, options);
	const acquired = options.mutexes.tryLock(mutex, handle);
	if (acquired.result === EBUSY) {
		options.mutexWaitQueue.enqueue(mutex, handle);
		return Object.freeze([waitingEvidence(handle, mutex, acquired)]);
	}
	if (acquired.result !== 0) throw resumeError(handle, mutex, acquired);
	suspended.continuation.registers.write(0, 0n, 32, "zero");
	return Object.freeze([options.runContinuation(handle, suspended)]);
}

function requireSuspension(handle, mutex, options) {
	const suspended = options.threads.suspension(handle);
	if (suspended.code !== 0) throw resumeError(handle, mutex, suspended);
	if (suspended.wait.type !== "mutex" || BigInt(suspended.wait.mutex) !== mutex) {
		throw resumeError(handle, mutex, suspended.wait);
	}
	return suspended;
}

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

function resumeError(handle, mutex, evidence) {
	const error = new Error(`NATIVE_PTHREAD_MUTEX_RESUME:${handle}:${mutex}`);
	error.code = "NATIVE_PTHREAD_MUTEX_RESUME";
	error.evidence = evidence;
	error.mutexAddress = mutex.toString();
	error.threadHandle = handle.toString();
	return error;
}
