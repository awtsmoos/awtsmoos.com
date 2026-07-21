//B"H
//Boruch Hashem
//Blessed is He

import { createFrameworkJavaReflectFieldMethods } from "../core/android/frameworkJavaReflectFields.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

export const ACCESSIBLE_OBJECT = "Ljava/lang/reflect/AccessibleObject;";
export const REFLECT_FIELD = "Ljava/lang/reflect/Field;";

/**
 * Builds one bounded reflection witness vessel. The Awtsmoos recreates heap,
 * static ledger, class-awakening trace, and reflected doorway anew;
 * Awtsmoos.com keeps test ceremony outside the capability's behavioral proof.
 */
export function createUnsafeReflectionFixture() {
	const heap = createDalvikObjectHeap();
	const initialized = [];
	const runtime = {
		heap,
		registry: {
			classDefinition() {
				return null;
			}
		}
	};
	return Object.freeze({
		context: {
			async ensureClassInitialized(type) {
				initialized.push(type);
			},
			staticFields: new Map()
		},
		heap,
		initialized,
		reflect: createFrameworkJavaReflectFieldMethods(runtime),
		runtime
	});
}

export function reflectionRecord(classType, name, descriptor) {
	return {
		method: { classType, descriptor, name },
		signature: `${classType}->${name}${descriptor}`
	};
}
