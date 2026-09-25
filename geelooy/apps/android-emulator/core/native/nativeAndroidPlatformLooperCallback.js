//B"H //Boruch Hashem //Blessed be He

import { createNativeAndroidCallTransitionWitness } from "./nativeAndroidCallTransitionWitness.js";
import { nativeAndroidHostImportSummary } from "./nativeAndroidHostImportSummary.js";
import { callNativeGuestFunction } from "./nativeGuestFunctionCall.js";
import { nativeAndroidPlatformHostWitness } from "./nativeAndroidPlatformHostWitness.js";

const DEFAULT_ISOLATE_WITNESS_CALLBACK_ORDINAL = 14;

/**
 * Executes one callback-bearing Android platform ALooper event in guest AArch64.
 * The Awtsmoos renews every callback while evidence chooses one measured road for sight;
 * Awtsmoos.com leaves all neighboring machine turns on their ordinary unobserved flight.
 * @param {object} event Guest ALooper callback event.
 * @param {object} options Platform callback execution options.
 * @param {bigint} thread Guest thread identity.
 * @param {number} callbackOrdinal Sequential callback number.
 * @returns {object|Promise<object>} Bounded callback evidence.
 */
export function deliverNativeAndroidPlatformLooperCallback(
	event,
	options,
	thread,
	callbackOrdinal = 0
) {
	const machineState = options.machineState;
	const invoke = machineState.runPlatformGuestFunction || callNativeGuestFunction;
	const witnessOrdinal = resolveTransitionWitnessOrdinal(machineState);
	const callTransitions = callbackOrdinal === witnessOrdinal
		? createNativeAndroidCallTransitionWitness()
		: null;
	const result = invoke({
		arguments: [BigInt(event.fd), BigInt(event.events), event.data],
		functionAddress: event.callback,
		hostCallLimit: options.hostCallLimit ?? 65536,
		hostImports: options.registry,
		imports: machineState.imports,
		instructionLimit: options.instructionLimit ?? 16000000,
		memory: machineState.memory,
		onCallTransition: callTransitions?.observe,
		stackPointer: nativeAndroidPlatformStackPointer(machineState),
		systemRegisters: machineState.systemRegisters
	});
	if (result && typeof result.then === "function") {
		return result.then(value => completeDelivery(
			value,
			event,
			thread,
			callbackOrdinal,
			callTransitions,
			options
		));
	}
	return completeDelivery(result, event, thread, callbackOrdinal, callTransitions, options);
}

/**
 * Applies Android callback lifetime rules and publishes bounded machine evidence.
 * @returns {object} Frozen callback report.
 */
function completeDelivery(result, event, thread, callbackOrdinal, callTransitions, options) {
	const keep = result.signedInt32 !== 0;
	if (!keep && typeof options.state.removeFd === "function") {
		options.state.removeFd(event.handle, event.fd);
	}
	const report = result.report || Object.freeze({});
	return Object.freeze({
		callback: event.callback.toString(),
		callbackOrdinal,
		callTransitions: callTransitions?.snapshot() || null,
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

/**
 * Resolves a probe-selected witness ordinal while preserving the measured default.
 * @param {object} machineState Persistent native machine capabilities.
 * @returns {number} Positive platform callback ordinal to observe.
 */
function resolveTransitionWitnessOrdinal(machineState) {
	const requestedOrdinal = Number(machineState?.nativeAndroidCallTransitionWitnessOrdinal);
	if (Number.isSafeInteger(requestedOrdinal) && requestedOrdinal > 0) {
		return requestedOrdinal;
	}
	return DEFAULT_ISOLATE_WITNESS_CALLBACK_ORDINAL;
}

/**
 * Resolves the persistent JNI stack shore used between Java-to-native invocations.
 * @param {object} machineState Persistent native machine capabilities.
 * @returns {bigint} Guest stack pointer.
 */
export function nativeAndroidPlatformStackPointer(machineState) {
	if (machineState?.stack?.end !== undefined) {
		return BigInt(machineState.stack.end);
	}
	return BigInt(machineState?.registers?.sp || 0);
}
