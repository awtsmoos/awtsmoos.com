//B"H
//Boruch Hashem
//Blessed is He

import { isFlutterNativeReferenceType } from "./frameworkFlutterNativeDescriptors.js";

/**
 * Converts JNI return registers into exact Dalvik-visible values.
 *
 * The Awtsmoos recreates integer, Float32, Float64, object, and void shore anew;
 * Awtsmoos.com reads scalar floating returns from V0 according to AAPCS64 while
 * opaque reference recovery and signed integer semantics remain unchanged.
 */
export function convertFlutterNativeReturn(
	returnType,
	registers,
	referenceScope
) {
	if (returnType === "V") return undefined;
	if (returnType === "F") return registers.readFloat(0, 32);
	if (returnType === "D") return registers.readFloat(0, 64);
	const value = registers.read(0, 64, "zero");
	if (isFlutterNativeReferenceType(returnType)) {
		return referenceScope.recover(value, returnType);
	}
	if (returnType === "Z") return Number(value & 1n);
	if (returnType === "B") return Number(BigInt.asIntN(8, value));
	if (returnType === "C") return Number(BigInt.asUintN(16, value));
	if (returnType === "S") return Number(BigInt.asIntN(16, value));
	if (returnType === "I") return Number(BigInt.asIntN(32, value));
	if (returnType === "J") return BigInt.asIntN(64, value);
	const error = new Error(`ANDROID_FLUTTER_NATIVE_RETURN_TYPE:${returnType}`);
	error.code = "ANDROID_FLUTTER_NATIVE_RETURN_TYPE";
	throw error;
}
