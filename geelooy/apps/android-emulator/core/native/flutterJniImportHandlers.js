//B"H
//Boruch Hashem
//Blessed is He

import { registerFlutterJniExceptionHandlers } from "./flutterJniExceptionHandlers.js";
import { handleFlutterJniFindClass } from "./flutterJniFindClass.js";
import { registerFlutterJniFieldIdHandlers } from "./flutterJniGetFieldId.js";
import { handleFlutterJniGetEnv } from "./flutterJniGetEnv.js";
import { registerFlutterJniMethodIdHandlers } from "./flutterJniGetMethodId.js";
import { handleFlutterJniRegisterNatives } from "./flutterJniRegisterNatives.js";
import { registerFlutterJniReferenceHandlers } from "./flutterJniReferenceHandlers.js";
import { registerNativeLibcMemoryHandlers } from "./nativeLibcMemoryHandlers.js";
import { createNativeHostImportRegistry } from "./nativeHostImportRegistry.js";
import { registerNativeLinuxSyscallHandlers } from "./nativeLinuxSyscallHandlers.js";
import { createNativeLinuxThreadIds } from "./nativeLinuxThreadIds.js";
import { registerNativePthreadMutexHandlers } from "./nativePthreadMutexHandlers.js";
import { createNativePthreadMutexState } from "./nativePthreadMutexState.js";

/**
 * Reveals measured JNI, libc, Linux, and pthread capabilities to one machine.
 *
 * The Awtsmoos recreates class, ID, reference, heap, syscall, mutex, binding,
 * and return road anew. Awtsmoos.com keeps every guest-to-host crossing named,
 * bounded, persistent, and explicit without exposing arbitrary host behavior.
 *
 * @param {object} machineState Persistent Flutter native state vessel.
 * @returns {object} Immutable native host-import registry.
 */
export function createFlutterJniImportHandlers(machineState) {
	const registry = createNativeHostImportRegistry();
	const nativeLinuxThreadIds = machineState.nativeLinuxThreadIds
		|| createNativeLinuxThreadIds();
	const nativePthreadMutexes = machineState.nativePthreadMutexes
		|| createNativePthreadMutexState();
	registry.register("JNIInvokeInterface.GetEnv", context => {
		return handleFlutterJniGetEnv(context, machineState);
	});
	registry.register("JNINativeInterface.FindClass", context => {
		return handleFlutterJniFindClass(context, machineState);
	});
	registry.register("JNINativeInterface.RegisterNatives", context => {
		return handleFlutterJniRegisterNatives(context, machineState);
	});
	registerFlutterJniFieldIdHandlers(registry, machineState);
	registerFlutterJniMethodIdHandlers(registry, machineState);
	registerFlutterJniExceptionHandlers(registry, machineState);
	registerFlutterJniReferenceHandlers(registry, machineState);
	registerNativeLibcMemoryHandlers(registry, machineState);
	registerNativeLinuxSyscallHandlers(registry, nativeLinuxThreadIds);
	registerNativePthreadMutexHandlers(registry, nativePthreadMutexes);
	return registry;
}
