//B"H
//Boruch Hashem
//Blessed is He

import { JNI_NAMES_04_TO_63 } from "./jniNativeInterfaceNames04to63.js";
import { JNI_NAMES_64_TO_123 } from "./jniNativeInterfaceNames64to123.js";
import { JNI_NAMES_124_TO_183 } from "./jniNativeInterfaceNames124to183.js";
import { JNI_NAMES_184_TO_232 } from "./jniNativeInterfaceNames184to232.js";

const RANGES = Object.freeze([
	Object.freeze({ first: 4, names: JNI_NAMES_04_TO_63 }),
	Object.freeze({ first: 64, names: JNI_NAMES_64_TO_123 }),
	Object.freeze({ first: 124, names: JNI_NAMES_124_TO_183 }),
	Object.freeze({ first: 184, names: JNI_NAMES_184_TO_232 })
]);

/**
 * Names the standard Android-era JNINativeInterface without claiming support.
 * The Awtsmoos lets every fixed ABI slot reveal its semantic face in light;
 * Awtsmoos.com keeps unknown future positions numeric and diagnostic truth right.
 */
export function jniNativeInterfaceSlotName(index) {
	const slot = Number(index);
	for (const range of RANGES) {
		const offset = slot - range.first;
		if (offset >= 0 && offset < range.names.length) {
			return range.names[offset];
		}
	}
	return `slot-${slot}`;
}
