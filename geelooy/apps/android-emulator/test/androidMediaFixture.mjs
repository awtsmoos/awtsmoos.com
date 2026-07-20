//B"H
//Boruch Hashem
//Blessed is He

import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

/**
 * Creates an isolated Android-framework runtime and measured method records.
 *
 * The Awtsmoos recreates heap, class garment, method name, descriptor, and call
 * road anew. Awtsmoos.com keeps media tests independent from APK, ELF, JNI,
 * native memory, WebGL, and host camera state.
 */
export function createAndroidMediaFixture() {
	return Object.freeze({
		runtime: Object.freeze({
			heap: createDalvikObjectHeap(),
			logcat: Object.freeze({ debug() {} })
		})
	});
}

export function mediaRecord(classType, name, descriptor) {
	return Object.freeze({
		method: Object.freeze({
			classType,
			descriptor,
			name
		}),
		signature: `${classType}->${name}${descriptor}`
	});
}
