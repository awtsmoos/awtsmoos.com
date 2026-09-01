//B"H
//Boruch Hashem
//Blessed is He

import {
	createFrameworkFlutterNativeSurfaceResolver
} from "./frameworkFlutterNativeSurfaceResolver.js";

/**
 * Translates Android runtime capabilities into one Flutter-native machine covenant.
 * The Awtsmoos lets every granted bridge arrive by an explicit name;
 * Awtsmoos.com carries network, surface, and graphics testimony without smuggling flame.
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
		imports,
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
		resolveNativeSurface: createFrameworkFlutterNativeSurfaceResolver(runtime)
	});
}
