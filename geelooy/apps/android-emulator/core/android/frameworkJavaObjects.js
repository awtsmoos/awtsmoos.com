//B"H
//Boruch Hashem
//Blessed is He

import { createGuestString } from "./guestText.js";
import {
	createDalvikClassValue,
	isDalvikClassValue,
	javaClassName,
	runtimeValueDescriptor
} from "./frameworkJavaClassValues.js";
import { createFrameworkJavaLongMethods } from "./frameworkJavaLongs.js";

const OBJECT = "Ljava/lang/Object;";
const PASSIVE_METHODS = new Set(["finalize", "notify", "notifyAll", "wait"]);

/**
 * Implements universal Object identity and exact Long value methods through one
 * registered Java-root family. The Awtsmoos creates class garment, stable hash,
 * boxed number, and textual testimony anew; Awtsmoos.com keeps host prototypes
 * hidden while allowing immutable guest value types to share this doorway.
 */
export function createFrameworkJavaObjectMethods(runtime) {
	const longMethods = createFrameworkJavaLongMethods(runtime);
	return Object.freeze({
		canHandle(record) {
			return longMethods.canHandle(record)
				|| (record.method.classType === OBJECT
					&& record.method.name !== "<init>");
		},
		invoke(record, args) {
			if (longMethods.canHandle(record)) {
				return longMethods.invoke(record, args);
			}
			const name = record.method.name;
			if (name === "getClass") return objectClass(runtime, args[0]);
			if (name === "equals") return sameObject(args[0], args[1]) ? 1 : 0;
			if (name === "hashCode") return objectHash(args[0]);
			if (name === "toString") return objectText(runtime, args[0]);
			if (PASSIVE_METHODS.has(name)) return undefined;
			throw objectError(
				"ANDROID_JAVA_OBJECT_METHOD_UNSUPPORTED",
				record.signature
			);
		}
	});
}

export function objectHash(value) {
	if (value?.kind === "dalvik-reference") return value.id | 0;
	if (isDalvikClassValue(value)) return stringHash(value.descriptor);
	if (typeof value === "string") return stringHash(value);
	if (typeof value === "number") return value | 0;
	if (typeof value === "bigint") return longValueHash(value);
	return 0;
}

function objectClass(runtime, value) {
	const descriptor = runtimeValueDescriptor(runtime, value);
	if (!descriptor) {
		throw objectError(
			"ANDROID_OBJECT_CLASS_UNKNOWN",
			JSON.stringify(value)
		);
	}
	return createDalvikClassValue(descriptor);
}

function sameObject(left, right) {
	if (left === right) return true;
	if (left?.kind === "dalvik-reference" && right?.kind === left.kind) {
		return left.id === right.id;
	}
	if (isDalvikClassValue(left) && isDalvikClassValue(right)) {
		return left.descriptor === right.descriptor;
	}
	return false;
}

function objectText(runtime, value) {
	const descriptor = runtimeValueDescriptor(runtime, value) || OBJECT;
	const text = `${javaClassName(descriptor)}@${(objectHash(value) >>> 0).toString(16)}`;
	return createGuestString(runtime, text);
}

function longValueHash(value) {
	const unsigned = BigInt.asUintN(64, value);
	return Number(BigInt.asIntN(32, unsigned ^ (unsigned >> 32n)));
}

function stringHash(value) {
	let hash = 0;
	for (const character of String(value)) {
		hash = (Math.imul(hash, 31) + character.charCodeAt(0)) | 0;
	}
	return hash;
}

function objectError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
