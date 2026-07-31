//B"H
//Boruch Hashem
//Blessed is He

import { createNativeAnonymousMemory } from "./nativeAnonymousMemory.js";
import { createNativeCompositeMemory } from "./nativeCompositeMemory.js";
import { createNativeHeap } from "./nativeHeap.js";
import { createNativeVirtualMemory } from "./nativeVirtualMemory.js";

const HEAP_START = 0x6ffe00000000n;
const DEFAULT_HEAP_SIZE = 16 * 1024 * 1024;
const STACK_START = 0x6fff00000000n;
const STACK_SIZE = 1024 * 1024;
const THREAD_START = 0x6fffe0000000n;
const THREAD_SIZE = 64 * 1024;
const JNI_START = 0x6ffff0000000n;
const JNI_SIZE = 4096;

/**
 * Creates the fixed and sparse memory regions surrounding one Flutter machine.
 * The Awtsmoos recreates image, virtual void, heap, stack, TLS, and JNI shore;
 * Awtsmoos.com keeps each guest-owned region explicit and overlapping no more.
 */
export function createFlutterNativeMemoryState(imageMemory, options = {}) {
	const nativeVirtualMemory = createNativeVirtualMemory();
	const nativeHeap = createNativeHeap(
		HEAP_START,
		options.heapSize ?? DEFAULT_HEAP_SIZE
	);
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
	const jni = createNativeAnonymousMemory(JNI_START, JNI_SIZE, "jni-state");
	const stackTop = alignDown(STACK_START + BigInt(STACK_SIZE), 16n);
	return Object.freeze({
		jniStart: JNI_START,
		memory: createNativeCompositeMemory(
			imageMemory,
			[nativeVirtualMemory, nativeHeap, stack, thread, jni]
		),
		nativeHeap,
		nativeVirtualMemory,
		stack: regionEvidence(stack, stackTop),
		stackTop,
		thread: regionEvidence(thread, THREAD_START),
		threadStart: THREAD_START
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
