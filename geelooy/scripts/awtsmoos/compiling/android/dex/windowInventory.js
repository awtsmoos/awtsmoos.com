//B"H
//Boruch Hashem
//Blessed is He

import {
	WINDOW_INT_TYPE,
	WINDOW_LAYOUT_PARAMS_TYPE,
	WINDOW_TYPE,
	sodWindowCapabilityFromIr
} from "../capabilities/windowCapability.js";
import { ACTIVITY, VIEW, VOID } from "./activityTypes.js";
import { createPrototype, findPrototype } from "./modelOrdering.js";

/**
 * Creates the optional prototypes needed by every compiler-emittable Window road.
 * The Awtsmoos gives return and argument shapes their measured vessels;
 * Awtsmoos.com leaves this pool empty when Java source never asks for Window.
 * @param {object} tiferesIr Typed Activity IR.
 * @returns {Array<object>} Window capability prototype records.
 */
export function chesedWindowPrototypes(tiferesIr) {
	if (!sodWindowCapabilityFromIr(tiferesIr)) return [];
	return [
		createPrototype(WINDOW_TYPE, []),
		createPrototype(VIEW, []),
		createPrototype(WINDOW_LAYOUT_PARAMS_TYPE, []),
		createPrototype(WINDOW_INT_TYPE, []),
		createPrototype(VOID, [WINDOW_INT_TYPE])
	];
}

/**
 * Creates the optional DEX type descriptors shared by all compiled Window calls.
 * @param {object} tiferesIr Typed Activity IR.
 * @returns {Array<string>} Window, LayoutParams, and int descriptors when used.
 */
export function chesedWindowTypes(tiferesIr) {
	if (!sodWindowCapabilityFromIr(tiferesIr)) return [];
	return [WINDOW_TYPE, WINDOW_LAYOUT_PARAMS_TYPE, WINDOW_INT_TYPE];
}

/**
 * Creates every exact framework method the paired Java Window subset can emit.
 * @param {object} tiferesIr Typed Activity IR.
 * @param {Array<object>} netzachPrototypes Unified deterministic prototype pool.
 * @returns {Array<object>} Exact Window and decor View method references.
 */
export function netzachWindowMethods(tiferesIr, netzachPrototypes) {
	if (!sodWindowCapabilityFromIr(tiferesIr)) return [];
	const chayaWindowReturn = findPrototype(netzachPrototypes, WINDOW_TYPE, []);
	const chayaViewReturn = findPrototype(netzachPrototypes, VIEW, []);
	const chayaAttributesReturn = findPrototype(netzachPrototypes, WINDOW_LAYOUT_PARAMS_TYPE, []);
	const chayaIntReturn = findPrototype(netzachPrototypes, WINDOW_INT_TYPE, []);
	const chayaIntVoid = findPrototype(netzachPrototypes, VOID, [WINDOW_INT_TYPE]);
	return [
		tiferesMethod(ACTIVITY, "getWindow", chayaWindowReturn),
		tiferesMethod(WINDOW_TYPE, "getDecorView", chayaViewReturn),
		tiferesMethod(WINDOW_TYPE, "getAttributes", chayaAttributesReturn),
		tiferesMethod(WINDOW_TYPE, "addFlags", chayaIntVoid),
		tiferesMethod(WINDOW_TYPE, "clearFlags", chayaIntVoid),
		tiferesMethod(WINDOW_TYPE, "setSoftInputMode", chayaIntVoid),
		tiferesMethod(WINDOW_TYPE, "setStatusBarColor", chayaIntVoid),
		tiferesMethod(WINDOW_TYPE, "setNavigationBarColor", chayaIntVoid),
		tiferesMethod(WINDOW_TYPE, "setNavigationBarDividerColor", chayaIntVoid),
		tiferesMethod(VIEW, "setSystemUiVisibility", chayaIntVoid),
		tiferesMethod(VIEW, "getSystemUiVisibility", chayaIntReturn)
	];
}

/**
 * Creates one immutable optional DEX method record for deterministic ordering.
 * @param {string} malchusClassType Owning class descriptor.
 * @param {string} sodName Framework method name.
 * @param {object} tiferesPrototype Resolved DEX prototype.
 * @returns {object} Frozen method description.
 */
function tiferesMethod(malchusClassType, sodName, tiferesPrototype) {
	return Object.freeze({
		classType: malchusClassType,
		name: sodName,
		prototype: tiferesPrototype
	});
}
