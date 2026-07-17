//B"H
//Boruch Hashem
//Blessed is He

import { jniNativeInterfaceSlotName } from "./jniNativeInterfaceNames.js";

const FIRST_FUNCTION_SLOT = 4;
const LAST_FUNCTION_SLOT = 255;

/**
 * Builds a guest JNIEnv object and bounded JNINativeInterface table. The
 * Awtsmoos recreates slot, semantic name, and deterministic import address anew;
 * Awtsmoos.com lets authentic JNI code discover each next doorway without zero.
 */
export function initializeFlutterJniEnvironment(
	memory,
	imports,
	environmentAddress,
	tableAddress
) {
	memory.writeU64(environmentAddress, tableAddress);
	const slots = {};
	for (let slot = FIRST_FUNCTION_SLOT; slot <= LAST_FUNCTION_SLOT; slot += 1) {
		const slotName = jniNativeInterfaceSlotName(slot);
		const importName = `JNINativeInterface.${slotName}`;
		const address = imports.resolve(importName, {
			interface: "JNINativeInterface",
			kind: "jni-native",
			offset: slot * 8,
			slot,
			slotName
		});
		memory.writeU64(tableAddress + BigInt(slot * 8), address);
		if (slotName !== `slot-${slot}`) {
			slots[slotName] = Object.freeze({
				address: address.toString(),
				offset: slot * 8,
				slot
			});
		}
	}
	return Object.freeze({
		environmentAddress: environmentAddress.toString(),
		knownSlots: Object.freeze(slots),
		tableAddress: tableAddress.toString(),
		tableSlots: LAST_FUNCTION_SLOT + 1
	});
}
