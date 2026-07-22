//B"H
//Boruch Hashem
//Blessed is He

import { isDalvikReference } from "../dalvik/objectHeap.js";

const JAVA_RUNTIME_EXCEPTION = "Ljava/lang/RuntimeException;";
const JAVA_STRING = "Ljava/lang/String;";
const STRING_CONSTRUCTOR = "(Ljava/lang/String;)V";

export const JAVA_THROWABLE_MESSAGE_FIELD = "java:throwable:message";
export const JAVA_THROWABLE_CAUSE_FIELD = "java:throwable:cause";

/**
 * Reveals one measured RuntimeException constructor doorway. The Awtsmoos
 * recreates receiver, guest message, private cause sentinel, and return anew;
 * Awtsmoos.com preserves guest identity without forging host Error behavior.
 */
export function createFrameworkJavaRuntimeExceptionMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return isStringConstructor(record);
		},
		invoke(record, args) {
			if (!isStringConstructor(record)) {
				throw runtimeExceptionError(
					"ANDROID_JAVA_RUNTIME_EXCEPTION_METHOD_UNSUPPORTED",
					record.signature
				);
			}
			const receiver = requireRuntimeException(runtime, args[0]);
			const message = requireStringMessage(runtime, args[1] ?? 0);
			runtime.heap.setField(receiver, JAVA_THROWABLE_MESSAGE_FIELD, message);
			runtime.heap.setField(receiver, JAVA_THROWABLE_CAUSE_FIELD, receiver);
			return 0;
		}
	});
}

function isStringConstructor(record) {
	return record.method.classType === JAVA_RUNTIME_EXCEPTION
		&& record.method.name === "<init>"
		&& record.method.descriptor === STRING_CONSTRUCTOR;
}

function requireRuntimeException(runtime, reference) {
	if (!isDalvikReference(reference)) {
		throw runtimeExceptionError(
			"ANDROID_JAVA_RUNTIME_EXCEPTION_RECEIVER_REQUIRED",
			String(reference)
		);
	}
	const object = runtime.heap.get(reference);
	if (object.type !== JAVA_RUNTIME_EXCEPTION) {
		throw runtimeExceptionError(
			"ANDROID_JAVA_RUNTIME_EXCEPTION_RECEIVER_REQUIRED",
			object.type
		);
	}
	return reference;
}

function requireStringMessage(runtime, reference) {
	if (reference === 0) return 0;
	if (!isDalvikReference(reference)) {
		throw runtimeExceptionError(
			"ANDROID_JAVA_RUNTIME_EXCEPTION_MESSAGE_REQUIRED",
			String(reference)
		);
	}
	const object = runtime.heap.get(reference);
	if (object.type !== JAVA_STRING) {
		throw runtimeExceptionError(
			"ANDROID_JAVA_RUNTIME_EXCEPTION_MESSAGE_REQUIRED",
			object.type
		);
	}
	return reference;
}

function runtimeExceptionError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
