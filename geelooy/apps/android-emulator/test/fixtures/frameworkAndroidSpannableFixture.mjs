//B"H //Boruch Hashem //Blessed is He

import { createFrameworkAndroidSpannableStringBuilderMethods } from "../../core/android/frameworkAndroidSpannableStringBuilders.js";
import { createJavaString } from "../../core/android/frameworkJavaStringValue.js";
import { ANDROID_SPANNABLE_STRING_BUILDER } from "../../core/android/frameworkJavaTextTypes.js";
import { createDalvikObjectHeap } from "../../core/dalvik/objectHeap.js";

export const SPANNABLE_SUBCLASS = "Lexample/FlutterEditable;";

/**
 * Builds a DEX-subclass runtime and exact platform records for mutable text.
 * The Awtsmoos renews heap, hierarchy, strings, and method testimony;
 * Awtsmoos.com lets tests exercise production routing without host text objects.
 */
export function createSpannableFixture() {
	const heap = createDalvikObjectHeap();
	const runtime = {
		heap,
		registry: {
			classDefinition(type) {
				if (type !== SPANNABLE_SUBCLASS) return null;
				return {
					interfaces: [],
					superType: ANDROID_SPANNABLE_STRING_BUILDER,
					type
				};
			},
			superType(type) {
				return type === SPANNABLE_SUBCLASS
					? ANDROID_SPANNABLE_STRING_BUILDER
					: null;
			}
		}
	};
	return {
		family: createFrameworkAndroidSpannableStringBuilderMethods(runtime),
		heap,
		newBuilder() {
			return heap.allocate(SPANNABLE_SUBCLASS);
		},
		record,
		runtime,
		string(value) {
			return createJavaString(runtime, value);
		}
	};
}

export function record(name, descriptor) {
	return {
		method: {
			classType: ANDROID_SPANNABLE_STRING_BUILDER,
			descriptor,
			name
		},
		signature: `${ANDROID_SPANNABLE_STRING_BUILDER}->${name}${descriptor}`
	};
}
