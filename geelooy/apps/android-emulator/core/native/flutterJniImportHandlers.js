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
import { registerNativeLibcByteHandlers } from "./nativeLibcByteHandlers.js";
import { registerNativeLibcCopyHandlers } from "./nativeLibcCopyHandlers.js";
import { registerNativeLibcEnvironmentHandlers } from "./nativeLibcEnvironmentHandlers.js";
import { registerNativeLibcMemoryHandlers } from "./nativeLibcMemoryHandlers.js";
import { registerNativeLibcStringHandlers } from "./nativeLibcStringHandlers.js";
import { registerNativeLibcStringLengthHandlers } from "./nativeLibcStringLengthHandlers.js";
import { createNativeHostImportRegistry } from "./nativeHostImportRegistry.js";
import { registerNativeLinuxSyscallHandlers } from "./nativeLinuxSyscallHandlers.js";
import { createNativeLinuxThreadIds } from "./nativeLinuxThreadIds.js";
import { createNativeProcessEnvironment } from "./nativeProcessEnvironment.js";
import { registerNativePthreadMutexHandlers } from "./nativePthreadMutexHandlers.js";
import { createNativePthreadMutexState } from "./nativePthreadMutexState.js";

/**
 * Reveals measured JNI, libc, Linux, and pthread capabilities to one machine.
 * The Awtsmoos recreates heap, copy, strings, environment, syscall, mutex, and
 * return road anew. Awtsmoos.com keeps each crossing bounded and guest-owned.
 */
export function createFlutterJniImportHandlers(machineState) {
	const registry = createNativeHostImportRegistry();
	const environment = machineState.nativeProcessEnvironment
		|| createNativeProcessEnvironment({
			entries: machineState.nativeEnvironmentEntries,
			heap: machineState.nativeHeap
		});
	const threadIds = machineState.nativeLinuxThreadIds
		|| createNativeLinuxThreadIds();
	const mutexes = machineState.nativePthreadMutexes
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
	registerNativeLibcByteHandlers(registry);
	registerNativeLibcCopyHandlers(registry);
	registerNativeLibcStringHandlers(registry);
	registerNativeLibcStringLengthHandlers(registry);
	registerNativeLibcEnvironmentHandlers(registry, environment);
	registerNativeLinuxSyscallHandlers(registry, threadIds);
	registerNativePthreadMutexHandlers(registry, mutexes);
	return registry;
}
