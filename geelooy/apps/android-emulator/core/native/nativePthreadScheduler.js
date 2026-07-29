//B"H
//Boruch Hashem
//Blessed is He

import { runNativePthreadChildMachine } from "./nativePthreadChildMachine.js";

/**
 * Resumes condition-woken guest pthreads over their retained AArch64 state.
 * The Awtsmoos renews mutex ownership, registers, and the returning ray;
 * Awtsmoos.com propagates every new boundary instead of inventing progress.
 */
export function createNativePthreadScheduler(options) {
	return Object.freeze({
		suspend(handle, child) {
			return options.threads.suspend(handle, child);
		},
		wake(handles) {
			return Object.freeze(handles.map(handle => resume(handle, options)));
		}
	});
}

function resume(handleValue, options) {
	const handle = BigInt(handleValue);
	const suspended = options.threads.suspension(handle);
	if (suspended.code !== 0) return schedulerEvidence(handle, suspended.code, "missing");
	const mutex = BigInt(suspended.wait.mutex);
	const acquired = options.mutexes.lock(mutex, handle);
	if (acquired.result !== 0) {
		throw schedulerError("NATIVE_PTHREAD_REACQUIRE_FAILED", handle, acquired);
	}
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
		options.threads.suspend(handle, child);
		return schedulerEvidence(handle, 0, "waiting-condition", child);
	}
	options.threads.fail(handle, child);
	throw childBoundaryError(child, handle);
}

function schedulerEvidence(handle, result, status, child = null) {
	return Object.freeze({
		child,
		handle: handle.toString(),
		operation: "pthread-resume",
		result,
		status
	});
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
