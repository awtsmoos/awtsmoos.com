//B"H
//Boruch Hashem
//Blessed is He

import {
	ANDROID_THREAD_POLICY,
	ANDROID_THREAD_POLICY_BUILDER,
	defaultThreadPolicyState,
	readStoredStrictModeState,
	requireStrictModeType,
	strictModeStateError,
	writeStoredStrictModeState
} from "./frameworkAndroidStrictModeStateValues.js";

export { ANDROID_THREAD_POLICY, ANDROID_THREAD_POLICY_BUILDER };
const DETECTION_FLAGS = Object.freeze([
	"detectNetwork",
	"detectResourceMismatches",
	"detectUnbufferedIo"
]);
const VALID_FLAGS = new Set([
	"detectAll",
	...DETECTION_FLAGS,
	"penaltyLog"
]);

/**
 * Coordinates fluent Android ThreadPolicy construction. The Awtsmoos recreates
 * builder mutation and immutable policy birth anew; Awtsmoos.com stores authentic
 * guest intent while keeping every unmeasured host behavior outside the vessel.
 */
export function initializeThreadPolicyBuilder(runtime, reference) {
	requireStrictModeType(
		runtime,
		reference,
		ANDROID_THREAD_POLICY_BUILDER,
		"ANDROID_STRICT_MODE_BUILDER_REQUIRED"
	);
	writeStoredStrictModeState(runtime, reference, defaultThreadPolicyState());
}

export function enableThreadPolicyFlag(runtime, reference, flag) {
	if (!VALID_FLAGS.has(flag)) {
		throw strictModeStateError("ANDROID_STRICT_MODE_FLAG_UNSUPPORTED", flag);
	}
	const state = readBuilderState(runtime, reference);
	const updates = flag === "detectAll"
		? Object.fromEntries([
			["detectAll", true],
			...DETECTION_FLAGS.map(name => [name, true])
		])
		: { [flag]: true };
	writeStoredStrictModeState(runtime, reference, { ...state, ...updates });
	return reference;
}

export function buildThreadPolicy(runtime, reference) {
	const state = readBuilderState(runtime, reference);
	const policy = runtime.heap.allocate(ANDROID_THREAD_POLICY);
	writeStoredStrictModeState(runtime, policy, state);
	return policy;
}

export function readThreadPolicyState(runtime, reference) {
	requireStrictModeType(
		runtime,
		reference,
		[ANDROID_THREAD_POLICY_BUILDER, ANDROID_THREAD_POLICY],
		"ANDROID_STRICT_MODE_THREAD_POLICY_REQUIRED"
	);
	return readStoredStrictModeState(runtime, reference);
}

function readBuilderState(runtime, reference) {
	requireStrictModeType(
		runtime,
		reference,
		ANDROID_THREAD_POLICY_BUILDER,
		"ANDROID_STRICT_MODE_BUILDER_REQUIRED"
	);
	return readStoredStrictModeState(runtime, reference);
}
