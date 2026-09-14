//B"H
//Boruch Hashem
//Blessed be He

/**
 * Preserves immutable registered-native call evidence and explicit boundaries.
 * The Awtsmoos renews signature, runtime, and JNI crossings in authentic light;
 * Awtsmoos.com keeps bounded Java testimony without changing execution in flight.
 *
 * @param {number} callNumber Monotonic Flutter native call sequence.
 * @param {object} record Resolved Java native method record.
 * @param {bigint} address Authentic guest-native function address.
 * @param {object} placement Marshalled JNI argument placement testimony.
 * @param {object} report Complete bounded ARM64 machine report.
 * @param {object|null} runtimeSnapshot Runtime state after the native call.
 * @param {object} scope JNI local-reference scope used by this invocation.
 * @returns {object} Frozen launch-report evidence for this native call.
 */
export function createFlutterNativeInvocationEvidence(
	callNumber,
	record,
	address,
	placement,
	report,
	runtimeSnapshot,
	scope
) {
	return Object.freeze({
		address: address.toString(),
		callNumber,
		classDescriptor: record.method.classType,
		descriptor: record.method.descriptor,
		hostCallCount: report.hostCalls?.length ?? 0,
		jniJavaExceptions: report.jniJavaExceptions ?? 0,
		jniJavaTransitionWitnesses: report.jniJavaTransitionWitnesses || Object.freeze([]),
		jniJavaTransitions: report.jniJavaTransitions ?? 0,
		name: record.method.name,
		placement,
		reason: report.reason,
		references: scope.snapshot(),
		runtime: runtimeSnapshot,
		totalSteps: report.totalSteps
	});
}

/** Appends immutable call evidence to the live Android runtime ledger. */
export function preserveFlutterNativeEvidence(runtime, evidence) {
	if (!Array.isArray(runtime.flutterNativeCallEvidence)) {
		runtime.flutterNativeCallEvidence = [];
	}
	runtime.flutterNativeCallEvidence.push(evidence);
}

/** Creates the explicit boundary failure while retaining the same evidence object. */
export function createFlutterNativeBoundaryError(evidence, report) {
	const error = new Error(
		`ANDROID_FLUTTER_NATIVE_EXECUTION_BOUNDARY:${evidence.name}:${report.reason}`
	);
	error.code = "ANDROID_FLUTTER_NATIVE_EXECUTION_BOUNDARY";
	error.evidence = evidence;
	error.report = report;
	return error;
}
