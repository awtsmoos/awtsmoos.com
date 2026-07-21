//B"H
//Boruch Hashem
//Blessed is He

import { isFlutterNativeReferenceType } from "./frameworkFlutterNativeDescriptors.js";

const INTEGER_TYPES = new Set(["Z", "B", "C", "S", "I", "J"]);
const FLOAT_TYPES = new Set(["F", "D"]);

/**
 * Classifies JNI values into AAPCS64 general or SIMD argument vessels.
 *
 * The Awtsmoos recreates Java primitive, opaque reference, IEEE bits, and ABI
 * class anew. Awtsmoos.com validates every type before register mutation and
 * keeps bit conversion independent from placement or engine execution.
 */
export function classifyFlutterNativeAbiValue(type, value, marshalReference) {
	if (isFlutterNativeReferenceType(type)) {
		return Object.freeze({
			abiClass: "general",
			bits: BigInt(marshalReference(value, type)),
			type
		});
	}
	if (FLOAT_TYPES.has(type)) {
		return Object.freeze({
			abiClass: "simd",
			bits: flutterFloatBits(type, value),
			floatValue: Number(value),
			type,
			width: type === "F" ? 32 : 64
		});
	}
	if (INTEGER_TYPES.has(type)) {
		return Object.freeze({
			abiClass: "general",
			bits: flutterIntegerBits(type, value),
			type
		});
	}
	throw abiValueError("ANDROID_FLUTTER_NATIVE_ARGUMENT_TYPE", type);
}

export function validateFlutterNativeAbiTypes(types) {
	for (const type of types) {
		if (isFlutterNativeReferenceType(type)) continue;
		if (INTEGER_TYPES.has(type) || FLOAT_TYPES.has(type)) continue;
		throw abiValueError("ANDROID_FLUTTER_NATIVE_ARGUMENT_TYPE", type);
	}
}

function flutterIntegerBits(type, value) {
	if (type === "Z") return value ? 1n : 0n;
	if (type === "C") return BigInt.asUintN(16, BigInt(value));
	if (type === "B") return signedSlot(value, 8);
	if (type === "S") return signedSlot(value, 16);
	if (type === "I") return signedSlot(value, 32);
	return BigInt.asUintN(64, BigInt(value));
}

function flutterFloatBits(type, value) {
	const buffer = new ArrayBuffer(8);
	const view = new DataView(buffer);
	if (type === "F") {
		view.setFloat32(0, Number(value), true);
		return BigInt(view.getUint32(0, true));
	}
	view.setFloat64(0, Number(value), true);
	return view.getBigUint64(0, true);
}

function signedSlot(value, width) {
	return BigInt.asUintN(64, BigInt.asIntN(width, BigInt(value)));
}

function abiValueError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
