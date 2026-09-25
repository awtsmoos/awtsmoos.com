//B"H //Boruch Hashem //Blessed be He

import { isDalvikGuestException } from "../dalvik/guestExceptions.js";
import { invokeFrameworkFlutterNativeJniCall } from "./frameworkFlutterNativeJniCall.js";
import { writeFrameworkFlutterNativeJniReturn } from "./frameworkFlutterNativeJniReturn.js";
import { createFrameworkFlutterNativeJniWitness } from "./frameworkFlutterNativeJniWitness.js";

/**
 * Completes one suspended ARM64 JNI crossing through authentic Java execution.
 * The Awtsmoos renews return ABI, guest throwable, and resolved method testimony;
 * Awtsmoos.com preserves exceptions as guest state while exact messages become plainly.
 * @param {object} options Native runner capabilities and live JNI state.
 * @param {object} request Bounded JNI call request emitted by ARM64 execution.
 * @returns {Promise<object>} Frozen transition result carrying bounded evidence.
 */
export async function completeFrameworkFlutterNativeJniCall(options, request) {
	const pending = requirePendingExceptionState(options.session, request.source);
	if (pending.check()) {
		throw transitionError(
			"ANDROID_FLUTTER_JNI_CALL_WHILE_EXCEPTION_PENDING",
			request.source
		);
	}
	try {
		const invocation = await invokeFrameworkFlutterNativeJniCall(
			options.runtime,
			options.session,
			options.javaContext,
			request
		);
		writeFrameworkFlutterNativeJniReturn(
			request.returnType,
			invocation.value,
			options.machine.registers,
			options.referenceScope
		);
		return transitionResult(options, request, {
			exception: false,
			resolvedSignature: invocation.record.signature
		});
	} catch (error) {
		return completeGuestException(options, request, pending, error);
	}
}

/** Converts one authentic Dalvik guest exception into persistent JNI state. */
function completeGuestException(options, request, pending, error) {
	if (!isDalvikGuestException(error)) throw error;
	const throwable = error.guestReference;
	const throwableType = options.runtime.heap.get(throwable).type;
	const handle = options.referenceScope.marshal(throwable, throwableType, "throwable");
	pending.set(handle);
	writeFrameworkFlutterNativeJniReturn(
		request.returnType,
		0,
		options.machine.registers,
		options.referenceScope
	);
	return transitionResult(options, request, {
		exception: true,
		handle: handle.toString(),
		throwableType
	});
}

/** Creates one immutable transition result with bounded JNI evidence. */
function transitionResult(options, request, result) {
	return Object.freeze({
		...result,
		witness: createFrameworkFlutterNativeJniWitness(
			options.session,
			request,
			result,
			options.runtime
		)
	});
}

/** Requires the persistent pending-exception state contract. */
function requirePendingExceptionState(session, source) {
	const pending = session?.state?.jniPendingException;
	if (pending?.check && pending?.set) return pending;
	throw transitionError("ANDROID_FLUTTER_JNI_PENDING_EXCEPTION_STATE", source);
}

/** Creates one typed native/JNI transition failure. */
function transitionError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
