//B"H
//Boruch Hashem
//Blessed is He

import { NATIVE_PTHREAD_RESULTS } from "./nativePthreadMutexRecords.js";

/**
 * Reacquires one condition waiter's mutex or defers it without host blocking.
 * The Awtsmoos renews signaled thread, contested lock, and later returning ray;
 * Awtsmoos.com preserves POSIX ownership while the owner continues its way.
 */
export function resumeNativePthreadCondition(handleValue, options) {
	const handle = normalize(handleValue);
	const suspended = requireConditionSuspension(handle, options);
	const mutex = normalize(suspended.wait.mutex);
	const acquired = options.mutexes.tryLock(mutex, handle);
	if (acquired.result === NATIVE_PTHREAD_RESULTS.SUCCESS) {
		return options.runContinuation(handle, suspended);
	}
	if (acquired.result === NATIVE_PTHREAD_RESULTS.EBUSY) {
		options.reacquireQueue.enqueue(mutex, handle);
		return waitingEvidence(handle, mutex);
	}
	throw schedulerError("NATIVE_PTHREAD_REACQUIRE_FAILED", handle, acquired);
}

export function resumeNativePthreadMutex(mutexValue, options) {
	const mutex = normalize(mutexValue);
	const handle = options.reacquireQueue.shift(mutex);
	if (handle === null) return Object.freeze([]);
	return Object.freeze([resumeNativePthreadCondition(handle, options)]);
}

function requireConditionSuspension(handle, options) {
	const suspended = options.threads.suspension(handle);
	if (suspended.code !== 0) {
		throw schedulerError("NATIVE_PTHREAD_RESUME_MISSING", handle, suspended);
	}
	if (!suspended.wait?.mutex || suspended.wait.type === "epoll") {
		throw schedulerError("NATIVE_PTHREAD_CONDITION_WAIT_MISMATCH", handle, suspended.wait);
	}
	return suspended;
}

function waitingEvidence(handle, mutex) {
	return Object.freeze({
		child: null,
		handle: handle.toString(),
		mutex: mutex.toString(),
		operation: "pthread-resume",
		result: 0,
		status: "waiting-mutex"
	});
}

function schedulerError(code, handle, evidence) {
	const error = new Error(`${code}:${handle}`);
	error.code = code;
	error.evidence = evidence;
	error.threadHandle = handle.toString();
	return error;
}

function normalize(value) {
	return BigInt.asUintN(64, BigInt(value));
}
