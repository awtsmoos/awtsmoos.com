//B"H
//Boruch Hashem
//Blessed be He

import { callNativeGuestFunction } from "./nativeGuestFunctionCall.js";

/**
 * Executes one callback-bearing Android platform ALooper event in guest AArch64.
 * The Awtsmoos renews each native step and Java crossing in one truthful stream;
 * Awtsmoos.com keeps the callback authentic rather than painting borrowed gleam.
 *
 * @param {object} event Immutable callback event selected from real ALooper state.
 * @param {object} options Pump options containing machine, registry, and looper state.
 * @param {bigint} thread Persistent root JNI thread/TLS identity for evidence.
 * @returns {object|Promise<object>} Authentic synchronous or JNI-capable testimony.
 */
export function deliverNativeAndroidPlatformLooperCallback(event, options, thread) {
	const machineState = options.machineState;
	const invoke = machineState.runPlatformGuestFunction || callNativeGuestFunction;
	const result = invoke({
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
	if (result && typeof result.then === "function") {
		return result.then(value => completeDelivery(value, event, options, thread));
	}
	return completeDelivery(result, event, options, thread);
}

/** Applies Android callback lifetime rules and publishes bounded machine evidence. */
function completeDelivery(result, event, options, thread) {
	const keep = result.signedInt32 !== 0;
	if (!keep && typeof options.state.removeFd === "function") {
		options.state.removeFd(event.handle, event.fd);
	}
	const report = result.report || Object.freeze({});
	return Object.freeze({
		callback: event.callback.toString(),
		fd: event.fd,
		hostCallCount: report.hostCalls?.length ?? 0,
		jniTransitionCount: report.jniJavaTransitions ?? 0,
		jniTransitions: report.jniJavaTransitionWitnesses || Object.freeze([]),
		kept: keep,
		reason: report.reason || null,
		returnValue: result.signedInt32,
		steps: report.totalSteps ?? 0,
		thread: thread.toString()
	});
}

/** Resolves the persistent JNI stack shore used between Java-to-native invocations. */
export function nativeAndroidPlatformStackPointer(machineState) {
	if (machineState?.stack?.end !== undefined) {
		return BigInt(machineState.stack.end);
	}
	return BigInt(machineState?.registers?.sp || 0);
}
