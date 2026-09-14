//B"H
//Boruch Hashem
//Blessed be He

import { createFlutterJniImportHandlers } from "../native/flutterJniImportHandlers.js";
import { createFlutterJniMachineState } from "../native/flutterJniMachineState.js";
import { createNativeDynamicLibraryState } from "../native/nativeDynamicLibraryState.js";
import { createNativeDynamicLinkerState } from "../native/nativeDynamicLinkerState.js";
import { createNativeImportAddressSpace } from "../native/nativeImportAddressSpace.js";
import { createAndroidPackageAssetCatalog } from "./packageAssetCatalog.js";
import { createFrameworkFlutterNativeArrayResolver } from "./frameworkFlutterNativeArrayElements.js";
import { prepareFrameworkFlutterNativeLibraries } from "./frameworkFlutterNativeLibraries.js";
import { createFrameworkFlutterNativeMachineOptions } from "./frameworkFlutterNativeMachineOptions.js";
import { createFrameworkFlutterNativeSessionFacade } from "./frameworkFlutterNativeSessionFacade.js";
import { createFrameworkFlutterNativeStaticFieldResolver } from "./frameworkFlutterNativeStaticFields.js";
import { createFrameworkFlutterNativeStringResolver } from "./frameworkFlutterNativeStringValues.js";
import { startFrameworkFlutterNativeLibrary } from "./frameworkFlutterNativeStartup.js";
import { createFrameworkRuntimeJniResolver } from "./frameworkRuntimeJniResolver.js";

/**
 * Returns the one persistent Flutter engine/JNI session owned by an Android runtime.
 *
 * Caching the promise before initialization finishes prevents duplicate native engines.
 * A failed bootstrap clears only the cache so a later authentic retry remains possible.
 *
 * @param {object} runtime Live Android runtime owning package, graphics, and JNI state.
 * @returns {Promise<object>} Shared persistent Flutter native-session promise.
 */
export function getFrameworkFlutterNativeSession(runtime) {
	if (!runtime.flutterNativeSessionPromise) {
		const pendingSession = createFrameworkFlutterNativeSession(runtime);
		runtime.flutterNativeSessionPromise = pendingSession.catch((error) => {
			runtime.flutterNativeSessionPromise = null;
			throw error;
		});
	}
	return runtime.flutterNativeSessionPromise;
}

/**
 * Creates persistent JNI state before any registered FlutterJNI invocation exists.
 * Bootstrap options therefore carry runtime capabilities only; instruction budgets,
 * checkpoints, invocation registers, and return policy remain in the call runner.
 *
 * @param {object} runtime Live Android runtime.
 * @returns {Promise<object>} Initialized immutable native-session facade.
 */
async function createFrameworkFlutterNativeSession(runtime) {
	const imports = createNativeImportAddressSpace();
	const libraries = await prepareFrameworkFlutterNativeLibraries(runtime, imports);
	const nativeAssets = await createAndroidPackageAssetCatalog(runtime.content);
	const resolver = createFrameworkRuntimeJniResolver(runtime);
	const arrayResolver = createFrameworkFlutterNativeArrayResolver(runtime);
	const stringResolver = createFrameworkFlutterNativeStringResolver(runtime);
	const resolveStaticFieldValue = createFrameworkFlutterNativeStaticFieldResolver(runtime);
	const entry = libraries.flutter.image.findSymbol("JNI_OnLoad");
	if (!entry) {
		throw sessionError("ANDROID_FLUTTER_JNI_ONLOAD_MISSING");
	}
	const machineOptions = createFrameworkFlutterNativeMachineOptions(
		runtime,
		imports,
		resolver,
		arrayResolver,
		stringResolver
	);
	const baseState = createFlutterJniMachineState(
		libraries.memory,
		entry.value,
		machineOptions
	);
	const nativeDynamicLinker = createNativeDynamicLinkerState(baseState.nativeHeap);
	const nativeDynamicLibraries = createNativeDynamicLibraryState({
		errors: nativeDynamicLinker,
		imports,
		mappedLibraries: libraries.mappedLibraries
	});
	const state = Object.freeze({
		...baseState,
		nativeAssets,
		nativeDynamicLibraries,
		nativeDynamicLinker,
		nativeProcessName: runtime.packageSet.packageName,
		resolveStaticFieldValue
	});
	const hostImports = createFlutterJniImportHandlers(state);
	const startup = startFrameworkFlutterNativeLibrary({
		hostImports,
		imports,
		library: libraries.flutter,
		state
	});
	return createFrameworkFlutterNativeSessionFacade({
		hostImports,
		libraries,
		nativeDynamicLibraries,
		resolver,
		startup,
		state
	});
}

/** Creates one stable coded bootstrap error instead of an untyped throw. */
function sessionError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}
