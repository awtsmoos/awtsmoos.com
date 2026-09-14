//B"H
//Boruch Hashem
//Blessed be He

import { resolveGuestTaskMethod } from "./frameworkJavaTaskResolution.js";

/**
 * Executes one JNI native-to-Java call through existing Dalvik/framework authority.
 * The Awtsmoos renews jmethodID, receiver, class initialization, and dispatch anew;
 * Awtsmoos.com returns the resolved record beside the value, never a host shortcut.
 *
 * @param {object} runtime Live Android runtime.
 * @param {object} session Persistent Flutter native session.
 * @param {object} context Current Dalvik executor context.
 * @param {object} request Bounded JNI call request emitted by native execution.
 * @returns {Promise<object>} Authentic Java value plus exact resolved method record.
 */
export async function invokeFrameworkFlutterNativeJniCall(
	runtime,
	session,
	context,
	request
) {
	if (!context?.invokeGuest || !context?.framework?.invoke) {
		throw jniCallError("ANDROID_FLUTTER_JNI_CONTEXT", request?.source || "unknown");
	}
	const method = session.state.jniMethodIds.find(BigInt(request.methodHandle));
	if (!method) {
		throw jniCallError("ANDROID_FLUTTER_JNI_METHOD", request.methodHandle);
	}
	const receiver = recoverReceiver(session, request);
	const values = request.arguments.map(argument => recoverArgument(session, argument));
	const record = resolveInvocationRecord(runtime, context, method, receiver, request.dispatch);
	if (request.dispatch === "static") {
		await context.ensureClassInitialized(record.method.classType);
	}
	const args = request.dispatch === "static" ? values : [receiver, ...values];
	const value = record.code
		? await context.invokeGuest(record, args)
		: await context.framework.invoke(record, args, request.dispatch, context);
	return Object.freeze({ record, value });
}

function resolveInvocationRecord(runtime, context, method, receiver, dispatch) {
	if (dispatch === "virtual") {
		return resolveGuestTaskMethod(
			runtime,
			receiver,
			method.name,
			method.signature
		);
	}
	const member = method.target?.method || method.target?.member || null;
	const classType = member?.classType || method.classDescriptor;
	const name = member?.name || method.name;
	const descriptor = member?.descriptor || method.signature;
	const signature = `${classType}->${name}${descriptor}`;
	const dexRecord = context.registry?.bySignature?.(signature);
	if (dexRecord) return dexRecord;
	return createFrameworkRecord(method, classType, name, descriptor, signature);
}

function createFrameworkRecord(method, classType, name, descriptor, signature) {
	return Object.freeze({
		code: null,
		encoded: Object.freeze({
			accessFlags: method.target?.implementation?.accessFlags ?? 0
		}),
		method: Object.freeze({ classType, descriptor, name }),
		model: null,
		signature
	});
}

function recoverReceiver(session, request) {
	if (request.dispatch === "static") return null;
	return recoverReference(session, request.receiverHandle, "ANDROID_FLUTTER_JNI_RECEIVER");
}

function recoverArgument(session, argument) {
	if (argument.kind === "reference") {
		if (BigInt(argument.handle) === 0n) return 0;
		return recoverReference(session, argument.handle, "ANDROID_FLUTTER_JNI_ARGUMENT");
	}
	if (argument.type === "J") return BigInt(argument.value);
	return argument.value;
}

function recoverReference(session, handle, code) {
	const reference = session.state.jniReferences.find(BigInt(handle));
	if (reference) return reference.target;
	throw jniCallError(code, handle);
}

function jniCallError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
