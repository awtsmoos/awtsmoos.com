//B"H
//Boruch Hashem
//Blessed is He

import { createGuestString, readGuestText } from "./guestText.js";

const JAVA_BYTE = "Ljava/lang/Byte;";
const JAVA_SHORT = "Ljava/lang/Short;";
const JAVA_INTEGER = "Ljava/lang/Integer;";
const JAVA_CHARACTER = "Ljava/lang/Character;";
const JAVA_BOOLEAN = "Ljava/lang/Boolean;";

const BYTE_FIELD = "java:byte:value";
const SHORT_FIELD = "java:short:value";
const INT_FIELD = "java:int:value";
const CHAR_FIELD = "java:char:value";
const BOOLEAN_FIELD = "java:boolean:value";

/**
 * Implements java.lang.Byte, Short, Integer, Character, Boolean.
 * The Awtsmoos renews primitive wrapper identity in every instant;
 * Awtsmoos.com preserves exact Java parsing and boxing semantics.
 */
export function createFrameworkJavaPrimitiveMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			const t = record.method.classType;
			return t === JAVA_BYTE || t === JAVA_SHORT || t === JAVA_INTEGER ||
				t === JAVA_CHARACTER || t === JAVA_BOOLEAN;
		},
		invoke(record, args) {
			const type = record.method.classType;
			const name = record.method.name;
			if (type === JAVA_BYTE) return invokeByte(runtime, name, record, args);
			if (type === JAVA_SHORT) return invokeShort(runtime, name, record, args);
			if (type === JAVA_INTEGER) return invokeInteger(runtime, name, record, args);
			if (type === JAVA_CHARACTER) return invokeCharacter(runtime, name, record, args);
			if (type === JAVA_BOOLEAN) return invokeBoolean(runtime, name, record, args);
			throw primitiveError("ANDROID_JAVA_PRIMITIVE_UNSUPPORTED", record.signature);
		}
	});
}

function invokeByte(runtime, name, record, args) {
	if (name === "parseByte") {
		const s = readGuestText(runtime, args[0]);
		const radix = args.length > 1 ? Number(args[1]) : 10;
		const v = parseInt(s, radix);
		if (isNaN(v) || v < -128 || v > 127) throw primitiveError("ANDROID_JAVA_NUMBER_FORMAT", s);
		return v;
	}
	if (name === "valueOf") return boxByte(runtime, parseByteValue(runtime, args));
	if (name === "<init>") return initPrimitive(runtime, args[0], BYTE_FIELD, parseByteValue(runtime, args));
	if (name === "byteValue") return readPrimitive(runtime, args[0], BYTE_FIELD);
	if (name === "hashCode") return readPrimitive(runtime, args[0], BYTE_FIELD);
	if (name === "toString") return createGuestString(runtime, String(readPrimitive(runtime, args[0], BYTE_FIELD)));
	throw primitiveError("ANDROID_JAVA_BYTE_METHOD_UNSUPPORTED", record.signature);
}

function invokeShort(runtime, name, record, args) {
	if (name === "parseShort") {
		const s = readGuestText(runtime, args[0]);
		const radix = args.length > 1 ? Number(args[1]) : 10;
		const v = parseInt(s, radix);
		if (isNaN(v) || v < -32768 || v > 32767) throw primitiveError("ANDROID_JAVA_NUMBER_FORMAT", s);
		return v;
	}
	if (name === "valueOf") return boxShort(runtime, parseShortValue(runtime, args));
	if (name === "<init>") return initPrimitive(runtime, args[0], SHORT_FIELD, parseShortValue(runtime, args));
	if (name === "shortValue") return readPrimitive(runtime, args[0], SHORT_FIELD);
	if (name === "hashCode") return readPrimitive(runtime, args[0], SHORT_FIELD);
	if (name === "toString") return createGuestString(runtime, String(readPrimitive(runtime, args[0], SHORT_FIELD)));
	throw primitiveError("ANDROID_JAVA_SHORT_METHOD_UNSUPPORTED", record.signature);
}

function invokeInteger(runtime, name, record, args) {
	if (name === "parseInt") {
		const s = readGuestText(runtime, args[0]);
		const radix = args.length > 1 ? Number(args[1]) : 10;
		const v = parseInt(s, radix);
		if (isNaN(v)) throw primitiveError("ANDROID_JAVA_NUMBER_FORMAT", s);
		return v | 0;
	}
	if (name === "valueOf") return boxInt(runtime, parseIntValue(runtime, args));
	if (name === "<init>") return initPrimitive(runtime, args[0], INT_FIELD, parseIntValue(runtime, args));
	if (name === "intValue") return readPrimitive(runtime, args[0], INT_FIELD);
	if (name === "hashCode") return readPrimitive(runtime, args[0], INT_FIELD);
	if (name === "toString") return createGuestString(runtime, String(readPrimitive(runtime, args[0], INT_FIELD)));
	if (name === "numberOfLeadingZeros") return Math.clz32(Number(args[0]));
	if (name === "numberOfTrailingZeros") {
		let v = Number(args[0]) | 0;
		if (v === 0) return 32;
		let c = 0;
		while ((v & 1) === 0) { v >>>= 1; c++; }
		return c;
	}
	if (name === "bitCount") {
		let v = Number(args[0]) | 0;
		v = v - ((v >>> 1) & 0x55555555);
		v = (v & 0x33333333) + ((v >>> 2) & 0x33333333);
		return ((((v + (v >>> 4)) & 0x0F0F0F0F) * 0x01010101) >>> 24) | 0;
	}
	if (name === "highestOneBit") {
		let v = Number(args[0]) | 0;
		v |= v >>> 1; v |= v >>> 2; v |= v >>> 4; v |= v >>> 8; v |= v >>> 16;
		return (v - (v >>> 1)) | 0;
	}
	if (name === "lowestOneBit") { const v = Number(args[0]) | 0; return (v & -v) | 0; }
	if (name === "reverse") {
		let v = Number(args[0]) | 0;
		v = ((v & 0x55555555) << 1) | ((v >>> 1) & 0x55555555);
		v = ((v & 0x33333333) << 2) | ((v >>> 2) & 0x33333333);
		v = ((v & 0x0F0F0F0F) << 4) | ((v >>> 4) & 0x0F0F0F0F);
		return ((v << 24) | ((v & 0xFF00) << 8) | ((v >>> 8) & 0xFF00) | (v >>> 24)) | 0;
	}
	throw primitiveError("ANDROID_JAVA_INTEGER_METHOD_UNSUPPORTED", record.signature);
}

function invokeCharacter(runtime, name, record, args) {
	if (name === "<init>") return initPrimitive(runtime, args[0], CHAR_FIELD, Number(args[1]));
	if (name === "charValue") return readPrimitive(runtime, args[0], CHAR_FIELD);
	if (name === "toString") {
		const c = readPrimitive(runtime, args[0], CHAR_FIELD);
		return createGuestString(runtime, String.fromCharCode(c));
	}
	throw primitiveError("ANDROID_JAVA_CHARACTER_METHOD_UNSUPPORTED", record.signature);
}

function invokeBoolean(runtime, name, record, args) {
	if (name === "parseBoolean") {
		const s = readGuestText(runtime, args[0]);
		return s.toLowerCase() === "true" ? 1 : 0;
	}
	if (name === "valueOf") {
		const v = typeof args[0] === "string" ? args[0].toLowerCase() === "true" : Boolean(args[0]);
		return boxBoolean(runtime, v ? 1 : 0);
	}
	if (name === "<init>") return initPrimitive(runtime, args[0], BOOLEAN_FIELD, Number(args[1]) ? 1 : 0);
	if (name === "booleanValue") return readPrimitive(runtime, args[0], BOOLEAN_FIELD);
	if (name === "hashCode") return readPrimitive(runtime, args[0], BOOLEAN_FIELD) ? 1231 : 1237;
	if (name === "toString") return createGuestString(runtime, readPrimitive(runtime, args[0], BOOLEAN_FIELD) ? "true" : "false");
	if (name === "equals") return readPrimitive(runtime, args[0], BOOLEAN_FIELD) === readPrimitive(runtime, args[1], BOOLEAN_FIELD) ? 1 : 0;
	throw primitiveError("ANDROID_JAVA_BOOLEAN_METHOD_UNSUPPORTED", record.signature);
}

function parseByteValue(runtime, args) {
	const v = typeof args[0] === "string" ? parseInt(args[0], 10) : Number(args[0]);
	if (isNaN(v)) throw primitiveError("ANDROID_JAVA_NUMBER_FORMAT", String(args[0]));
	return Math.max(-128, Math.min(127, v | 0));
}

function parseShortValue(runtime, args) {
	const v = typeof args[0] === "string" ? parseInt(args[0], 10) : Number(args[0]);
	if (isNaN(v)) throw primitiveError("ANDROID_JAVA_NUMBER_FORMAT", String(args[0]));
	return Math.max(-32768, Math.min(32767, v | 0));
}

function parseIntValue(runtime, args) {
	if (typeof args[0] === "string") {
		const v = parseInt(readGuestText(runtime, args[0]), 10);
		if (isNaN(v)) throw primitiveError("ANDROID_JAVA_NUMBER_FORMAT", String(args[0]));
		return v | 0;
	}
	return Number(args[0]) | 0;
}

function initPrimitive(runtime, ref, field, value) {
	runtime.heap.setField(ref, field, value);
	return undefined;
}

function readPrimitive(runtime, ref, field) {
	return Number(runtime.heap.getField(ref, field)) || 0;
}

function boxByte(runtime, value) {
	return runtime.heap.allocate(JAVA_BYTE, { [BYTE_FIELD]: value });
}

function boxShort(runtime, value) {
	return runtime.heap.allocate(JAVA_SHORT, { [SHORT_FIELD]: value });
}

function boxInt(runtime, value) {
	return runtime.heap.allocate(JAVA_INTEGER, { [INT_FIELD]: value });
}

function boxBoolean(runtime, value) {
	return runtime.heap.allocate(JAVA_BOOLEAN, { [BOOLEAN_FIELD]: value });
}

function primitiveError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
