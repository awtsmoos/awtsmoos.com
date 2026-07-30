//B"H
//Boruch Hashem
//Blessed is He

import { runNativePthreadChildMachine } from "./nativePthreadChildMachine.js";
import {
	NATIVE_EPOLL_EVENT_BYTES,
	writeNativeEpollEvent
} from "./nativeEpollEvent.js";

/**
 * Resumes condition and epoll suspended pthreads over retained AArch64 state.
 * The Awtsmoos renews mutex, event bytes, registers, and returning ray;
 * Awtsmoos.com propagates every new boundary instead of inventing a way.
 */
export function createNativePthreadScheduler(options) {
	return Object.freeze({
		suspend(handle, child) {
			const stored = options.threads.suspend(handle, child);
			if (stored.code === 0) options.runtime?.track(handle, child.suspension);
			return stored;
		},
		wake(handles) {
			return Object.freeze(handles.map(handle => resumeCondition(handle, options)));
		},
		wakeEpoll(handle, events) {
			return resumeEpoll(handle, events, options);
		}
	});
}

function resumeCondition(handleValue, options) {
	const handle = BigInt(handleValue);
	const suspended = requireSuspension(handle, options);
	const mutex = BigInt(suspended.wait.mutex);
	const acquired = options.mutexes.lock(mutex, handle);
	if (acquired.result !== 0) {
		throw schedulerError("NATIVE_PTHREAD_REACQUIRE_FAILED", handle, acquired);
	}
	return runContinuation(handle, suspended, options);
}

function resumeEpoll(handleValue, events, options) {
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
	return runContinuation(handle, suspended, options);
}

function requireSuspension(handle, options) {
	const suspended = options.threads.suspension(handle);
	if (suspended.code !== 0) {
		throw schedulerError("NATIVE_PTHREAD_RESUME_MISSING", handle, suspended);
	}
	return suspended;
}

function runContinuation(handle, suspended, options) {
	const begun = options.threads.beginResume(handle);
	if (begun.code !== 0) throw schedulerError("NATIVE_PTHREAD_RESUME_STATE", handle, begun);
	const child = runNativePthreadChildMachine({
		hostImports: options.registry,
		imports: options.machineState.imports,
		memory: options.machineState.memory,
		registers: suspended.continuation.registers,
		systemRegisters: suspended.continuation.systemRegisters
	});
	if (child.report.reason === "return") {
		options.threads.complete(handle, child);
		return schedulerEvidence(handle, 0, "completed", child);
	}
	if (child.report.reason === "pthread-suspended") {
		createNativePthreadScheduler(options).suspend(handle, child);
		return schedulerEvidence(handle, 0, waitingStatus(child), child);
	}
	options.threads.fail(handle, child);
	throw childBoundaryError(child, handle);
}

function waitingStatus(child) {
	return `waiting-${child.suspension?.type || "condition"}`;
}

function schedulerEvidence(handle, result, status, child = null) {
	return Object.freeze({ child, handle: handle.toString(), operation: "pthread-resume", result, status });
}

function schedulerError(code, handle, evidence) {
	const error = new Error(`${code}:${handle}`);
	error.code = code;
	error.evidence = evidence;
	error.threadHandle = handle.toString();
	return error;
}

function childBoundaryError(child, handle) {
	const error = new Error(`NATIVE_PTHREAD_CHILD_BOUNDARY:${child.report.reason}`);
	error.code = "NATIVE_PTHREAD_CHILD_BOUNDARY";
	error.childEvidence = child;
	error.threadHandle = handle.toString();
	return error;
}
