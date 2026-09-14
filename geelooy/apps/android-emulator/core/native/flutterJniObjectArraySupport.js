//B"H
//Boruch Hashem
//Blessed be He

import { elf64Error } from "./elf64Errors.js";

/**
 * Validates the JNIEnv pointer for one object-array operation.
 * @param {object} registers Active guest AArch64 register file.
 * @param {object} machineState Persistent JNI machine state.
 * @returns {void}
 */
export function validateJniObjectArrayEnvironment(registers, machineState) {
	const actual = registers.read(0, 64, "zero");
	const expected = BigInt(machineState.jniEnvironment.environmentAddress);
	if (actual !== expected) {
		throw elf64Error("JNI_OBJECT_ARRAY_ENVIRONMENT", actual.toString());
	}
}

/**
 * Resolves one non-null JNI reference and optionally enforces its kind.
 * @param {object} machineState Persistent JNI machine state.
 * @param {bigint} handle Opaque JNI handle.
 * @param {string} kind Optional required reference kind.
 * @returns {object} Resolved immutable JNI reference record.
 */
export function requireJniObjectArrayReference(machineState, handle, kind = "") {
	const reference = machineState.jniReferences.find(handle);
	if (!reference) {
		throw elf64Error("JNI_REFERENCE_HANDLE", handle.toString());
	}
	if (kind && reference.kind !== kind) {
		throw elf64Error(
			"JNI_OBJECT_ARRAY_REFERENCE_KIND",
			`${handle}:${reference.kind}:${kind}`
		);
	}
	return reference;
}

/**
 * Returns the explicit Android-owned array capability vessel.
 * @param {object} machineState Persistent JNI machine state.
 * @returns {object} Array creation, inspection, and mutation capabilities.
 */
export function requireJniObjectArrayCapabilities(machineState) {
	const capabilities = machineState.jniArrayCapabilities;
	if (!capabilities?.createArray || !capabilities?.writeArrayElement) {
		throw elf64Error("JNI_OBJECT_ARRAY_CAPABILITIES");
	}
	return capabilities;
}
/**
 * Interprets a JNI jsize/jint register value as a signed 32-bit Java integer.
 * @param {bigint|number} value Raw register value.
 * @returns {number} Signed 32-bit integer.
 */
export function signedJniInt32(value) {
	return Number(BigInt.asIntN(32, BigInt(value)));
}

/**
 * Returns from a JNI host handler through the guest link register.
 * @param {object} registers Active guest AArch64 register file.
 * @returns {void}
 */
export function resumeJniObjectArray(registers) {
	registers.pc = registers.read(30, 64, "zero");
}
