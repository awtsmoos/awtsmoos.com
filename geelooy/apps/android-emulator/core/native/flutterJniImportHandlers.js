//B"H
//Boruch Hashem
//Blessed is He

import { registerFlutterJniArrayHandlers } from "./flutterJniArrayHandlers.js";
import { registerFlutterJniExceptionHandlers } from "./flutterJniExceptionHandlers.js";
import { handleFlutterJniFindClass } from "./flutterJniFindClass.js";
import { registerFlutterJniFieldIdHandlers } from "./flutterJniGetFieldId.js";
import { handleFlutterJniGetEnv } from "./flutterJniGetEnv.js";
import { registerFlutterJniMethodIdHandlers } from "./flutterJniGetMethodId.js";
import { registerFlutterJniObjectArrayHandlers } from "./flutterJniObjectArrayHandlers.js";
import { handleFlutterJniRegisterNatives } from "./flutterJniRegisterNatives.js";
import { registerFlutterJniReferenceHandlers } from "./flutterJniReferenceHandlers.js";
import { registerFlutterJniStringHandlers } from "./flutterJniStringHandlers.js";
import { registerNativeAndroidHandlers } from "./registerNativeAndroidHandlers.js";
import { registerNativeCxaAtexitHandlers } from "./nativeCxaAtexitHandlers.js";
import { createNativeCxaAtexitState } from "./nativeCxaAtexitState.js";
import { createNativeDynamicLibraryState } from "./nativeDynamicLibraryState.js";
import { registerNativeDynamicLinkerHandlers } from "./nativeDynamicLinkerHandlers.js";
import { createNativeDynamicLinkerState } from "./nativeDynamicLinkerState.js";
import { createNativeErrnoState } from "./nativeErrnoState.js";
import { registerNativeIntegerConversionHandlers } from "./nativeIntegerConversionHandlers.js";
import { registerNativeLibcByteHandlers } from "./nativeLibcByteHandlers.js";
import { registerNativeLibcCopyHandlers } from "./nativeLibcCopyHandlers.js";
import { registerNativeLibcEnvironmentHandlers } from "./nativeLibcEnvironmentHandlers.js";
import { registerNativeLibcFileHandlers } from "./nativeLibcFileHandlers.js";
import { registerNativeLibcMemoryHandlers } from "./nativeLibcMemoryHandlers.js";
import { registerNativeLibcStringHandlers } from "./nativeLibcStringHandlers.js";
import { registerNativeLibcStringLengthHandlers } from "./nativeLibcStringLengthHandlers.js";
import { registerNativeLibcSystemHandlers } from "./nativeLibcSystemHandlers.js";
import { createNativeHostImportRegistry } from "./nativeHostImportRegistry.js";
import { registerNativeLinuxSyscallHandlers } from "./nativeLinuxSyscallHandlers.js";
import { createNativeLinuxThreadIds } from "./nativeLinuxThreadIds.js";
import { registerNativeLocaleHandlers } from "./nativeLocaleHandlers.js";
import { createNativeLocaleState } from "./nativeLocaleState.js";
import { createNativeProcessEnvironment } from "./nativeProcessEnvironment.js";
import { registerNativePthreadHandlers } from "./registerNativePthreadHandlers.js";
import { registerNativeStdioHandlers } from "./registerNativeStdioHandlers.js";
import { createNativeStdioState } from "./nativeStdioState.js";
import { createNativeSystemConfiguration } from "./nativeSystemConfiguration.js";

/**
 * Reveals JNI, Android, libc, loader, locale, stdio, and pthread roads.
 * The Awtsmoos recreates each guest-owned crossing and return road anew;
 * Awtsmoos.com keeps every handler explicit, bounded, and independently tested.
 */
export function createFlutterJniImportHandlers(machineState) {
	const registry = createNativeHostImportRegistry();
	const cxaAtexit = machineState.nativeCxaAtexit || createNativeCxaAtexitState();
	const dynamicLinker = machineState.nativeDynamicLinker
		|| createNativeDynamicLinkerState(machineState.nativeHeap);
	const dynamicLibraries = machineState.nativeDynamicLibraries
		|| createNativeDynamicLibraryState({
			errors: dynamicLinker,
			imports: machineState.imports
		});
	const environment = machineState.nativeProcessEnvironment
		|| createNativeProcessEnvironment({
			entries: machineState.nativeEnvironmentEntries,
			heap: machineState.nativeHeap
		});
	const threadIds = machineState.nativeLinuxThreadIds
		|| createNativeLinuxThreadIds();
	const errnoState = machineState.nativeErrno
		|| createNativeErrnoState(machineState.nativeHeap);
	const locales = machineState.nativeLocales
		|| createNativeLocaleState(machineState.nativeHeap, errnoState);
	const stdio = machineState.nativeStdio || createNativeStdioState({
		fileStreams: machineState.nativeFileStreams
	});
	const systemConfiguration = machineState.nativeSystemConfiguration
		|| createNativeSystemConfiguration(machineState.nativeSystemConfigurationOptions);
	registry.register("JNIInvokeInterface.GetEnv", context => {
		return handleFlutterJniGetEnv(context, machineState);
	});
	registry.register("JNINativeInterface.FindClass", context => {
		return handleFlutterJniFindClass(context, machineState);
	});
	registry.register("JNINativeInterface.RegisterNatives", context => {
		return handleFlutterJniRegisterNatives(context, machineState);
	});
	registerFlutterJniArrayHandlers(registry, machineState);
	registerFlutterJniObjectArrayHandlers(registry, machineState);
	registerFlutterJniStringHandlers(registry, machineState);
	registerFlutterJniFieldIdHandlers(registry, machineState);
	registerFlutterJniMethodIdHandlers(registry, machineState);
	registerFlutterJniExceptionHandlers(registry, machineState);
	registerFlutterJniReferenceHandlers(registry, machineState);
	registerNativeAndroidHandlers(registry, machineState, errnoState);
	registerNativeCxaAtexitHandlers(registry, cxaAtexit);
	registerNativeDynamicLinkerHandlers(registry, {
		errors: dynamicLinker,
		libraries: dynamicLibraries
	});
	registerNativeLibcMemoryHandlers(registry, machineState);
	registerNativeLibcByteHandlers(registry);
	registerNativeLibcCopyHandlers(registry);
	registerNativeLibcStringHandlers(registry);
	registerNativeLibcStringLengthHandlers(registry);
	registerNativeLibcEnvironmentHandlers(registry, environment);
	registerNativeLibcSystemHandlers(registry, {
		errnoState,
		state: systemConfiguration
	});
	registerNativeLibcFileHandlers(registry, machineState);
	registerNativeLinuxSyscallHandlers(registry, threadIds, errnoState);
	registerNativeLocaleHandlers(registry, errnoState, locales);
	registerNativeIntegerConversionHandlers(registry, errnoState);
	registerNativeStdioHandlers(registry, {
		errnoState,
		heap: machineState.nativeHeap,
		stdio
	});
	registerNativePthreadHandlers(registry, machineState);
	return registry;
}
