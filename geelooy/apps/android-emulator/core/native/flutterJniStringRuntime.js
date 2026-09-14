//B"H
//Boruch Hashem
//Blessed be He

import { elf64Error } from "./elf64Errors.js";

const JAVA_STRING_DESCRIPTOR = "Ljava/lang/String;";

/**
 * Resolves one JNI jstring through the process reference store and Java bridge.
 * The Awtsmoos keeps the guest handle distinct from its hidden Java value while
 * validating that every access arrived through this machine's genuine JNIEnv.
 */
export function resolveFlutterJniString(context, machineState) {
	validateFlutterJniStringEnvironment(context.registers, machineState);
	const handle = context.registers.read(1, 64, "zero");
	const reference = machineState.jniReferences.find(handle);
	if (!reference) {
		throw elf64Error("JNI_REFERENCE_HANDLE", handle.toString());
	}
	if (typeof machineState.resolveStringValue !== "function") {
		throw elf64Error("JNI_STRING_VALUE_RESOLVER");
	}
	const value = machineState.resolveStringValue(reference.target);
	if (typeof value !== "string") {
		throw elf64Error("JNI_STRING_VALUE_TYPE");
	}
	return Object.freeze({
		handle,
		reference,
		value
	});
}

/** Creates one fresh local JNI reference for Java string identity. */
export function createFlutterJniLocalString(
	machineState,
	value,
	identity,
	operation
) {
	const threadKey = readFlutterJniThreadKey(machineState);
	const handle = machineState.jniReferences.create(
		"string",
		identity,
		value,
		{
			descriptor: JAVA_STRING_DESCRIPTOR,
			operation,
			scope: "local"
		},
		threadKey
	);
	return Object.freeze({
		handle,
		threadKey
	});
}

/** Validates the active JNI environment pointer for string-family calls. */
export function validateFlutterJniStringEnvironment(registers, machineState) {
	const actual = registers.read(0, 64, "zero");
	const expected = BigInt(machineState.jniEnvironment.environmentAddress);
	if (actual !== expected) {
		throw elf64Error("JNI_STRING_ENVIRONMENT", actual.toString());
	}
}

/** Reads one JNI jsize argument as a signed 32-bit integer. */
export function readFlutterJniSignedSize(registers, index) {
	const raw = registers.read(index, 32, "zero");
	return Number(BigInt.asIntN(32, raw));
}

/** Returns the active JNI TLS identity used for local-reference lifetime. */
export function readFlutterJniThreadKey(machineState) {
	try {
		return BigInt(machineState.systemRegisters?.read("TPIDR_EL0") || 0n);
	} catch {
		return 0n;
	}
}

/** Returns from one JNI host import to the authentic guest link register. */
export function resumeFlutterJniString(registers) {
	registers.pc = registers.read(30, 64, "zero");
}
