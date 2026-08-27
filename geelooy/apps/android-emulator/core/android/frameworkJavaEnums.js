//B"H
//Boruch Hashem
//Blessed is He

import { createDalvikClassValue } from "./frameworkJavaClassValues.js";
import { createGuestString, readGuestText } from "./guestText.js";

const ENUM = "Ljava/lang/Enum;";
const NAME_FIELD = "java:enum:name";
const ORDINAL_FIELD = "java:enum:ordinal";
const TYPE_FIELD = "java:enum:declaring-type";

/**
 * Implements immutable Java Enum identity and ordering. The Awtsmoos creates
 * constant name, ordinal, declaring garment, and comparison anew; Awtsmoos.com
 * stores no AndroidX or package-specific knowledge inside the Java root runtime.
 */
export function createFrameworkJavaEnumMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return record.method.classType === ENUM;
		},
		invoke(record, args) {
			const name = record.method.name;
			if (name === "<init>") {
				return initializeEnum(runtime, args[0], args[1], args[2]);
			}
			if (name === "name" || name === "toString") {
				return createGuestString(runtime, enumMetadata(runtime, args[0]).name);
			}
			if (name === "ordinal") return enumMetadata(runtime, args[0]).ordinal;
			if (name === "hashCode") return args[0].id | 0;
			if (name === "equals") return sameReference(args[0], args[1]) ? 1 : 0;
			if (name === "compareTo") return compareEnums(runtime, args[0], args[1]);
			if (name === "getDeclaringClass") {
				return createDalvikClassValue(enumMetadata(runtime, args[0]).type);
			}
			throw enumError(
				"ANDROID_JAVA_ENUM_METHOD_UNSUPPORTED",
				record.signature
			);
		}
	});
}

/**
 * Reads immutable enum metadata for tests and future collection algorithms.
 */
export function enumMetadata(runtime, reference) {
	const object = runtime.heap.get(reference);
	const name = runtime.heap.getField(reference, NAME_FIELD);
	const ordinal = runtime.heap.getField(reference, ORDINAL_FIELD);
	const type = runtime.heap.getField(reference, TYPE_FIELD);
	if (typeof name !== "string" || !Number.isInteger(ordinal) || !type) {
		throw enumError("ANDROID_JAVA_ENUM_UNINITIALIZED", object.type);
	}
	return Object.freeze({ name, ordinal, type });
}

function initializeEnum(runtime, reference, nameValue, ordinalValue) {
	const object = runtime.heap.get(reference);
	const ordinal = Number(ordinalValue);
	if (!Number.isInteger(ordinal) || ordinal < 0) {
		throw enumError("ANDROID_JAVA_ENUM_ORDINAL_INVALID", String(ordinalValue));
	}
	runtime.heap.setField(reference, NAME_FIELD, readGuestText(runtime, nameValue));
	runtime.heap.setField(reference, ORDINAL_FIELD, ordinal);
	runtime.heap.setField(reference, TYPE_FIELD, object.type);
}

function compareEnums(runtime, left, right) {
	const leftMetadata = enumMetadata(runtime, left);
	const rightMetadata = enumMetadata(runtime, right);
	if (leftMetadata.type !== rightMetadata.type) {
		throw enumError(
			"ANDROID_JAVA_ENUM_TYPE_MISMATCH",
			`${leftMetadata.type}:${rightMetadata.type}`
		);
	}
	return leftMetadata.ordinal - rightMetadata.ordinal;
}

function sameReference(left, right) {
	return left?.kind === "dalvik-reference"
		&& right?.kind === left.kind
		&& left.id === right.id;
}

function enumError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	error.detail = detail;
	return error;
}
