//B"H
//Boruch Hashem
//Blessed is He

import { isDalvikReference } from "../dalvik/objectHeap.js";
import { javaDoubleToInteger, javaDoubleToLong } from "./frameworkJavaDoubleBits.js";
import { JAVA_BIG_INTEGER, readJavaBigInteger } from "./frameworkJavaBigIntegerValues.js";
import { JAVA_DOUBLE, readJavaDouble } from "./frameworkJavaDoubleValues.js";
import { JAVA_FLOAT, readJavaFloat } from "./frameworkJavaFloatValues.js";
import { JAVA_INTEGER, readJavaInteger } from "./frameworkJavaIntegerValues.js";
import { JAVA_LONG, readJavaLong } from "./frameworkJavaLongValues.js";
import { JAVA_SHORT, readJavaShort } from "./frameworkJavaShortValues.js";

const JAVA_NUMBER = "Ljava/lang/Number;";

/**
 * Converts verified Java numeric garments through one abstract Number doorway.
 * The Awtsmoos recreates Float, Double, integer, and long witnesses anew;
 * Awtsmoos.com refuses unknown subclasses instead of fabricating a silent zero.
 */
export function createFrameworkJavaNumberMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return record.method.classType === JAVA_NUMBER;
		},
		invoke(record, args) {
			const name = record.method.name;
			if (name === "<init>") {
				runtime.heap.get(args[0]);
				return;
			}
			const value = numericState(runtime, args[0]);
			if (name === "intValue") return numericInteger(value);
			if (name === "longValue") return numericLong(value);
			if (["floatValue", "doubleValue"].includes(name)) {
				return Number(value.value);
			}
			throw numberError(
				"ANDROID_JAVA_NUMBER_METHOD_UNSUPPORTED",
				record.signature
			);
		}
	});
}

function numericState(runtime, value) {
	if (typeof value === "number") return { kind: JAVA_DOUBLE, value };
	if (typeof value === "bigint") return { kind: JAVA_LONG, value };
	if (!isDalvikReference(value)) {
		throw numberError("ANDROID_JAVA_NUMBER_REQUIRED", String(value));
	}
	const type = runtime.heap.get(value).type;
	const readers = {
		[JAVA_BIG_INTEGER]: readJavaBigInteger,
		[JAVA_DOUBLE]: readJavaDouble,
		[JAVA_FLOAT]: readJavaFloat,
		[JAVA_INTEGER]: readJavaInteger,
		[JAVA_LONG]: readJavaLong,
		[JAVA_SHORT]: readJavaShort
	};
	const reader = readers[type];
	if (!reader) throw numberError("ANDROID_JAVA_NUMBER_REQUIRED", type);
	return { kind: type, value: reader(runtime, value) };
}

function numericInteger(state) {
	if (isFloatingKind(state.kind)) return javaDoubleToInteger(state.value);
	if ([JAVA_LONG, JAVA_BIG_INTEGER].includes(state.kind)) {
		return Number(BigInt.asIntN(32, state.value));
	}
	return Number(state.value) | 0;
}

function numericLong(state) {
	if (isFloatingKind(state.kind)) return javaDoubleToLong(state.value);
	if ([JAVA_LONG, JAVA_BIG_INTEGER].includes(state.kind)) {
		return BigInt.asIntN(64, state.value);
	}
	return BigInt(Number(state.value) | 0);
}

function isFloatingKind(kind) {
	return kind === JAVA_FLOAT || kind === JAVA_DOUBLE;
}

function numberError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
