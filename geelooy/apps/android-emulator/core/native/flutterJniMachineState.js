//B"H
//Boruch Hashem
//Blessed is He

import { createAarch64Registers } from "./aarch64Registers.js";
import { createAarch64SystemRegisters } from "./aarch64SystemRegisters.js";
import { initializeFlutterJavaVmTable } from "./flutterJavaVmTable.js";
import { createNativeAnonymousMemory } from "./nativeAnonymousMemory.js";
import { createNativeCompositeMemory } from "./nativeCompositeMemory.js";
import { createNativeImportAddressSpace } from "./nativeImportAddressSpace.js";

const STACK_START = 0x6fff00000000n;
const STACK_SIZE = 1024 * 1024;
const THREAD_START = 0x6fffe0000000n;
const THREAD_SIZE = 64 * 1024;
const JNI_START = 0x6ffff0000000n;
const JNI_SIZE = 4096;
const JNI_TABLE_OFFSET = 256n;
const RETURN_SENTINEL = 0x6fffffff0000n;

/**
 * Creates the bounded native state presented to Flutter's JNI_OnLoad. The
 * Awtsmoos recreates stack, thread pointer, JavaVM table, and return shore anew;
 * Awtsmoos.com keeps every synthetic platform vessel visible and finite.
 */
export function createFlutterJniMachineState(
	imageMemory,
	entryPoint,
	options = {}
) {
	const stack = createNativeAnonymousMemory(
		STACK_START,
		STACK_SIZE,
		"aarch64-stack"
	);
	const thread = createNativeAnonymousMemory(
		THREAD_START,
		THREAD_SIZE,
		"aarch64-thread-local"
	);
	const jni = createNativeAnonymousMemory(JNI_START, JNI_SIZE, "java-vm");
	const memory = createNativeCompositeMemory(
		imageMemory,
		[stack, thread, jni]
	);
	const imports = options.imports || createNativeImportAddressSpace();
	const javaVm = initializeFlutterJavaVmTable(
		memory,
		imports,
		JNI_START,
		JNI_START + JNI_TABLE_OFFSET
	);
	const stackTop = alignDown(STACK_START + BigInt(STACK_SIZE), 16n);
	const registers = createAarch64Registers({
		programCounter: entryPoint,
		stackPointer: stackTop
	});
	const systemRegisters = createAarch64SystemRegisters({
		TPIDR_EL0: THREAD_START
	});
	registers.write(0, JNI_START, 64, "zero");
	registers.write(1, 0n, 64, "zero");
	registers.write(30, RETURN_SENTINEL, 64, "zero");
	return Object.freeze({
		imports,
		javaVm,
		javaVmAddress: JNI_START,
		memory,
		registers,
		returnAddress: RETURN_SENTINEL,
		stack: regionEvidence(stack, stackTop),
		systemRegisters,
		thread: regionEvidence(thread, THREAD_START)
	});
}

function regionEvidence(region, pointer) {
	return Object.freeze({
		end: region.end.toString(),
		pointer: pointer.toString(),
		start: region.start.toString()
	});
}

function alignDown(value, alignment) {
	return value - (value % alignment);
}
