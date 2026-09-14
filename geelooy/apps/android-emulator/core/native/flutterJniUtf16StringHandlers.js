//B"H
//Boruch Hashem
//Blessed be He

import { createJniStringCharacters } from "./jniStringCharacters.js";
import {
	resolveFlutterJniString,
	resumeFlutterJniString,
	validateFlutterJniStringEnvironment
} from "./flutterJniStringRuntime.js";

/**
 * Registers JNI UTF-16 length, copy, and release operations for existing jstrings.
 * Copies live in guest-native heap memory and remain paired to their owning handle.
 */
export function registerFlutterJniUtf16StringHandlers(registry, machineState) {
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
	const resolved = resolveFlutterJniString(context, machineState);
	context.registers.write(0, BigInt(resolved.value.length), 32, "zero");
	resumeFlutterJniString(context.registers);
	return stringEvidence("GetStringLength", resolved, {
		length: resolved.value.length
	});
}

function getStringChars(context, machineState, characters) {
	const resolved = resolveFlutterJniString(context, machineState);
	const isCopy = context.registers.read(2, 64, "zero");
	const allocation = characters.acquire(resolved.handle, resolved.value);
	if (isCopy !== 0n) {
		context.memory.write(isCopy, Uint8Array.of(1));
	}
	context.registers.write(0, BigInt(allocation.pointer), 64, "zero");
	resumeFlutterJniString(context.registers);
	return stringEvidence("GetStringChars", resolved, allocation);
}

function releaseStringChars(context, machineState, characters) {
	validateFlutterJniStringEnvironment(context.registers, machineState);
	const handle = context.registers.read(1, 64, "zero");
	const pointer = context.registers.read(2, 64, "zero");
	const reference = machineState.jniReferences.find(handle);
	if (!reference) {
		throw new Error(`JNI_REFERENCE_HANDLE:${handle}`);
	}
	const released = characters.release(handle, pointer);
	resumeFlutterJniString(context.registers);
	return Object.freeze({
		handle: handle.toString(),
		identity: reference.identity,
		operation: "ReleaseStringChars",
		pointer: released.pointer
	});
}

function stringEvidence(operation, resolved, extra) {
	return Object.freeze({
		handle: resolved.handle.toString(),
		identity: resolved.reference.identity,
		operation,
		...extra
	});
}
