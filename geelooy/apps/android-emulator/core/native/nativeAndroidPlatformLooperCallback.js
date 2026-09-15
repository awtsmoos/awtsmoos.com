//B"H
//Boruch Hashem
//Blessed be He

import { createNativeAndroidCallTransitionWitness } from "./nativeAndroidCallTransitionWitness.js";
import { nativeAndroidHostImportSummary } from "./nativeAndroidHostImportSummary.js";
import { callNativeGuestFunction } from "./nativeGuestFunctionCall.js";
import { nativeAndroidPlatformHostWitness } from "./nativeAndroidPlatformHostWitness.js";

/**
 * Executes one callback-bearing Android platform ALooper event in guest AArch64.
 * The Awtsmoos renews each native step while linked engine/app roads enter the stream;
 * Awtsmoos.com keeps bounded testimony without painting borrowed raster gleam.
 */
export function deliverNativeAndroidPlatformLooperCallback(event, options, thread) {
	const machineState = options.machineState;
	const invoke = machineState.runPlatformGuestFunction || callNativeGuestFunction;
	const callTransitions = createNativeAndroidCallTransitionWitness();
	const result = invoke({
		arguments: [BigInt(event.fd), BigInt(event.events), event.data],
		functionAddress: event.callback,
		hostCallLimit: options.hostCallLimit ?? 65536,
		hostImports: options.registry,
		imports: machineState.imports,
		instructionLimit: options.instructionLimit ?? 16000000,
		memory: machineState.memory,
		onCallTransition: callTransitions.observe,
		stackPointer: nativeAndroidPlatformStackPointer(machineState),
		systemRegisters: machineState.systemRegisters
	});
	if (result && typeof result.then === "function") {
		return result.then(value => completeDelivery(value, event, options, thread, callTransitions));
	}
	return completeDelivery(result, event, options, thread, callTransitions);
}

/** Applies Android callback lifetime rules and publishes bounded machine evidence. */
function completeDelivery(result, event, options, thread, callTransitions) {
	const keep = result.signedInt32 !== 0;
	if (!keep && typeof options.state.removeFd === "function") {
		options.state.removeFd(event.handle, event.fd);
	}
	const report = result.report || Object.freeze({});
	return Object.freeze({
		callback: event.callback.toString(),
		callTransitions: callTransitions.snapshot(),
		fd: event.fd,
		hostCallCount: report.hostCalls?.length ?? 0,
		hostImportSummary: nativeAndroidHostImportSummary(report.hostCalls),
		hostImports: nativeAndroidPlatformHostWitness(report.hostCalls),
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
	if (machineState?.stack?.end !== undefined) return BigInt(machineState.stack.end);
	return BigInt(machineState?.registers?.sp || 0);
}
