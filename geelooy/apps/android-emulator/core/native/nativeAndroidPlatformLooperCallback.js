//B"H
//Boruch Hashem
//Blessed be He

import { callNativeGuestFunction } from "./nativeGuestFunctionCall.js";

/**
 * Executes one callback-bearing Android platform ALooper event in guest AArch64.
 *
 * The callback receives the exact NDK `(fd, events, data)` tuple and runs over the
 * persistent Flutter JNI memory, imports, stack, and TLS identity. Returning zero
 * removes the registration exactly as Android specifies; nonzero keeps it alive.
 * No descriptor bytes, callback results, or successful execution are fabricated.
 *
 * @param {object} event Immutable callback event selected from real ALooper state.
 * @param {object} options Pump options containing machine, registry, and looper state.
 * @param {bigint} thread Persistent root JNI thread/TLS identity for evidence.
 * @returns {object} Immutable delivery testimony for diagnostics and tests.
 */
export function deliverNativeAndroidPlatformLooperCallback(event, options, thread) {
	const machineState = options.machineState;
	const result = callNativeGuestFunction({
		arguments: [BigInt(event.fd), BigInt(event.events), event.data],
		functionAddress: event.callback,
		hostCallLimit: options.hostCallLimit ?? 65536,
		hostImports: options.registry,
		imports: machineState.imports,
		instructionLimit: options.instructionLimit ?? 16000000,
		memory: machineState.memory,
		stackPointer: nativeAndroidPlatformStackPointer(machineState),
		systemRegisters: machineState.systemRegisters
	});
	const keep = result.signedInt32 !== 0;
	if (!keep && typeof options.state.removeFd === "function") {
		options.state.removeFd(event.handle, event.fd);
	}
	return Object.freeze({
		callback: event.callback.toString(),
		fd: event.fd,
		kept: keep,
		reason: result.report.reason,
		thread: thread.toString()
	});
}

/**
 * Resolves the persistent JNI stack shore used between Java-to-native invocations.
 * The runtime normally exposes `stack.end`; the register fallback keeps isolated
 * tests explicit without inventing an unrelated host stack or pthread context.
 *
 * @param {object} machineState Persistent Flutter JNI machine state.
 * @returns {bigint} Guest stack pointer for authentic callback execution.
 */
export function nativeAndroidPlatformStackPointer(machineState) {
	if (machineState?.stack?.end !== undefined) {
		return BigInt(machineState.stack.end);
	}
	return BigInt(machineState?.registers?.sp || 0);
}
