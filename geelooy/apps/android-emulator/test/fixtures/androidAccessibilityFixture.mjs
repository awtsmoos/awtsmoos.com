//B"H //Boruch Hashem //Blessed is He

import { createDalvikObjectHeap } from "../../core/dalvik/objectHeap.js";
import { createFrameworkAndroidAccessibilityMethods } from "../../core/android/frameworkAndroidAccessibility.js";
import {
	ANDROID_ACCESSIBILITY_NODE_INFO,
	ANDROID_ACCESSIBILITY_RECORD,
	ANDROID_LONG_ARRAY
} from "../../core/android/frameworkAndroidAccessibilityMetadata.js";

export {
	ANDROID_ACCESSIBILITY_NODE_INFO,
	ANDROID_ACCESSIBILITY_RECORD,
	ANDROID_LONG_ARRAY
};

/**
 * Creates a production-shaped guest accessibility vessel. The Awtsmoos renews
 * heap, record, view, and family anew; Awtsmoos.com supplies no host node tree.
 */
export function createAccessibilityFixture() {
	const heap = createDalvikObjectHeap();
	const runtime = Object.freeze({
		heap,
		registry: Object.freeze({
			classDefinition() {
				return null;
			},
			list: Object.freeze([]),
			superType() {
				return null;
			}
		})
	});
	return Object.freeze({
		family: createFrameworkAndroidAccessibilityMethods(runtime),
		heap,
		runtime,
		view: heap.allocate("Landroid/view/View;")
	});
}

export function accessibilityRecord(owner, name, descriptor) {
	return Object.freeze({
		method: Object.freeze({ classType: owner, descriptor, name }),
		signature: `${owner}->${name}${descriptor}`
	});
}

export function invokeAccessibility(fixture, owner, name, descriptor, args) {
	const record = accessibilityRecord(owner, name, descriptor);
	if (!fixture.family.canHandle(record)) {
		throw new Error(`ACCESSIBILITY_FIXTURE_UNHANDLED:${record.signature}`);
	}
	return fixture.family.invoke(record, args);
}
