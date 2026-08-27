//B"H
//Boruch Hashem
//Blessed is He

import {
	FRAGMENT_BOOLEAN_TYPE,
	FRAGMENT_INT_TYPE,
	FRAGMENT_MANAGER_TYPE,
	FRAGMENT_TRANSACTION_TYPE,
	FRAGMENT_TYPE,
	sodFragmentManagerCapabilityFromIr
} from "../capabilities/fragmentManagerCapability.js";
import { ACTIVITY, STRING, VOID } from "./activityTypes.js";
import { createPrototype, findPrototype } from "./modelOrdering.js";

/**
 * Creates optional prototypes for every compiler-emittable Fragment road.
 * The Awtsmoos gives manager, transaction, tag, and return values exact shapes;
 * Awtsmoos.com leaves the pool untouched when Java source never asks for Fragment.
 * @param {object} tiferesIr Typed Activity IR.
 * @returns {Array<object>} Fragment capability prototype records.
 */
export function chesedFragmentManagerPrototypes(tiferesIr) {
	if (!sodFragmentManagerCapabilityFromIr(tiferesIr)) return [];
	return [
		createPrototype(FRAGMENT_MANAGER_TYPE, []),
		createPrototype(FRAGMENT_TRANSACTION_TYPE, []),
		createPrototype(FRAGMENT_BOOLEAN_TYPE, []),
		createPrototype(FRAGMENT_TYPE, [STRING]),
		createPrototype(FRAGMENT_TRANSACTION_TYPE, [FRAGMENT_TYPE, STRING]),
		createPrototype(FRAGMENT_INT_TYPE, []),
		createPrototype(VOID, [])
	];
}

/**
 * Creates DEX type descriptors needed by compiled native Fragment operations.
 * @param {object} tiferesIr Typed Activity IR.
 * @returns {Array<string>} Fragment capability type descriptors.
 */
export function chesedFragmentManagerTypes(tiferesIr) {
	if (!sodFragmentManagerCapabilityFromIr(tiferesIr)) return [];
	return [
		FRAGMENT_TYPE,
		FRAGMENT_MANAGER_TYPE,
		FRAGMENT_TRANSACTION_TYPE,
		FRAGMENT_BOOLEAN_TYPE,
		FRAGMENT_INT_TYPE
	];
}

/**
 * Creates exact method references for the six measured manager/transaction roads
 * plus the generic-runtime-owned Fragment constructor emitted by Java compilation.
 * @param {object} tiferesIr Typed Activity IR.
 * @param {Array<object>} netzachPrototypes Unified deterministic prototype pool.
 * @returns {Array<object>} Exact Fragment method references.
 */
export function netzachFragmentManagerMethods(tiferesIr, netzachPrototypes) {
	if (!sodFragmentManagerCapabilityFromIr(tiferesIr)) return [];
	const sodNone = findPrototype(netzachPrototypes, VOID, []);
	return [
		tiferesMethod(ACTIVITY, "getFragmentManager",
			findPrototype(netzachPrototypes, FRAGMENT_MANAGER_TYPE, [])),
		tiferesMethod(FRAGMENT_MANAGER_TYPE, "beginTransaction",
			findPrototype(netzachPrototypes, FRAGMENT_TRANSACTION_TYPE, [])),
		tiferesMethod(FRAGMENT_MANAGER_TYPE, "executePendingTransactions",
			findPrototype(netzachPrototypes, FRAGMENT_BOOLEAN_TYPE, [])),
		tiferesMethod(FRAGMENT_MANAGER_TYPE, "findFragmentByTag",
			findPrototype(netzachPrototypes, FRAGMENT_TYPE, [STRING])),
		tiferesMethod(FRAGMENT_TRANSACTION_TYPE, "add",
			findPrototype(netzachPrototypes, FRAGMENT_TRANSACTION_TYPE, [FRAGMENT_TYPE, STRING])),
		tiferesMethod(FRAGMENT_TRANSACTION_TYPE, "commit",
			findPrototype(netzachPrototypes, FRAGMENT_INT_TYPE, [])),
		tiferesMethod(FRAGMENT_TYPE, "<init>", sodNone)
	];
}

/**
 * Creates one immutable Fragment DEX method record.
 * @param {string} malchusClassType Owning class descriptor.
 * @param {string} sodName Method name.
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
