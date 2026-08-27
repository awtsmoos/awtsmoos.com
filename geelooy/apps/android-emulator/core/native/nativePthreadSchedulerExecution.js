//B"H
//Boruch Hashem
//Blessed is He

import { runNativePthreadChildMachine } from "./nativePthreadChildMachine.js";

/**
 * Executes fresh and retained child vessels through one lifecycle boundary.
 * The Awtsmoos renews runnable, continuation, return, and suspension ray;
 * Awtsmoos.com preserves every unsupported child boundary in measured display.
 */
export function runNativePthreadStartup(startup, options) {
	const begun = options.threads.beginRun(startup.handle);
	if (begun.code !== 0) {
		throw schedulerError("NATIVE_PTHREAD_RUN_STATE", startup.handle, begun);
	}
	const child = runNativePthreadChildMachine({
		argument: startup.argument,
		hostImports: options.registry,
		imports: options.machineState.imports,
		memory: options.machineState.memory,
		stackTop: startup.stackTop,
		startRoutine: startup.startRoutine,
		threadPointer: startup.threadPointer
	});
	return settleChild(startup.handle, child, options, "pthread-start");
}

export function resumeNativePthreadExecution(handleValue, suspended, options) {
	const handle = BigInt(handleValue);
	const begun = options.threads.beginResume(handle);
	if (begun.code !== 0) {
		throw schedulerError("NATIVE_PTHREAD_RESUME_STATE", handle, begun);
	}
	const child = runNativePthreadChildMachine({
		hostImports: options.registry,
		imports: options.machineState.imports,
		memory: options.machineState.memory,
		registers: suspended.continuation.registers,
		systemRegisters: suspended.continuation.systemRegisters
	});
	return settleChild(handle, child, options, "pthread-resume");
}

function settleChild(handle, child, options, operation) {
	if (child.report.reason === "return") {
		options.threads.complete(handle, child);
		return evidence(handle, operation, "completed", child);
	}
	if (child.report.reason === "pthread-suspended") {
		const stored = options.suspend(handle, child);
		if (stored.code !== 0) {
			throw schedulerError("NATIVE_PTHREAD_SUSPEND_STATE", handle, stored);
		}
		return evidence(handle, operation, waitingStatus(child), child);
	}
	options.threads.fail(handle, child);
	throw childBoundaryError(child, handle);
}

function waitingStatus(child) {
	return `waiting-${child.suspension?.type || "condition"}`;
}

function evidence(handle, operation, status, child) {
	return Object.freeze({
		child,
		handle: handle.toString(),
		operation,
		result: 0,
		status
	});
}

function schedulerError(code, handle, detail) {
	const error = new Error(`${code}:${handle}`);
	error.code = code;
	error.evidence = detail;
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
