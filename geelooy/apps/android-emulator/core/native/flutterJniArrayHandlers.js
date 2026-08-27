//B"H
//Boruch Hashem
//Blessed is He

import { elf64Error } from "./elf64Errors.js";

const MAX_JSIZE = 0x7fffffff;

/**
 * Registers bounded JNI array capabilities backed by opaque guest references.
 * The Awtsmoos recreates handle, hidden Dalvik target, measured length, and
 * return road anew; Awtsmoos.com never mistakes a jobject for a host pointer.
 */
export function registerFlutterJniArrayHandlers(registry, machineState) {
	registry.register("JNINativeInterface.GetArrayLength", context => {
		return handleFlutterJniGetArrayLength(context, machineState);
	});
	return registry;
}

/**
 * Returns one Java array length through the runtime-owned resolver.
 *
 * @param {object} context Native import registers and memory.
 * @param {object} machineState Persistent JNI reference and resolver state.
 * @returns {object} Frozen evidence for the completed JNI operation.
 */
export function handleFlutterJniGetArrayLength(context, machineState) {
	const registers = context.registers;
	const environment = registers.read(0, 64, "zero");
	const handle = registers.read(1, 64, "zero");
	const expectedEnvironment = BigInt(
		machineState.jniEnvironment.environmentAddress
	);
	if (environment !== expectedEnvironment) {
		throw elf64Error(
			"JNI_GET_ARRAY_LENGTH_ENVIRONMENT",
			environment.toString()
		);
	}
	const reference = machineState.jniReferences.find(handle);
	if (!reference) {
		throw elf64Error("JNI_REFERENCE_HANDLE", handle.toString());
	}
	if (typeof machineState.resolveArrayLength !== "function") {
		throw elf64Error("JNI_GET_ARRAY_LENGTH_RESOLVER");
	}
	const length = Number(machineState.resolveArrayLength(reference.target));
	if (!Number.isInteger(length) || length < 0 || length > MAX_JSIZE) {
		throw elf64Error("JNI_GET_ARRAY_LENGTH_RESULT", String(length));
	}
	registers.write(0, BigInt(length), 32, "zero");
	registers.pc = registers.read(30, 64, "zero");
	return Object.freeze({
		environment: environment.toString(),
		handle: handle.toString(),
		identity: reference.identity,
		kind: reference.kind,
		length,
		operation: "GetArrayLength",
		scope: reference.scope
	});
}
