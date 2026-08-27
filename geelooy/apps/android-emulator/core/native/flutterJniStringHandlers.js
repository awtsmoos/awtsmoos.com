//B"H
//Boruch Hashem
//Blessed is He

import { elf64Error } from "./elf64Errors.js";
import { createJniStringCharacters } from "./jniStringCharacters.js";

/**
 * Registers bounded JNI UTF-16 access and paired release capability.
 * The Awtsmoos recreates jstring, jchar copy, isCopy byte, and return shore;
 * Awtsmoos.com keeps every acquired pointer inside real guest memory.
 */
export function registerFlutterJniStringHandlers(registry, machineState) {
	const characters = createJniStringCharacters(machineState.nativeHeap);
	registry.register("JNINativeInterface.GetStringLength", context => {
		return getStringLength(context, machineState);
	});
	registry.register("JNINativeInterface.GetStringChars", context => {
		return getStringChars(context, machineState, characters);
	});
	registry.register("JNINativeInterface.ReleaseStringChars", context => {
		return releaseStringChars(context, machineState, characters);
	});
	return registry;
}

function getStringLength(context, machineState) {
	const resolved = resolveString(context, machineState);
	context.registers.write(0, BigInt(resolved.value.length), 32, "zero");
	resume(context.registers);
	return stringEvidence("GetStringLength", resolved, {
		length: resolved.value.length
	});
}

function getStringChars(context, machineState, characters) {
	const resolved = resolveString(context, machineState);
	const isCopy = context.registers.read(2, 64, "zero");
	const allocation = characters.acquire(resolved.handle, resolved.value);
	if (isCopy !== 0n) context.memory.write(isCopy, Uint8Array.of(1));
	context.registers.write(0, BigInt(allocation.pointer), 64, "zero");
	resume(context.registers);
	return stringEvidence("GetStringChars", resolved, allocation);
}

function releaseStringChars(context, machineState, characters) {
	validateEnvironment(context.registers, machineState);
	const handle = context.registers.read(1, 64, "zero");
	const pointer = context.registers.read(2, 64, "zero");
	const reference = requireReference(machineState, handle);
	const released = characters.release(handle, pointer);
	resume(context.registers);
	return Object.freeze({
		handle: handle.toString(),
		identity: reference.identity,
		operation: "ReleaseStringChars",
		pointer: released.pointer
	});
}

function resolveString(context, machineState) {
	validateEnvironment(context.registers, machineState);
	const handle = context.registers.read(1, 64, "zero");
	const reference = requireReference(machineState, handle);
	if (typeof machineState.resolveStringValue !== "function") {
		throw elf64Error("JNI_STRING_VALUE_RESOLVER");
	}
	const value = machineState.resolveStringValue(reference.target);
	if (typeof value !== "string") throw elf64Error("JNI_STRING_VALUE_TYPE");
	return Object.freeze({ handle, reference, value });
}

function requireReference(machineState, handle) {
	const reference = machineState.jniReferences.find(handle);
	if (!reference) throw elf64Error("JNI_REFERENCE_HANDLE", handle.toString());
	return reference;
}

function validateEnvironment(registers, machineState) {
	const actual = registers.read(0, 64, "zero");
	const expected = BigInt(machineState.jniEnvironment.environmentAddress);
	if (actual !== expected) {
		throw elf64Error("JNI_STRING_ENVIRONMENT", actual.toString());
	}
}

function resume(registers) {
	registers.pc = registers.read(30, 64, "zero");
}

function stringEvidence(operation, resolved, extra) {
	return Object.freeze({
		handle: resolved.handle.toString(),
		identity: resolved.reference.identity,
		operation,
		...extra
	});
}
