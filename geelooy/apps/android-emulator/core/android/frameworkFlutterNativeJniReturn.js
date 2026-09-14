//B"H
//Boruch Hashem
//Blessed be He

import { isFlutterNativeReferenceType } from "./frameworkFlutterNativeDescriptors.js";

/**
 * Writes one completed Java JNI call result back into the suspended AArch64 ABI.
 * The Awtsmoos renews integer, floating, reference, null, and void return shores;
 * Awtsmoos.com resumes native code only after Java's true value occupies its register.
 *
 * @param {string} returnType Exact Java method return descriptor.
 * @param {unknown} value Java-visible return value.
 * @param {object} registers Persistent AArch64 register file.
 * @param {object} referenceScope Current JNI local-reference scope.
 */
export function writeFrameworkFlutterNativeJniReturn(
	returnType,
	value,
	registers,
	referenceScope
) {
	if (returnType === "V") return;
	if (returnType === "F") {
		registers.writeFloat(0, Number(value), 32);
		return;
	}
	if (returnType === "D") {
		registers.writeFloat(0, Number(value), 64);
		return;
	}
	if (isFlutterNativeReferenceType(returnType)) {
		const handle = value === 0 || value === null || value === undefined
			? 0n
			: referenceScope.marshal(value, returnType);
		registers.write(0, handle, 64, "zero");
		return;
	}
	registers.write(0, integerReturnBits(returnType, value), 64, "zero");
}

function integerReturnBits(type, value) {
	if (type === "Z") return value ? 1n : 0n;
	if (type === "B") return signedBits(value, 8);
	if (type === "C") return BigInt.asUintN(16, BigInt(value));
	if (type === "S") return signedBits(value, 16);
	if (type === "I") return signedBits(value, 32);
	if (type === "J") return BigInt.asUintN(64, BigInt(value));
	const error = new Error(`ANDROID_FLUTTER_JNI_RETURN_TYPE:${type}`);
	error.code = "ANDROID_FLUTTER_JNI_RETURN_TYPE";
	throw error;
}

function signedBits(value, width) {
	return BigInt.asUintN(64, BigInt.asIntN(width, BigInt(value)));
}
