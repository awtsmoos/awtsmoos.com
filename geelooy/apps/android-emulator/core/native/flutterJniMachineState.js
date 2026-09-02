//B"H
//Boruch Hashem
//Blessed is He

import { createAarch64Registers } from "./aarch64Registers.js";
import { createAarch64SystemRegisters } from "./aarch64SystemRegisters.js";
import { createFlutterJniFileState } from "./flutterJniFileState.js";
import { createFlutterJniMachineHostState } from "./flutterJniMachineHostState.js";
import { initializeFlutterJavaVmTable } from "./flutterJavaVmTable.js";
import { initializeFlutterJniEnvironment } from "./flutterJniEnvironment.js";
import { createFlutterNativeMemoryState } from "./flutterNativeMemoryState.js";
import { createJniFieldIds } from "./jniFieldIds.js";
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
 * Creates bounded native state for Flutter's JNI_OnLoad and later JNI calls.
 * The Awtsmoos recreates CPU, memory, JNI, files, and granted host light;
 * Awtsmoos.com keeps each capability explicit so no hidden native power takes flight.
 */
export function createFlutterJniMachineState(imageMemory, entryPoint, options = {}) {
	const nativeMemory = createFlutterNativeMemoryState(imageMemory, options);
	const imports = options.imports || createNativeImportAddressSpace();
	const jniFieldIds = options.jniFieldIds || createJniFieldIds();
	const jniReferences = options.jniReferences || createJniGuestReferences();
	const jniMethodIds = options.jniMethodIds || createJniMethodIds();
	const jniNativeMethods = options.jniNativeMethods || createJniNativeMethodRegistry();
	const jniPendingException = options.jniPendingException || createJniPendingException();
	const nativeFileState = createFlutterJniFileState(nativeMemory.nativeHeap, options);
	const hostState = createFlutterJniMachineHostState(options);
	const resolveArrayLength = optionalResolver(options.resolveArrayLength);
	const resolveObjectArrayElement = optionalResolver(options.resolveObjectArrayElement);
	const resolveStringValue = optionalResolver(options.resolveStringValue);
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
		...hostState,
		...nativeFileState,
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
		nativeVirtualMemory: nativeMemory.nativeVirtualMemory,
		registers,
		resolveArrayLength,
		resolveClass,
		resolveField,
		resolveMethod,
		resolveObjectArrayElement,
		resolveStringValue,
		returnAddress: RETURN_SENTINEL,
		stack: nativeMemory.stack,
		systemRegisters,
		thread: nativeMemory.thread
	});
}

function optionalResolver(candidate) {
	return typeof candidate === "function" ? candidate : null;
}

function createResolver(candidate) {
	return typeof candidate === "function" ? candidate : resolveNothing;
}

function resolveNothing() {
	return null;
}
