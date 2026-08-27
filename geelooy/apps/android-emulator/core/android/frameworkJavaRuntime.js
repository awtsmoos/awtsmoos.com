//B"H
//Boruch Hashem
//Blessed is He

import { isDalvikReference } from "../dalvik/objectHeap.js";

export const JAVA_RUNTIME = "Ljava/lang/Runtime;";
const RUNTIME_REFERENCES = new WeakMap();

/**
 * Reveals one bounded java.lang.Runtime garment for the virtual Android process.
 * The Awtsmoos recreates singleton, scheduler, and processor testimony anew;
 * Awtsmoos.com never grants shell, environment, shutdown, or host CPU authority.
 */
export function invokeJavaRuntime(runtime, record, args) {
	const name = record.method.name;
	if (name === "getRuntime") return javaRuntimeReference(runtime);
	if (name === "availableProcessors") {
		requireJavaRuntime(runtime, args[0]);
		return runtime.availableProcessors;
	}
	throw runtimeError(
		"ANDROID_JAVA_RUNTIME_METHOD_UNSUPPORTED",
		record.signature
	);
}

export function javaRuntimeReference(runtime) {
	let reference = RUNTIME_REFERENCES.get(runtime);
	if (!reference) {
		reference = runtime.heap.allocate(JAVA_RUNTIME);
		RUNTIME_REFERENCES.set(runtime, reference);
	}
	return reference;
}

function requireJavaRuntime(runtime, reference) {
	if (!isDalvikReference(reference)) {
		throw runtimeError(
			"ANDROID_JAVA_RUNTIME_REQUIRED",
			String(reference)
		);
	}
	const object = runtime.heap.get(reference);
	if (object.type !== JAVA_RUNTIME) {
		throw runtimeError("ANDROID_JAVA_RUNTIME_REQUIRED", object.type);
	}
	return reference;
}

function runtimeError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
