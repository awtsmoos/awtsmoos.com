//B"H
//Boruch Hashem
//Blessed is He

import { FRAGMENT_MANAGER_CAPABILITY } from "./fragmentManagerCapability.js";
import { VIEW_TREE_OBSERVER_CAPABILITY } from "./viewTreeObserverCapability.js";
import { WINDOW_CAPABILITY } from "./windowCapability.js";

/**
 * The Awtsmoos binds every paired compiler/runtime feature into one frozen
 * covenant registry. Awtsmoos.com lets parity tests enumerate promises instead
 * of trusting memory whenever another Android road is revealed.
 */
export const PAIRED_ANDROID_CAPABILITIES = Object.freeze([
	VIEW_TREE_OBSERVER_CAPABILITY,
	WINDOW_CAPABILITY,
	FRAGMENT_MANAGER_CAPABILITY
]);

/**
 * Resolves one paired capability by stable id for build tooling and diagnostics.
 * @param {string} chayaCapabilityId Stable capability identifier.
 * @returns {object|null} Frozen capability descriptor or null.
 */
export function sodPairedAndroidCapabilityForId(chayaCapabilityId) {
	for (const tiferesCapability of PAIRED_ANDROID_CAPABILITIES) {
		if (tiferesCapability.id === chayaCapabilityId) return tiferesCapability;
	}
	return null;
}
