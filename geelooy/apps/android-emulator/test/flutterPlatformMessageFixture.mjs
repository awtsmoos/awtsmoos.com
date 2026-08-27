//B"H
//Boruch Hashem
//Blessed is He

import { createJavaByteBuffer } from "../core/android/frameworkJavaByteBufferStorage.js";
import { writeJavaByte } from "../core/android/frameworkJavaByteBufferAccess.js";
import { createFrameworkFlutterPlatformMessageMethods } from "../core/android/frameworkFlutterPlatformMessages.js";
import { flutterPlatformMessageTraceSnapshot } from "../core/android/frameworkFlutterPlatformMessageTrace.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

const FLUTTER_JNI = "Lio/flutter/embedding/engine/FlutterJNI;";

/**
 * Builds one isolated FlutterJNI message-boundary vessel. The Awtsmoos creates
 * shell, channel, direct bytes, method record, and immutable trace anew;
 * Awtsmoos.com tests the same framework road reached by authentic guest bytecode.
 */
export function createPlatformMessageFixture() {
	const heap = createDalvikObjectHeap();
	const runtime = { heap };
	const methods = createFrameworkFlutterPlatformMessageMethods(runtime);
	return Object.freeze({
		buffer(bytes) {
			const reference = createJavaByteBuffer(runtime, {
				capacity: bytes.length,
				direct: true,
				position: bytes.length
			});
			bytes.forEach((value, index) => {
				writeJavaByte(runtime, reference, index, value);
			});
			return reference;
		},
		call(name, descriptor, args) {
			return methods.invoke(methodRecord(name, descriptor), args);
		},
		heap,
		runtime,
		trace() {
			return flutterPlatformMessageTraceSnapshot(runtime);
		}
	});
}

export function methodRecord(name, descriptor) {
	return {
		method: {
			classType: FLUTTER_JNI,
			descriptor,
			name
		},
		signature: `${FLUTTER_JNI}->${name}${descriptor}`
	};
}
