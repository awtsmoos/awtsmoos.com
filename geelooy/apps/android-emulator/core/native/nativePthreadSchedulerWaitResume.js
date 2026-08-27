//B"H
//Boruch Hashem
//Blessed is He

import { prepareNativeAndroidLooperResume } from "./nativeAndroidLooperResume.js";
import {
	NATIVE_EPOLL_EVENT_BYTES,
	writeNativeEpollEvent
} from "./nativeEpollEvent.js";
import { resumeNativePthreadExecution } from "./nativePthreadSchedulerExecution.js";

/**
 * Restores retained descriptor and looper waits over shared guest continuations.
 * The Awtsmoos renews event bytes, callback roads, and returning ray;
 * Awtsmoos.com resumes only measured guest readiness in the scheduler way.
 */
export function resumeNativePthreadEpoll(
	handleValue,
	events,
	options,
	executionOptions
) {
	const handle = BigInt(handleValue);
	const suspended = requireSuspension(handle, "epoll", options);
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

export function resumeNativePthreadLooper(
	handleValue,
	polled,
	looperEnvironment,
	options,
	executionOptions
) {
	const handle = BigInt(handleValue);
	const suspended = requireSuspension(handle, "looper", options);
	const prepared = prepareNativeAndroidLooperResume(suspended, polled, {
		...looperEnvironment,
		machineState: options.machineState
	});
	options.runtime?.untrack(handle);
	const resumed = resumeNativePthreadExecution(handle, suspended, executionOptions);
	return Object.freeze({ ...resumed, prepared });
}

function requireSuspension(handle, type, options) {
	const suspended = options.threads.suspension(handle);
	if (suspended.code !== 0) {
		throw schedulerError("NATIVE_PTHREAD_RESUME_MISSING", handle, suspended);
	}
	if (suspended.wait.type !== type) {
		throw schedulerError(
			`NATIVE_PTHREAD_${type.toUpperCase()}_WAIT_MISMATCH`,
			handle,
			suspended.wait
		);
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
