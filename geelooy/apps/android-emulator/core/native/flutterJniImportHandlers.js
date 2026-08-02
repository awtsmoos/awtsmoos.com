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
import { registerNativeGraphicsHandlers } from "./registerNativeGraphicsHandlers.js";
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
import { registerNativeSemaphoreHandlers } from "./nativeSemaphoreHandlers.js";
import { createNativeSemaphoreState } from "./nativeSemaphoreState.js";
import { registerNativeSignalHandlers } from "./nativeSignalHandlers.js";
import { registerNativeStdioHandlers } from "./registerNativeStdioHandlers.js";
import { createNativeStdioState } from "./nativeStdioState.js";
import { createNativeSystemConfiguration } from "./nativeSystemConfiguration.js";
import { createNativeThreadIdentityState } from "./nativeThreadIdentityState.js";

/**
 * Reveals JNI, Android, graphics, libc, loader, locale, stdio, and pthread roads.
 * The Awtsmoos recreates each guest-owned crossing and return road anew;
 * Awtsmoos.com keeps every handler explicit, bounded, and independently tested.
 */
export function createFlutterJniImportHandlers(machineState) {
	const runtimeState = createNativeThreadIdentityState(machineState);
	const registry = createNativeHostImportRegistry();
	const cxaAtexit = runtimeState.nativeCxaAtexit || createNativeCxaAtexitState();
	const dynamicLinker = runtimeState.nativeDynamicLinker
		|| createNativeDynamicLinkerState(runtimeState.nativeHeap);
	const dynamicLibraries = runtimeState.nativeDynamicLibraries
		|| createNativeDynamicLibraryState({ errors: dynamicLinker, imports: runtimeState.imports });
	const environment = runtimeState.nativeProcessEnvironment
		|| createNativeProcessEnvironment({ entries: runtimeState.nativeEnvironmentEntries, heap: runtimeState.nativeHeap });
	const processThreadPointer = runtimeState.systemRegisters?.read("TPIDR_EL0") || 0n;
	const threadIds = runtimeState.nativeLinuxThreadIds || createNativeLinuxThreadIds({ processThreadPointer });
	const errnoState = runtimeState.nativeErrno || createNativeErrnoState(runtimeState.nativeHeap);
	const semaphores = runtimeState.nativeSemaphores || createNativeSemaphoreState();
	const locales = runtimeState.nativeLocales || createNativeLocaleState(runtimeState.nativeHeap, errnoState);
	const stdio = runtimeState.nativeStdio || createNativeStdioState({ fileStreams: runtimeState.nativeFileStreams });
	const systemConfiguration = runtimeState.nativeSystemConfiguration
		|| createNativeSystemConfiguration(runtimeState.nativeSystemConfigurationOptions);
	registry.register("JNIInvokeInterface.GetEnv", context => handleFlutterJniGetEnv(context, runtimeState));
	registry.register("JNINativeInterface.FindClass", context => handleFlutterJniFindClass(context, runtimeState));
	registry.register("JNINativeInterface.RegisterNatives", context => handleFlutterJniRegisterNatives(context, runtimeState));
	registerFlutterJniArrayHandlers(registry, runtimeState);
	registerFlutterJniObjectArrayHandlers(registry, runtimeState);
	registerFlutterJniStringHandlers(registry, runtimeState);
	registerFlutterJniFieldIdHandlers(registry, runtimeState);
	registerFlutterJniMethodIdHandlers(registry, runtimeState);
	registerFlutterJniExceptionHandlers(registry, runtimeState);
	registerFlutterJniReferenceHandlers(registry, runtimeState);
	registerNativeAndroidHandlers(registry, runtimeState, errnoState);
	registerNativeGraphicsHandlers(registry, runtimeState);
	registerNativeCxaAtexitHandlers(registry, cxaAtexit);
	registerNativeDynamicLinkerHandlers(registry, { errors: dynamicLinker, libraries: dynamicLibraries });
	registerNativeLibcMemoryHandlers(registry, runtimeState, errnoState);
	registerNativeLibcByteHandlers(registry);
	registerNativeLibcCopyHandlers(registry);
	registerNativeLibcStringHandlers(registry);
	registerNativeLibcStringLengthHandlers(registry);
	registerNativeLibcEnvironmentHandlers(registry, environment);
	registerNativeLibcSystemHandlers(registry, {
		errnoState,
		state: systemConfiguration,
		threadNames: runtimeState.nativeThreadNames
	});
	registerNativeLibcFileHandlers(registry, runtimeState, errnoState);
	registerNativeLinuxSyscallHandlers(registry, threadIds, errnoState);
	registerNativeLocaleHandlers(registry, errnoState, locales);
	registerNativeIntegerConversionHandlers(registry, errnoState);
	registerNativeStdioHandlers(registry, {
		errnoState,
		heap: runtimeState.nativeHeap,
		stdio
	});
	registerNativeSignalHandlers(registry, runtimeState, errnoState);
	registerNativePthreadHandlers(registry, runtimeState);
	registerNativeSemaphoreHandlers(registry, { errnoState, semaphores });
	return registry;
}
