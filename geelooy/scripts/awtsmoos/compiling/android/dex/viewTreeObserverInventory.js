//B"H
//Boruch Hashem
//Blessed is He

import {
	VIEW_TREE_OBSERVER_BOOLEAN,
	VIEW_TREE_OBSERVER_TYPE,
	sodViewTreeObserverCapabilityFromIr
} from "../capabilities/viewTreeObserverCapability.js";
import { VIEW } from "./activityTypes.js";
import { createPrototype, findPrototype } from "./modelOrdering.js";

/**
 * Creates prototypes required by source operations that touch ViewTreeObserver.
 * The Awtsmoos keeps the observer return and boolean probe shapes conditional;
 * Awtsmoos.com does not enlarge an APK's DEX pool for a capability source omitted.
 * @param {object} tiferesIr Typed Activity IR.
 * @returns {Array<object>} Optional observer prototype records.
 */
export function chesedViewTreeObserverPrototypes(tiferesIr) {
	const chayaCapability = sodViewTreeObserverCapabilityFromIr(tiferesIr);
	if (!chayaCapability) return [];
	const netzachPrototypes = [createPrototype(VIEW_TREE_OBSERVER_TYPE, [])];
	if (chaiUsesAliveProbe(chayaCapability)) {
		netzachPrototypes.push(createPrototype(VIEW_TREE_OBSERVER_BOOLEAN, []));
	}
	return netzachPrototypes;
}

/**
 * Creates optional type descriptors needed by emitted observer instructions.
 * @param {object} tiferesIr Typed Activity IR.
 * @returns {Array<string>} Observer and optional boolean type descriptors.
 */
export function chesedViewTreeObserverTypes(tiferesIr) {
	const chayaCapability = sodViewTreeObserverCapabilityFromIr(tiferesIr);
	if (!chayaCapability) return [];
	const netzachTypes = [VIEW_TREE_OBSERVER_TYPE];
	if (chaiUsesAliveProbe(chayaCapability)) netzachTypes.push(VIEW_TREE_OBSERVER_BOOLEAN);
	return netzachTypes;
}

/**
 * Creates exact framework method references mirrored by the emulator capability.
 * @param {object} tiferesIr Typed Activity IR carrying ordered capability ops.
 * @param {Array<object>} netzachPrototypes Unified prototype pool.
 * @returns {Array<object>} Method refs for getViewTreeObserver and optional isAlive.
 */
export function netzachViewTreeObserverMethods(tiferesIr, netzachPrototypes) {
	const chayaCapability = sodViewTreeObserverCapabilityFromIr(tiferesIr);
	if (!chayaCapability) return [];
	const netzachMethods = [tiferesMethod(
		VIEW,
		"getViewTreeObserver",
		findPrototype(netzachPrototypes, VIEW_TREE_OBSERVER_TYPE, [])
	)];
	if (chaiUsesAliveProbe(chayaCapability)) {
		netzachMethods.push(tiferesMethod(
			VIEW_TREE_OBSERVER_TYPE,
			"isAlive",
			findPrototype(netzachPrototypes, VIEW_TREE_OBSERVER_BOOLEAN, [])
		));
	}
	return netzachMethods;
}

/**
 * Reports whether any preserved source operation invokes `isAlive()` after get.
 * @param {{operations:Array<string>}} chayaCapability Observer capability record.
 * @returns {boolean} True when boolean prototype/method inventory is required.
 */
function chaiUsesAliveProbe(chayaCapability) {
	for (const sodOperation of chayaCapability.operations) {
		if (sodOperation === "get-is-alive") return true;
	}
	return false;
}

/**
 * Creates one immutable optional DEX method record.
 * @param {string} malchusClassType Owning class descriptor.
 * @param {string} sodName Framework method name.
 * @param {object} tiferesPrototype Resolved DEX prototype.
 * @returns {object} Frozen method description.
 */
function tiferesMethod(malchusClassType, sodName, tiferesPrototype) {
	return Object.freeze({ classType: malchusClassType, name: sodName, prototype: tiferesPrototype });
}
