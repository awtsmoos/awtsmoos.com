//B"H
//Boruch Hashem
//Blessed be He

import { resumeNativePthreadCondition, resumeNativePthreadMutex } from "./nativePthreadConditionResume.js";
import { createNativePthreadExternalWakeState } from "./nativePthreadExternalWakeState.js";
import { resumeNativePthreadLock } from "./nativePthreadMutexWait.js";
import { createNativePthreadMutexWaitQueue } from "./nativePthreadMutexWaitQueue.js";
import { createNativePthreadReacquireQueue } from "./nativePthreadReacquireQueue.js";
import { createNativePthreadRunnableQueue } from "./nativePthreadRunnableQueue.js";
import { resumeNativePthreadExecution, runNativePthreadStartup } from "./nativePthreadSchedulerExecution.js";
import { resumeNativePthreadEpoll, resumeNativePthreadLooper } from "./nativePthreadSchedulerWaitResume.js";

/**
 * Schedules runnable and suspended pthreads over one deterministic guest world.
 *
 * Only pthreads created by the emulated pthread API belong to `threads`. The
 * persistent Flutter/JNI platform TLS identity is external, so callers must use
 * `isManagedThread` before placing an identity into queues whose wake path needs
 * a retained child-thread continuation.
 */
export function createNativePthreadScheduler(options) {
	const externalWakes = createNativePthreadExternalWakeState();
	const mutexWaitQueue = createNativePthreadMutexWaitQueue();
	const reacquireQueue = createNativePthreadReacquireQueue();
	const runnable = createNativePthreadRunnableQueue();
	let draining = false;
	const suspend = (handle, child) => suspendThread(handle, child, options);
	const executionOptions = Object.freeze({ ...options, suspend });
	const runContinuation = (handle, suspended) => {
		return resumeNativePthreadExecution(handle, suspended, executionOptions);
	};
	const resumeOptions = Object.freeze({
		...options,
		reacquireQueue,
		runContinuation
	});
	const mutexOptions = Object.freeze({
		...options,
		mutexWaitQueue,
		runContinuation
	});
	return Object.freeze({
		consumeExternalWake: handle => externalWakes.consume(handle),
		externalWakeSnapshot: () => externalWakes.snapshot(),
		isManagedThread(handle) {
			return Boolean(options.threads.lookup(BigInt(handle)));
		},
		mutexWaitSnapshot: () => mutexWaitQueue.snapshot(),
		reacquireSnapshot: () => reacquireQueue.snapshot(),
		runRunnable() {
			if (draining) {
				return Object.freeze([]);
			}
			draining = true;
			const results = [];
			try {
				let startup = runnable.takeNext();
				while (startup) {
					results.push(runNativePthreadStartup(startup, executionOptions));
					startup = runnable.takeNext();
				}
			} finally {
				draining = false;
			}
			return Object.freeze(results);
		},
		runThread(handle) {
			if (draining) {
				return null;
			}
			const startup = runnable.take(handle);
			return startup
				? runNativePthreadStartup(startup, executionOptions)
				: null;
		},
		runnableSnapshot: () => runnable.snapshot(),
		schedule: startup => runnable.schedule(startup),
		suspend,
		waitMutex: (address, handle) => mutexWaitQueue.enqueue(address, handle),
		wake(handles) {
			return Object.freeze(handles.map(handle => {
				return !options.threads.lookup(BigInt(handle))
					? externalWakes.retain(handle)
					: resumeNativePthreadCondition(handle, resumeOptions);
			}));
		},
		wakeEpoll: (handle, events) => resumeNativePthreadEpoll(
			handle,
			events,
			options,
			executionOptions
		),
		wakeLooper: (handle, polled, environment) => resumeNativePthreadLooper(
			handle,
			polled,
			environment,
			options,
			executionOptions
		),
		wakeMutex(address) {
			const condition = resumeNativePthreadMutex(address, resumeOptions);
			return condition.length > 0
				? condition
				: resumeNativePthreadLock(address, mutexOptions);
		}
	});
}

function suspendThread(handle, child, options) {
	const stored = options.threads.suspend(handle, child);
	if (stored.code === 0) {
		options.runtime?.track(handle, child.suspension);
	}
	return stored;
}
