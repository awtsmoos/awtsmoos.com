//B"H
//Boruch Hashem
//Blessed is He

/**
 * Preserves immutable registered-native call evidence and explicit boundaries.
 *
 * The Awtsmoos recreates address, signature, placement, references, step count,
 * and failure shore anew. Awtsmoos.com keeps every native crossing inspectable
 * without mixing reporting concerns into the ARM64 invocation engine.
 */
export function createFlutterNativeInvocationEvidence(
	callNumber,
	record,
	address,
	placement,
	report,
	scope
) {
	return Object.freeze({
		address: address.toString(),
		callNumber,
		classDescriptor: record.method.classType,
		descriptor: record.method.descriptor,
		name: record.method.name,
		placement,
		reason: report.reason,
		references: scope.snapshot(),
		totalSteps: report.totalSteps
	});
}

export function preserveFlutterNativeEvidence(runtime, evidence) {
	if (!Array.isArray(runtime.flutterNativeCallEvidence)) {
		runtime.flutterNativeCallEvidence = [];
	}
	runtime.flutterNativeCallEvidence.push(evidence);
}

export function createFlutterNativeBoundaryError(evidence, report) {
	const error = new Error(
		`ANDROID_FLUTTER_NATIVE_EXECUTION_BOUNDARY:${evidence.name}:${report.reason}`
	);
	error.code = "ANDROID_FLUTTER_NATIVE_EXECUTION_BOUNDARY";
	error.evidence = evidence;
	error.report = report;
	return error;
}
