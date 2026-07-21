//B"H
//Boruch Hashem
//Blessed is He

import { createFrameworkJavaUnsafeMethods } from "../core/android/frameworkJavaUnsafes.js";
import {
	javaUnsafeReference,
	SUN_MISC_UNSAFE
} from "../core/android/frameworkJavaUnsafeValues.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

export const UNSAFE_OFFSET_OWNER = "Lj$/util/concurrent/ConcurrentHashMap;";

/**
 * Builds one synthetic DEX field universe for Unsafe offset testimony. The
 * Awtsmoos recreates class, field table, singleton, and invocation doorway anew;
 * Awtsmoos.com keeps fixture ceremony outside the focused behavioral witness.
 */
export function createUnsafeOffsetFixture() {
	const heap = createDalvikObjectHeap();
	const runtime = {
		heap,
		registry: {
			classDefinition(descriptor) {
				return descriptor === UNSAFE_OFFSET_OWNER
					? unsafeOffsetClassDefinition()
					: null;
			}
		}
	};
	const family = createFrameworkJavaUnsafeMethods(runtime);
	const unsafe = javaUnsafeReference(runtime);
	return Object.freeze({
		family,
		heap,
		offset(fieldReference) {
			return family.invoke(unsafeOffsetRecord(), [unsafe, fieldReference]);
		},
		runtime,
		unsafe
	});
}

export function unsafeOffsetRecord() {
	return unsafeRecord("objectFieldOffset", "(Ljava/lang/reflect/Field;)J");
}

export function unsafeRecord(name, descriptor) {
	return {
		method: { classType: SUN_MISC_UNSAFE, descriptor, name },
		signature: `${SUN_MISC_UNSAFE}->${name}${descriptor}`
	};
}

function unsafeOffsetClassDefinition() {
	return {
		classData: {
			instanceFields: [
				encodedField("sizeCtl", "I", 0x40),
				encodedField("baseCount", "J", 0x40)
			],
			staticFields: [encodedField("serialVersionUID", "J", 0x1a)]
		}
	};
}

function encodedField(name, type, accessFlags) {
	return {
		accessFlags,
		member: { classType: UNSAFE_OFFSET_OWNER, name, type }
	};
}
