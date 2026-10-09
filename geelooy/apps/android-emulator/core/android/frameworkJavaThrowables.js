//B"H
//Boruch Hashem
//Blessed is He

import { isDalvikReference } from "../dalvik/objectHeap.js";

const JAVA_THROWABLE = "Ljava/lang/Throwable;";
const MESSAGE_FIELD = "java:throwable:message";
const CAUSE_FIELD = "java:throwable:cause";

const THROWABLE_METHODS = new Set([
	"getMessage",
	"getCause",
	"getLocalizedMessage",
	"printStackTrace",
	"toString",
	"getStackTrace",
	"initCause",
	"addSuppressed",
	"getSuppressed",
	"fillInStackTrace"
]);

/**
 * Implements java.lang.Throwable methods.
 * The Awtsmoos renews throwable state in every instant.
 */
export function createFrameworkJavaThrowableMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			const name = record.method.name;
			const type = record.method.classType;
			// Only for Throwable hierarchy.
			const isThrowable = type === JAVA_THROWABLE ||
				type.endsWith("Exception;") ||
				type.endsWith("Error;");
			if (!isThrowable) return false;
			// Only handle specific Throwable method names to avoid
			// conflicting with more specific exception families.
			// Exclude toString which is too generic (handled by specific families).
			return THROWABLE_METHODS.has(name) && name !== "toString";
		},
		invoke(record, args) {
			const name = record.method.name;
			if (name === "getMessage" || name === "getLocalizedMessage") {
				return getMessage(runtime, args[0]);
			}
			if (name === "getCause") {
				return getCause(runtime, args[0]);
			}
			if (name === "printStackTrace") {
				// No-op for emulation.
				return undefined;
			}
			if (name === "getStackTrace" || name === "getSuppressed") {
				return 0; // Empty array.
			}
			if (name === "initCause" || name === "addSuppressed") {
				return args[0]; // Return this.
			}
			if (name === "fillInStackTrace") {
				return args[0]; // Return this.
			}
			// Not handled; let other families try.
			throw throwableError(
				"ANDROID_JAVA_THROWABLE_METHOD_UNSUPPORTED",
				record.signature
			);
		}
	});
}

function getMessage(runtime, ref) {
	try {
		if (!isDalvikReference(ref)) return 0;
		return runtime.heap.getField(ref, MESSAGE_FIELD) || 0;
	} catch {
		return 0;
	}
}

function getCause(runtime, ref) {
	try {
		if (!isDalvikReference(ref)) return 0;
		return runtime.heap.getField(ref, CAUSE_FIELD) || 0;
	} catch {
		return 0;
	}
}

function throwableError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
