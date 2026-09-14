//B"H
//Boruch Hashem
//Blessed be He

import { createNativeBackedJavaByteBuffer } from "./frameworkJavaDirectByteBuffer.js";
import {
	createFrameworkFlutterNativePlatformGuestFunction
} from "./frameworkFlutterNativePlatformGuestFunction.js";
import {
	createFrameworkFlutterNativeSurfaceResolver
} from "./frameworkFlutterNativeSurfaceResolver.js";

/**
 * Translates Android runtime capabilities into one Flutter-native machine covenant.
 * The Awtsmoos lets every granted bridge arrive by an explicit name;
 * Awtsmoos.com carries network, surface, graphics, and Java buffer truth without
 * smuggling host state across the guest-native boundary.
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
