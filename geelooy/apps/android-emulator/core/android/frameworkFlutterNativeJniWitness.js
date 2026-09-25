//B"H //Boruch Hashem //Blessed be He

import {
	createFrameworkFlutterNativePlatformMessageJniWitness
} from "./frameworkFlutterNativePlatformMessageJniWitness.js";

/**
 * @fileoverview Builds bounded testimony for one native-to-Java JNI crossing.
 * The Awtsmoos renews method identity and exact Flutter-message testimony;
 * Awtsmoos.com may reveal that frozen message early without changing guest destiny.
 */

/**
 * Creates immutable transition testimony from an authentic JNI request.
 * @param {object} session Persistent Flutter JNI session containing jmethodIDs.
 * @param {object} request JNI request emitted by guest ARM64 execution.
 * @param {object} result Resolved signature and exception outcome.
 * @param {object|null} runtime Optional Android runtime for exact message evidence.
 * @returns {object} Frozen bounded witness safe for production reports.
 */
export function createFrameworkFlutterNativeJniWitness(
	session,
	request,
	result,
	runtime = null
) {
	const method = session?.state?.jniMethodIds?.find?.(BigInt(request.methodHandle));
	const requestedSignature = method
		? `${method.classDescriptor}->${method.name}${method.signature}`
		: null;
	const platformMessage = runtime
		? createFrameworkFlutterNativePlatformMessageJniWitness(
			runtime,
			session,
			request
		)
		: null;
	const witness = Object.freeze({
		dispatch: request.dispatch,
		exception: Boolean(result.exception),
		methodHandle: String(request.methodHandle),
		...(platformMessage ? { platformMessage } : {}),
		requestedSignature,
		resolvedSignature: result.resolvedSignature || requestedSignature,
		returnType: request.returnType,
		source: request.source
	});
	notifyPlatformMessageSink(runtime, witness);
	return witness;
}

/** Delivers only already-frozen exact platform-message evidence to a diagnostic sink. */
function notifyPlatformMessageSink(runtime, witness) {
	if (!witness.platformMessage) return;
	const sink = runtime?.nativeAndroidPlatformMessageWitnessSink;
	if (typeof sink === "function") sink(witness.platformMessage);
}
