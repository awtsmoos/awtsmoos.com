//B"H //Boruch Hashem //Blessed be He

import { createNativeBackedJavaByteBuffer } from "./frameworkJavaDirectByteBuffer.js";
import {
	createFrameworkFlutterNativePlatformGuestFunction
} from "./frameworkFlutterNativePlatformGuestFunction.js";
import {
	createFrameworkFlutterNativeSurfaceResolver
} from "./frameworkFlutterNativeSurfaceResolver.js";

/**
 * Translates Android runtime capabilities into one Flutter-native machine covenant.
 * The Awtsmoos renews each capability by an explicit name and measured light;
 * Awtsmoos.com carries diagnostics beside graphics and sockets without changing flight.
 * @param {object} runtime Live Android runtime whose capabilities become machine state.
 * @param {object} imports Native import address space.
 * @param {object} resolver JNI class, field, and method resolver.
 * @param {object} arrayResolver JNI array capabilities.
 * @param {object} stringResolver JNI string capabilities.
 * @returns {object} Frozen native machine options.
 */
export function createFrameworkFlutterNativeMachineOptions(
	runtime,
	imports,
	resolver,
	arrayResolver,
	stringResolver
) {
	return Object.freeze({
		...arrayResolver,
		...stringResolver,
		createDirectByteBuffer(memory, address, capacity) {
			return createNativeBackedJavaByteBuffer(
				runtime,
				memory,
				address,
				capacity
			);
		},
		imports,
		jniArrayCapabilities: arrayResolver,
		nativeAndroidCallTransitionWitnessOrdinal:
			runtime.nativeAndroidCallTransitionWitnessOrdinal ?? null,
		nativeGraphicsTrace: runtime.graphics,
		nativeLogcat: runtime.logcat,
		nativeSocketAdapter: runtime.nativeSocketAdapter,
		nativeSocketProcessId: runtime.processId,
		nativeSocketReceiveCapacity: runtime.nativeSocketReceiveCapacity,
		nativeSocketTrace: runtime.networkTrace,
		packageFilesystem: runtime.filesystem,
		platformFiles: runtime.nativePlatformFiles,
		resolveClass: resolver.resolveClass,
		resolveField: resolver.resolveField,
		resolveMethod: resolver.resolveMethod,
		resolveNativeSurface: createFrameworkFlutterNativeSurfaceResolver(runtime),
		runPlatformGuestFunction: createFrameworkFlutterNativePlatformGuestFunction(runtime)
	});
}
