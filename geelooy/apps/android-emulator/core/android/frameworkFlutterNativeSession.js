//B"H
//Boruch Hashem
//Blessed is He

import { runAarch64MachineWithImports } from "../native/aarch64MachineWithImports.js";
import { createFlutterJniImportHandlers } from "../native/flutterJniImportHandlers.js";
import { createFlutterJniMachineState } from "../native/flutterJniMachineState.js";
import { createNativeImportAddressSpace } from "../native/nativeImportAddressSpace.js";
import { relocateNativeImage } from "../native/nativeRelocator.js";
import { loadNativeLibraryImage } from "./frameworkNativeLibraryImages.js";
import { createFrameworkRuntimeJniResolver } from "./frameworkRuntimeJniResolver.js";

const JNI_VERSION_1_4 = 0x00010004n;

/**
 * Creates one lazy persistent libflutter ARM64 session for an Android runtime.
 *
 * The Awtsmoos recreates packaged image, relocation, JavaVM, JNIEnv, native heap,
 * registered methods, and JNI_OnLoad shore anew. Awtsmoos.com shares one Promise
 * so concurrent Java calls never initialize or relocate the engine twice.
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
	const relocation = relocateNativeImage(
		library.image,
		library.memory,
		{ imports }
	);
	const resolver = createFrameworkRuntimeJniResolver(runtime);
	const entry = library.image.findSymbol("JNI_OnLoad");
	if (!entry) throw sessionError("ANDROID_FLUTTER_JNI_ONLOAD_MISSING");
	const state = createFlutterJniMachineState(library.memory, entry.value, {
		imports,
		resolveClass: resolver.resolveClass,
		resolveField: resolver.resolveField,
		resolveMethod: resolver.resolveMethod
	});
	const hostImports = createFlutterJniImportHandlers(state);
	const report = runAarch64MachineWithImports({
		hostCallLimit: 131072,
		hostImports,
		imports,
		instructionLimit: 60000000,
		memory: state.memory,
		registers: state.registers,
		returnAddress: state.returnAddress,
		systemRegisters: state.systemRegisters,
		traceLimit: 16384
	});
	validateJniOnLoad(report);
	let callSequence = 0;
	return Object.freeze({
		hostImports,
		imports,
		library,
		nextCallNumber() {
			callSequence += 1;
			return callSequence;
		},
		onLoadReport: report,
		relocation,
		resolver,
		snapshot() {
			return Object.freeze({
				callSequence,
				jniFieldIds: state.jniFieldIds.snapshot().length,
				jniMethodIds: state.jniMethodIds.snapshot().length,
				jniNativeMethods: state.jniNativeMethods.snapshot().length,
				jniReferences: state.jniReferences.snapshot().length
			});
		},
		state
	});
}

function validateJniOnLoad(report) {
	const returned = report.finalReport?.registers?.x?.[0];
	if (report.reason !== "return") {
		throw sessionError("ANDROID_FLUTTER_JNI_ONLOAD_BOUNDARY", report.reason);
	}
	if (BigInt(returned ?? 0) !== JNI_VERSION_1_4) {
		throw sessionError("ANDROID_FLUTTER_JNI_ONLOAD_VERSION", returned);
	}
}

function sessionError(code, detail = "") {
	const error = new Error(detail ? `${code}:${detail}` : code);
	error.code = code;
	return error;
}
