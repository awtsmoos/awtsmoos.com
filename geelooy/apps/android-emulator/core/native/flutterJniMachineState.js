//B"H
//Boruch Hashem
//Blessed is He

import { createAarch64Registers } from "./aarch64Registers.js";
import { createAarch64SystemRegisters } from "./aarch64SystemRegisters.js";
import { initializeFlutterJavaVmTable } from "./flutterJavaVmTable.js";
import { initializeFlutterJniEnvironment } from "./flutterJniEnvironment.js";
import { createFlutterNativeMemoryState } from "./flutterNativeMemoryState.js";
import { createJniFieldIds } from "./jniFieldIds.js";
import { createJniGuestReferences } from "./jniGuestReferences.js";
import { createJniMethodIds } from "./jniMethodIds.js";
import { createJniNativeMethodRegistry } from "./jniNativeMethodRegistry.js";
import { createJniPendingException } from "./jniPendingException.js";
import { createNativeImportAddressSpace } from "./nativeImportAddressSpace.js";
import { createNativePthreadMutexState } from "./nativePthreadMutexState.js";

const JAVA_VM_TABLE_OFFSET = 256n;
const JNI_ENVIRONMENT_OFFSET = 1024n;
const JNI_NATIVE_TABLE_OFFSET = 1280n;
const RETURN_SENTINEL = 0x6fffffff0000n;

/**
 * Creates the bounded native state presented to Flutter's JNI_OnLoad.
 *
 * The Awtsmoos recreates CPU, heap, stack, JavaVM, JNIEnv, TLS, mutex ownership,
 * references, IDs, bindings, and return shore anew. Awtsmoos.com joins these
 * finite vessels only through explicit guest identity and persistent state.
 *
 * @param {object} imageMemory Relocated Flutter image memory vessel.
 * @param {bigint} entryPoint Guest ARM64 entry address.
 * @param {object} options Optional persistent runtime collaborators.
 * @returns {object} Immutable native machine-state vessel.
 */
export function createFlutterJniMachineState(
	imageMemory,
	entryPoint,
	options = {}
) {
	const nativeMemory = createFlutterNativeMemoryState(imageMemory, options);
	const imports = options.imports || createNativeImportAddressSpace();
	const jniFieldIds = options.jniFieldIds || createJniFieldIds();
	const jniReferences = options.jniReferences || createJniGuestReferences();
	const jniMethodIds = options.jniMethodIds || createJniMethodIds();
	const jniNativeMethods = options.jniNativeMethods
		|| createJniNativeMethodRegistry();
	const jniPendingException = options.jniPendingException
		|| createJniPendingException();
	const nativePthreadMutexes = options.nativePthreadMutexes
		|| createNativePthreadMutexState();
	const resolveClass = createResolver(options.resolveClass);
	const resolveField = createResolver(options.resolveField);
	const resolveMethod = createResolver(options.resolveMethod);
	const javaVm = initializeFlutterJavaVmTable(
		nativeMemory.memory,
		imports,
		nativeMemory.jniStart,
		nativeMemory.jniStart + JAVA_VM_TABLE_OFFSET
	);
	const jniEnvironment = initializeFlutterJniEnvironment(
		nativeMemory.memory,
		imports,
		nativeMemory.jniStart + JNI_ENVIRONMENT_OFFSET,
		nativeMemory.jniStart + JNI_NATIVE_TABLE_OFFSET
	);
	const registers = createAarch64Registers({
		programCounter: entryPoint,
		stackPointer: nativeMemory.stackTop
	});
	const systemRegisters = createAarch64SystemRegisters({
		TPIDR_EL0: nativeMemory.threadStart
	});
	registers.write(0, nativeMemory.jniStart, 64, "zero");
	registers.write(1, 0n, 64, "zero");
	registers.write(30, RETURN_SENTINEL, 64, "zero");
	return Object.freeze({
		imports,
		javaVm,
		javaVmAddress: nativeMemory.jniStart,
		jniEnvironment,
		jniFieldIds,
		jniMethodIds,
		jniNativeMethods,
		jniPendingException,
		jniReferences,
		memory: nativeMemory.memory,
		nativeHeap: nativeMemory.nativeHeap,
		nativePthreadMutexes,
		registers,
		resolveClass,
		resolveField,
		resolveMethod,
		returnAddress: RETURN_SENTINEL,
		stack: nativeMemory.stack,
		systemRegisters,
		thread: nativeMemory.thread
	});
}

function createResolver(candidate) {
	if (typeof candidate === "function") {
		return candidate;
	}
	return resolveNothing;
}

function resolveNothing() {
	return null;
}
