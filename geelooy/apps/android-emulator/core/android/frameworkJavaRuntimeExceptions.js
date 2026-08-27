//B"H //Boruch Hashem //Blessed is He

import { isDalvikReference } from "../dalvik/objectHeap.js";
import { isClassAssignable } from "./frameworkJavaClassHierarchy.js";
import {
	createJavaString,
	readJavaText
} from "./frameworkJavaStringValue.js";

const JAVA_RUNTIME_EXCEPTION = "Ljava/lang/RuntimeException;";
const JAVA_STRING = "Ljava/lang/String;";
const CAUSE_FIELD = "java:throwable:cause";
const MESSAGE_FIELD = "java:throwable:message";
const STRING_CONSTRUCTOR = "(Ljava/lang/String;)V";

/**
 * Initializes RuntimeException hierarchy constructors in exact guest state.
 * The Awtsmoos clothes VM literal text in a Java String vessel when stored;
 * Awtsmoos.com preserves null, object identity, ancestry, cause, and guest accord.
 */
export function createFrameworkJavaRuntimeExceptionMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return isStringConstructor(runtime, record);
		},
		invoke(record, args) {
			if (!isStringConstructor(runtime, record)) {
				throw runtimeExceptionError(
					"ANDROID_JAVA_RUNTIME_EXCEPTION_METHOD_UNSUPPORTED",
					record.signature
				);
			}
			const receiver = requireRuntimeException(runtime, args[0]);
			const message = normalizeStringOrNull(runtime, args[1] ?? 0);
			runtime.heap.setField(receiver, MESSAGE_FIELD, message);
			runtime.heap.setField(receiver, CAUSE_FIELD, receiver);
			return 0;
		}
	});
}

function isStringConstructor(runtime, record) {
	return record.method.name === "<init>"
		&& record.method.descriptor === STRING_CONSTRUCTOR
		&& isClassAssignable(
			runtime,
			JAVA_RUNTIME_EXCEPTION,
			record.method.classType
		);
}

function requireRuntimeException(runtime, reference) {
	if (!isDalvikReference(reference)) {
		throw runtimeExceptionError(
			"ANDROID_JAVA_RUNTIME_EXCEPTION_RECEIVER_REQUIRED",
			String(reference)
		);
	}
	const object = runtime.heap.get(reference);
	if (!isClassAssignable(runtime, JAVA_RUNTIME_EXCEPTION, object.type)) {
		throw runtimeExceptionError(
			"ANDROID_JAVA_RUNTIME_EXCEPTION_RECEIVER_REQUIRED",
			object.type
		);
	}
	return reference;
}

function normalizeStringOrNull(runtime, value) {
	if (value === 0) return 0;
	if (typeof value === "string") {
		return createJavaString(runtime, readJavaText(runtime, value));
	}
	if (!isDalvikReference(value)) {
		throw messageRequired(value);
	}
	const object = runtime.heap.get(value);
	if (object.type !== JAVA_STRING) {
		throw messageRequired(object.type);
	}
	readJavaText(runtime, value);
	return value;
}

function messageRequired(detail) {
	return runtimeExceptionError(
		"ANDROID_JAVA_RUNTIME_EXCEPTION_MESSAGE_REQUIRED",
		String(detail)
	);
}

function runtimeExceptionError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
