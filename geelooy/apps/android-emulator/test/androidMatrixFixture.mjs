//B"H //Boruch Hashem //Blessed is He

import { createFrameworkAndroidMatrixMethods } from "../core/android/frameworkAndroidMatrices.js";
import { ANDROID_MATRIX } from "../core/android/frameworkAndroidMatrixState.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

export const RECT_F = "Landroid/graphics/RectF;";

/** Creates real guest heap vessels for exact Matrix method invocation. */
export function createAndroidMatrixFixture() {
	const heap = createDalvikObjectHeap();
	const runtime = { heap };
	const family = createFrameworkAndroidMatrixMethods(runtime);
	return {
		array(values) {
			const reference = heap.allocateArray("[F", values.length);
			values.forEach((value, index) => heap.arraySet(reference, index, value));
			return reference;
		},
		call(name, descriptor, args) {
			return family.invoke(record(name, descriptor), args);
		},
		family,
		heap,
		matrix(source = null) {
			const reference = heap.allocate(ANDROID_MATRIX);
			family.invoke(record(
				"<init>",
				source ? `(Landroid/graphics/Matrix;)V` : "()V"
			), source ? [reference, source] : [reference]);
			return reference;
		},
		readArray(reference) {
			return Array.from({ length: heap.arrayLength(reference) }, (_, index) => {
				return heap.arrayGet(reference, index);
			});
		},
		rect(left, top, right, bottom) {
			const reference = heap.allocate(RECT_F);
			for (const [name, value] of Object.entries({ left, top, right, bottom })) {
				heap.setField(reference, `${RECT_F}->${name}:F`, value);
			}
			return reference;
		},
		runtime
	};
}

export function record(name, descriptor) {
	return {
		method: { classType: ANDROID_MATRIX, descriptor, name },
		signature: `${ANDROID_MATRIX}->${name}${descriptor}`
	};
}
