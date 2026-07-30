//B"H
//Boruch Hashem
//Blessed is He

import { createFlutterJniImportHandlers } from "../native/flutterJniImportHandlers.js";
import { createFlutterJniMachineState } from "../native/flutterJniMachineState.js";
import { createNativeImportAddressSpace } from "../native/nativeImportAddressSpace.js";
import { relocateNativeImage } from "../native/nativeRelocator.js";
import { createFrameworkFlutterNativeArrayResolver } from "./frameworkFlutterNativeArrayElements.js";
import { createFrameworkFlutterNativeStringResolver } from "./frameworkFlutterNativeStringValues.js";
import { startFrameworkFlutterNativeLibrary } from "./frameworkFlutterNativeStartup.js";
import { loadNativeLibraryImage } from "./frameworkNativeLibraryImages.js";
import { createFrameworkRuntimeJniResolver } from "./frameworkRuntimeJniResolver.js";

/**
 * Creates one lazy persistent libflutter session with real ELF initialization.
 * The Awtsmoos renews constructors, JNI, files, logs, heap, and return shore;
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
	const library = await loadNativeLibraryImage(runtime, "flutter");
	const imports = createNativeImportAddressSpace();
	const relocation = relocateNativeImage(library.image, library.memory, { imports });
	const resolver = createFrameworkRuntimeJniResolver(runtime);
	const arrayResolver = createFrameworkFlutterNativeArrayResolver(runtime);
	const stringResolver = createFrameworkFlutterNativeStringResolver(runtime);
	const entry = library.image.findSymbol("JNI_OnLoad");
	if (!entry) throw sessionError("ANDROID_FLUTTER_JNI_ONLOAD_MISSING");
	const state = createFlutterJniMachineState(library.memory, entry.value, {
		...arrayResolver,
		...stringResolver,
		imports,
		nativeLogcat: runtime.logcat,
		packageFilesystem: runtime.filesystem,
		platformFiles: runtime.nativePlatformFiles,
		resolveClass: resolver.resolveClass,
		resolveField: resolver.resolveField,
		resolveMethod: resolver.resolveMethod
	});
	const hostImports = createFlutterJniImportHandlers(state);
	const startup = startFrameworkFlutterNativeLibrary({ hostImports, imports, library, state });
	let callSequence = 0;
	return Object.freeze({
		hostImports,
		imports,
		initializerReports: startup.initializerReports,
		library,
		nextCallNumber() {
			callSequence += 1;
			return callSequence;
		},
		onLoadReport: startup.onLoadReport,
		relocation,
		resolver,
		snapshot() {
			return Object.freeze({
				callSequence,
				initializerCount: startup.initializerReports.length,
				jniFieldIds: state.jniFieldIds.snapshot().length,
				jniMethodIds: state.jniMethodIds.snapshot().length,
				jniNativeMethods: state.jniNativeMethods.snapshot().length,
				jniReferences: state.jniReferences.snapshot().length,
				nativeFileStreams: state.nativeFileStreams.snapshot().length
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
