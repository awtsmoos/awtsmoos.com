//B"H
//Boruch Hashem
//Blessed be He

import {
	decodeJniModifiedUtf8CString,
	encodeJniModifiedUtf8
} from "./jniModifiedUtf8.js";
import { createJniStringUtfCharacters } from "./jniStringUtfCharacters.js";
import {
	createFlutterJniLocalString,
	resolveFlutterJniString,
	resumeFlutterJniString,
	validateFlutterJniStringEnvironment
} from "./flutterJniStringRuntime.js";

/**
 * Registers the JNI modified-UTF-8 string constructor and paired copy surface.
 * JNI MUTF-8 is preserved separately from browser UTF-8 so NUL and surrogate
 * code units retain Android/JVM semantics through native guest memory.
 */
export function registerFlutterJniUtfStringHandlers(registry, machineState) {
	let sequence = 0;
	const characters = createJniStringUtfCharacters(machineState.nativeHeap);
	registry.register("JNINativeInterface.NewStringUTF", context => {
		sequence += 1;
		return newStringUtf(context, machineState, sequence);
	});
	registry.register("JNINativeInterface.GetStringUTFLength", context => {
		return getStringUtfLength(context, machineState);
	});
	registry.register("JNINativeInterface.GetStringUTFChars", context => {
		return getStringUtfChars(context, machineState, characters);
	});
	registry.register("JNINativeInterface.ReleaseStringUTFChars", context => {
		return releaseStringUtfChars(context, machineState, characters);
	});
	return registry;
}

function newStringUtf(context, machineState, sequence) {
	validateFlutterJniStringEnvironment(context.registers, machineState);
	const address = context.registers.read(1, 64, "zero");
	const decoded = decodeJniModifiedUtf8CString(context.memory, address);
	const reference = createFlutterJniLocalString(
		machineState,
		decoded.value,
		`jni-new-string-utf:${sequence}`,
		"NewStringUTF"
	);
	context.registers.write(0, reference.handle, 64, "zero");
	resumeFlutterJniString(context.registers);
	return Object.freeze({
		byteLength: decoded.byteLength,
		handle: reference.handle.toString(),
		operation: "NewStringUTF",
		thread: reference.threadKey.toString()
	});
}
function getStringUtfLength(context, machineState) {
	const resolved = resolveFlutterJniString(context, machineState);
	const byteLength = encodeJniModifiedUtf8(resolved.value).length;
	context.registers.write(0, BigInt(byteLength), 32, "zero");
	resumeFlutterJniString(context.registers);
	return Object.freeze({
		byteLength,
		handle: resolved.handle.toString(),
		operation: "GetStringUTFLength"
	});
}

function getStringUtfChars(context, machineState, characters) {
	const resolved = resolveFlutterJniString(context, machineState);
	const isCopy = context.registers.read(2, 64, "zero");
	const allocation = characters.acquire(resolved.handle, resolved.value);
	if (isCopy !== 0n) {
		context.memory.write(isCopy, Uint8Array.of(1));
	}
	context.registers.write(0, BigInt(allocation.pointer), 64, "zero");
	resumeFlutterJniString(context.registers);
	return Object.freeze({
		...allocation,
		operation: "GetStringUTFChars"
	});
}
function releaseStringUtfChars(context, machineState, characters) {
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
		operation: "ReleaseStringUTFChars",
		pointer: released.pointer
	});
}
