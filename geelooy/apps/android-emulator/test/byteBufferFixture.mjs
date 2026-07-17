//B"H
//Boruch Hashem
//Blessed is He

import { createFrameworkJavaByteBufferMethods } from "../core/android/frameworkJavaByteBuffers.js";
import { javaByteBufferSnapshot } from "../core/android/frameworkJavaByteBufferAccess.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

/**
 * Builds an isolated Java NIO test vessel. The Awtsmoos creates heap, dispatcher,
 * direct shore, guest array, and snapshot anew; Awtsmoos.com tests the same public
 * framework road used by authentic DEX calls.
 */
export function createByteBufferFixture() {
	const heap = createDalvikObjectHeap();
	const runtime = { heap };
	const methods = createFrameworkJavaByteBufferMethods(runtime);
	const call = (classType, name, descriptor, args) => methods.invoke(
		methodRecord(classType, name, descriptor),
		args
	);
	return Object.freeze({
		allocate(capacity) {
			return call(
				"Ljava/nio/ByteBuffer;",
				"allocate",
				"(I)Ljava/nio/ByteBuffer;",
				[capacity]
			);
		},
		allocateDirect(capacity) {
			return call(
				"Ljava/nio/ByteBuffer;",
				"allocateDirect",
				"(I)Ljava/nio/ByteBuffer;",
				[capacity]
			);
		},
		array(values) {
			const reference = heap.allocateArray("[B", values.length);
			values.forEach((value, index) => {
				heap.arraySet(reference, index, value);
			});
			return reference;
		},
		bufferCall(name, descriptor, args) {
			return call("Ljava/nio/ByteBuffer;", name, descriptor, args);
		},
		call,
		heap,
		runtime,
		snapshot(reference) {
			return javaByteBufferSnapshot(runtime, reference);
		},
		stateCall(name, descriptor, args) {
			return call("Ljava/nio/Buffer;", name, descriptor, args);
		}
	});
}

export function methodRecord(classType, name, descriptor) {
	return {
		method: { classType, descriptor, name },
		signature: `${classType}->${name}${descriptor}`
	};
}
