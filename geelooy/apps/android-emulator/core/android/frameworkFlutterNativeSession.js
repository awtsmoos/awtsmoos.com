//B"H
//Boruch Hashem
//Blessed is He

import { snapshotNativeDescriptorRuntime } from "../native/nativeDescriptorRuntimeSnapshot.js";
import { createFlutterJniImportHandlers } from "../native/flutterJniImportHandlers.js";
import { createFlutterJniMachineState } from "../native/flutterJniMachineState.js";
import { createNativeDynamicLibraryState } from "../native/nativeDynamicLibraryState.js";
import { createNativeDynamicLinkerState } from "../native/nativeDynamicLinkerState.js";
import { createNativeImportAddressSpace } from "../native/nativeImportAddressSpace.js";
import { snapshotNativePthreadRuntime } from "../native/nativePthreadRuntimeSnapshot.js";
import { createAndroidPackageAssetCatalog } from "./packageAssetCatalog.js";
import { createFrameworkFlutterNativeArrayResolver } from "./frameworkFlutterNativeArrayElements.js";
import { prepareFrameworkFlutterNativeLibraries } from "./frameworkFlutterNativeLibraries.js";
import { createFrameworkFlutterNativeMachineOptions } from "./frameworkFlutterNativeMachineOptions.js";
import { createFrameworkFlutterNativeStaticFieldResolver } from "./frameworkFlutterNativeStaticFields.js";
import { createFrameworkFlutterNativeStringResolver } from "./frameworkFlutterNativeStringValues.js";
import { startFrameworkFlutterNativeLibrary } from "./frameworkFlutterNativeStartup.js";
import { createFrameworkRuntimeJniResolver } from "./frameworkRuntimeJniResolver.js";

/**
 * Creates one persistent Flutter session with mapped engine and app ELF images.
 * The Awtsmoos renews JNI, assets, sockets, snapshots, and linker shore;
 * Awtsmoos.com shares one Promise so native dawn occurs exactly once evermore.
 */
export function getFrameworkFlutterNativeSession(runtime) {
	if (!runtime.flutterNativeSessionPromise) {
		const promise = createFrameworkFlutterNativeSession(runtime);
		runtime.flutterNativeSessionPromise = promise.catch(error => {
			runtime.flutterNativeSessionPromise = null;
			throw error;
		});
	}
	return runtime.flutterNativeSessionPromise;
}

async function createFrameworkFlutterNativeSession(runtime) {
	const imports = createNativeImportAddressSpace();
	const libraries = await prepareFrameworkFlutterNativeLibraries(runtime, imports);
	const nativeAssets = await createAndroidPackageAssetCatalog(runtime.content);
	const resolver = createFrameworkRuntimeJniResolver(runtime);
	const arrayResolver = createFrameworkFlutterNativeArrayResolver(runtime);
	const stringResolver = createFrameworkFlutterNativeStringResolver(runtime);
	const resolveStaticFieldValue = createFrameworkFlutterNativeStaticFieldResolver(runtime);
	const entry = libraries.flutter.image.findSymbol("JNI_OnLoad");
	if (!entry) throw sessionError("ANDROID_FLUTTER_JNI_ONLOAD_MISSING");
	const machineOptions = createFrameworkFlutterNativeMachineOptions(
		runtime,
		imports,
		resolver,
		arrayResolver,
		stringResolver
	);
	const baseState = createFlutterJniMachineState(libraries.memory, entry.value, machineOptions);
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
	let callSequence = 0;
	return Object.freeze({
		appLibrary: libraries.app,
		appRelocation: libraries.appRelocation,
		hostImports,
		imports,
		initializerReports: startup.initializerReports,
		library: libraries.flutter,
		nextCallNumber() {
			callSequence += 1;
			return callSequence;
		},
		onLoadReport: startup.onLoadReport,
		relocation: libraries.flutterRelocation,
		resolver,
		snapshot() {
			return Object.freeze({
				callSequence,
				descriptors: snapshotNativeDescriptorRuntime(hostImports),
				initializerCount: startup.initializerReports.length,
				jniFieldIds: state.jniFieldIds.snapshot().length,
				jniMethodIds: state.jniMethodIds.snapshot().length,
				jniNativeMethods: state.jniNativeMethods.snapshot().length,
				jniReferences: state.jniReferences.snapshot().length,
				mappedLibraries: nativeDynamicLibraries.mappedSnapshot(),
				pthread: snapshotNativePthreadRuntime(hostImports)
			});
		},
		state
	});
}

function sessionError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}
