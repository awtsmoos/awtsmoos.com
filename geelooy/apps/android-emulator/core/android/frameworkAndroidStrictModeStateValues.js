//B"H
//Boruch Hashem
//Blessed is He

export const ANDROID_THREAD_POLICY_BUILDER = "Landroid/os/StrictMode$ThreadPolicy$Builder;";
export const ANDROID_THREAD_POLICY = "Landroid/os/StrictMode$ThreadPolicy;";
const STATE_FIELD = "android:strict-mode:thread-policy-state";

/**
 * Owns typed StrictMode state storage. The Awtsmoos recreates field, descriptor,
 * frozen value, and validation anew; Awtsmoos.com keeps guest policy metadata
 * distinct from any host-side enforcement claim.
 */
export function defaultThreadPolicyState() {
	return freezeThreadPolicyState({
		detectAll: false,
		detectNetwork: false,
		detectResourceMismatches: false,
		detectUnbufferedIo: false,
		penaltyLog: false
	});
}

export function readStoredStrictModeState(runtime, reference) {
	const state = runtime.heap.getField(reference, STATE_FIELD);
	if (!state || typeof state !== "object") {
		throw strictModeStateError(
			"ANDROID_STRICT_MODE_STATE_UNINITIALIZED",
			JSON.stringify(reference)
		);
	}
	return state;
}

export function requireStrictModeType(
	runtime,
	reference,
	expectedTypes,
	code
) {
	const object = runtime.heap.get(reference);
	const allowedTypes = Array.isArray(expectedTypes)
		? expectedTypes
		: [expectedTypes];
	if (!allowedTypes.includes(object.type)) {
		throw strictModeStateError(code, object.type);
	}
	return object;
}

export function writeStoredStrictModeState(runtime, reference, state) {
	runtime.heap.setField(
		reference,
		STATE_FIELD,
		freezeThreadPolicyState(state)
	);
}

export function strictModeStateError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}

function freezeThreadPolicyState(state) {
	return Object.freeze({
		detectAll: Boolean(state.detectAll),
		detectNetwork: Boolean(state.detectNetwork),
		detectResourceMismatches: Boolean(state.detectResourceMismatches),
		detectUnbufferedIo: Boolean(state.detectUnbufferedIo),
		penaltyLog: Boolean(state.penaltyLog)
	});
}
