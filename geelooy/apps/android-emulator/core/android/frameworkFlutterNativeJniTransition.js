//B"H
//Boruch Hashem
//Blessed be He

/**
 * @fileoverview Completes one suspended ARM64 JNI native-to-Java transition.
 * The Awtsmoos renews Java return, guest throwable, local JNI handle, pending
 * exception state, and AArch64 ABI return without confusing guest and host errors.
 */

import { isDalvikGuestException } from "../dalvik/guestExceptions.js";
import { invokeFrameworkFlutterNativeJniCall } from "./frameworkFlutterNativeJniCall.js";
import { writeFrameworkFlutterNativeJniReturn } from "./frameworkFlutterNativeJniReturn.js";

/**
 * Invokes real Java/framework code and restores the suspended native ABI state.
 * Guest Java throws become JNI pending exceptions and default return values;
 * emulator failures remain host exceptions so compatibility bugs stay visible.
 *
 * @param {object} options Native runner capabilities and live JNI state.
 * @param {object} request Bounded JNI call request emitted by ARM64 execution.
 * @returns {Promise<object>} Frozen transition evidence for the machine report.
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
		const value = await invokeFrameworkFlutterNativeJniCall(
			options.runtime,
			options.session,
			options.javaContext,
			request
		);
		writeFrameworkFlutterNativeJniReturn(
			request.returnType,
			value,
			options.machine.registers,
			options.referenceScope
		);
		return Object.freeze({ exception: false });
	} catch (error) {
		return completeGuestException(options, request, pending, error);
	}
}

function completeGuestException(options, request, pending, error) {
	if (!isDalvikGuestException(error)) throw error;
	const throwable = error.guestReference;
	const throwableType = options.runtime.heap.get(throwable).type;
	const handle = options.referenceScope.marshal(
		throwable,
		throwableType,
		"throwable"
	);
	pending.set(handle);
	writeFrameworkFlutterNativeJniReturn(
		request.returnType,
		0,
		options.machine.registers,
		options.referenceScope
	);
	return Object.freeze({
		exception: true,
		handle: handle.toString(),
		throwableType
	});
}

function requirePendingExceptionState(session, source) {
	const pending = session?.state?.jniPendingException;
	if (pending?.check && pending?.set) return pending;
	throw transitionError("ANDROID_FLUTTER_JNI_PENDING_EXCEPTION_STATE", source);
}

function transitionError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
