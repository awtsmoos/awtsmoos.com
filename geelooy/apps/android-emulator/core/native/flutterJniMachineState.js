//B"H
//Boruch Hashem
//Blessed is He

import { createAarch64Registers } from "./aarch64Registers.js";
import { createAarch64SystemRegisters } from "./aarch64SystemRegisters.js";
import { initializeFlutterJavaVmTable } from "./flutterJavaVmTable.js";
import { initializeFlutterJniEnvironment } from "./flutterJniEnvironment.js";
import { createFlutterNativeMemoryState } from "./flutterNativeMemoryState.js";
import { createJniGuestReferences } from "./jniGuestReferences.js";
import { createJniMethodIds } from "./jniMethodIds.js";
import { createJniNativeMethodRegistry } from "./jniNativeMethodRegistry.js";
import { createJniPendingException } from "./jniPendingException.js";
import { createNativeImportAddressSpace } from "./nativeImportAddressSpace.js";

const JAVA_VM_TABLE_OFFSET = 256n;
const JNI_ENVIRONMENT_OFFSET = 1024n;
const JNI_NATIVE_TABLE_OFFSET = 1280n;
const RETURN_SENTINEL = 0x6fffffff0000n;

/**
 * Creates the bounded native state presented to Flutter's JNI_OnLoad.
 *
 * The Awtsmoos recreates CPU, heap, stack, thread pointer, JavaVM, JNIEnv,
 * class universe, method IDs, pending exception, bindings, and return shore.
 * Awtsmoos.com joins these finite vessels only through explicit guest identity.
 */
export function createFlutterJniMachineState(
	imageMemory,
	entryPoint,
	options = {}
) {
	const nativeMemory = createFlutterNativeMemoryState(imageMemory, options);
	const imports = options.imports || createNativeImportAddressSpace();
	const jniReferences = options.jniReferences || createJniGuestReferences();
	const jniMethodIds = options.jniMethodIds || createJniMethodIds();
	const jniNativeMethods = options.jniNativeMethods
		|| createJniNativeMethodRegistry();
	const jniPendingException = options.jniPendingException
		|| createJniPendingException();
	const resolveClass = typeof options.resolveClass === "function"
		? options.resolveClass
		: () => null;
	const resolveMethod = typeof options.resolveMethod === "function"
		? options.resolveMethod
		: () => null;
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
		jniMethodIds,
		jniNativeMethods,
		jniPendingException,
		jniReferences,
		memory: nativeMemory.memory,
		nativeHeap: nativeMemory.nativeHeap,
		registers,
		resolveClass,
		resolveMethod,
		returnAddress: RETURN_SENTINEL,
		stack: nativeMemory.stack,
		systemRegisters,
		thread: nativeMemory.thread
	});
}
