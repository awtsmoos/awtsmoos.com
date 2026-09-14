//B"H
//Boruch Hashem
//Blessed be He

import { createJniStringCharacters } from "./jniStringCharacters.js";
import {
	resolveFlutterJniString,
	resumeFlutterJniString
} from "./flutterJniStringRuntime.js";

/**
 * Registers JNI critical UTF-16 acquisition and release with copied guest memory.
 * JNI permits a VM-owned copy; this browser runtime uses one so critical access
 * never exposes host strings or movable Java state as a native pointer.
 */
export function registerFlutterJniStringCriticalHandlers(registry, machineState) {
	const characters = createJniStringCharacters(machineState.nativeHeap);
	registry.register("JNINativeInterface.GetStringCritical", context => {
		return getStringCritical(context, machineState, characters);
	});
	registry.register("JNINativeInterface.ReleaseStringCritical", context => {
		return releaseStringCritical(context, machineState, characters);
	});
	return registry;
}

function getStringCritical(context, machineState, characters) {
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
		operation: "GetStringCritical"
	});
}

function releaseStringCritical(context, machineState, characters) {
	const resolved = resolveFlutterJniString(context, machineState);
	const pointer = context.registers.read(2, 64, "zero");
	const released = characters.release(resolved.handle, pointer);
	resumeFlutterJniString(context.registers);
	return Object.freeze({
		handle: resolved.handle.toString(),
		identity: resolved.reference.identity,
		operation: "ReleaseStringCritical",
		pointer: released.pointer
	});
}
