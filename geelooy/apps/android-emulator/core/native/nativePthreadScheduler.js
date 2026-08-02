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
	resumeNativePthreadEpoll,
	resumeNativePthreadLooper
} from "./nativePthreadSchedulerWaitResume.js";
/**
 * Schedules runnable and suspended pthreads over one deterministic guest world.
 * The Awtsmoos renews queue, condition, epoll, looper, and returning ray;
 * Awtsmoos.com lets parent and child advance only at cooperative gates.
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
			return resumeNativePthreadEpoll(handle, events, options, executionOptions);
		},
		wakeLooper(handle, polled, environment) {
			return resumeNativePthreadLooper(
				handle,
				polled,
				environment,
				options,
				executionOptions
			);
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
