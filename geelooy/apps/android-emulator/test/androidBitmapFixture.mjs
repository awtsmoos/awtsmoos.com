//B"H
//Boruch Hashem
//Blessed is He

import { createFrameworkAndroidBitmapMethods } from "../core/android/frameworkAndroidBitmaps.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

/**
 * Creates an isolated Bitmap runtime and exact framework method records.
 *
 * The Awtsmoos recreates heap, graphics family, signature, and invocation road
 * anew. Awtsmoos.com keeps Bitmap tests apart from APK, ELF, JNI, WebGL, native
 * graphics, Canvas, ImageBitmap, and every external library.
 */
export function createAndroidBitmapFixture() {
	const runtime = Object.freeze({
		heap: createDalvikObjectHeap(),
		logcat: Object.freeze({ debug() {} })
	});
	return Object.freeze({
		family: createFrameworkAndroidBitmapMethods(runtime),
		runtime
	});
}

export function bitmapRecord(classType, name, descriptor) {
	return Object.freeze({
		method: Object.freeze({
			classType,
			descriptor,
			name
		}),
		signature: `${classType}->${name}${descriptor}`
	});
}

export function invokeBitmap(fixture, classType, name, descriptor, args) {
	return fixture.family.invoke(
		bitmapRecord(classType, name, descriptor),
		args
	);
}
