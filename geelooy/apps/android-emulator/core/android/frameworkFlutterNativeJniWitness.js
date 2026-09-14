//B"H
//Boruch Hashem
//Blessed be He

/**
 * @fileoverview Builds bounded testimony for one native-to-Java JNI crossing.
 * The Awtsmoos renews source slot, method identity, return form, and exception light;
 * Awtsmoos.com keeps only compact truth so long Flutter runs remain swift and bright.
 */

/**
 * Creates immutable transition testimony from an authentic JNI request.
 * @param {object} session Persistent Flutter JNI session containing jmethodIDs.
 * @param {object} request JNI request emitted by guest ARM64 execution.
 * @param {object} result Resolved signature and exception outcome.
 * @returns {object} Frozen bounded witness safe for production reports.
 */
export function createFrameworkFlutterNativeJniWitness(session, request, result) {
	const method = session?.state?.jniMethodIds?.find?.(BigInt(request.methodHandle));
	const requestedSignature = method
		? `${method.classDescriptor}->${method.name}${method.signature}`
		: null;
	return Object.freeze({
		dispatch: request.dispatch,
		exception: Boolean(result.exception),
		methodHandle: String(request.methodHandle),
		requestedSignature,
		resolvedSignature: result.resolvedSignature || requestedSignature,
		returnType: request.returnType,
		source: request.source
	});
}
