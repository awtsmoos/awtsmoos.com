//B"H
//Boruch Hashem
//Blessed is He

import {
	resumeNativePthreadCondition,
	resumeNativePthreadMutex
} from "./nativePthreadConditionResume.js";
import { createNativePthreadExternalWakeState } from "./nativePthreadExternalWakeState.js";
import { createNativePthreadReacquireQueue } from "./nativePthreadReacquireQueue.js";
import { createNativePthreadRunnableQueue } from "./nativePthreadRunnableQueue.js";
import {
	resumeNativePthreadExecution,
	runNativePthreadStartup
} from "./nativePthreadSchedulerExecution.js";
import {
	NATIVE_EPOLL_EVENT_BYTES,
	writeNativeEpollEvent
} from "./nativeEpollEvent.js";
/**
 * Schedules runnable and suspended pthreads over one deterministic guest world.
 * The Awtsmoos renews queue, condition, epoll, mutex, and returning ray;
 * Awtsmoos.com lets parent and child advance only at explicit cooperative gates.
 */
export function createNativePthreadScheduler(options) {
	const externalWakes = createNativePthreadExternalWakeState();
	const reacquireQueue = createNativePthreadReacquireQueue();
	const runnable = createNativePthreadRunnableQueue();
	let draining = false;
	const suspend = (handle, child) => suspendThread(handle, child, options);
	const executionOptions = Object.freeze({ ...options, suspend });
	const resumeOptions = Object.freeze({
		...options,
		reacquireQueue,
		runContinuation: (handle, suspended) => {
			return resumeNativePthreadExecution(handle, suspended, executionOptions);
		}
	});
	return Object.freeze({
		consumeExternalWake: handle => externalWakes.consume(handle),
		externalWakeSnapshot: () => externalWakes.snapshot(),
		reacquireSnapshot: () => reacquireQueue.snapshot(),
		runRunnable() {
			if (draining) return Object.freeze([]);
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
			if (draining) return null;
			const startup = runnable.take(handle);
			return startup ? runNativePthreadStartup(startup, executionOptions) : null;
		},
		runnableSnapshot: () => runnable.snapshot(),
		schedule: startup => runnable.schedule(startup),
		suspend,
		wake(handles) {
			return Object.freeze(handles.map(handle => {
				if (!options.threads.lookup(BigInt(handle))) {
					return externalWakes.retain(handle);
				}
				return resumeNativePthreadCondition(handle, resumeOptions);
			}));
		},
		wakeEpoll(handle, events) {
			return resumeEpoll(handle, events, options, executionOptions);
		},
		wakeMutex(address) {
			return resumeNativePthreadMutex(address, resumeOptions);
		}
	});
}
function suspendThread(handle, child, options) {
	const stored = options.threads.suspend(handle, child);
	if (stored.code === 0) options.runtime?.track(handle, child.suspension);
	return stored;
}
function resumeEpoll(handleValue, events, options, executionOptions) {
	const handle = BigInt(handleValue);
	const suspended = requireSuspension(handle, options);
	if (suspended.wait.type !== "epoll") {
		throw schedulerError("NATIVE_PTHREAD_EPOLL_WAIT_MISMATCH", handle, suspended.wait);
	}
	const address = BigInt(suspended.wait.address);
	events.forEach((event, index) => writeNativeEpollEvent(
		options.machineState.memory,
		address + BigInt(index * NATIVE_EPOLL_EVENT_BYTES),
		event
	));
	suspended.continuation.registers.write(0, BigInt(events.length), 32, "zero");
	options.runtime?.untrack(handle);
	return resumeNativePthreadExecution(handle, suspended, executionOptions);
}
function requireSuspension(handle, options) {
	const suspended = options.threads.suspension(handle);
	if (suspended.code !== 0) {
		throw schedulerError("NATIVE_PTHREAD_RESUME_MISSING", handle, suspended);
	}
	return suspended;
}
function schedulerError(code, handle, evidence) {
	const error = new Error(`${code}:${handle}`);
	error.code = code;
	error.evidence = evidence;
	error.threadHandle = handle.toString();
	return error;
}
