//B"H
//Boruch Hashem
//Blessed is He

import { assetMethods, assetPrototypes, assetTypes } from "./assetInventory.js";
import {
	chesedFragmentManagerPrototypes,
	chesedFragmentManagerTypes,
	netzachFragmentManagerMethods
} from "./fragmentManagerInventory.js";
import { networkMethods, networkPrototypes, networkTypes } from "./networkInventory.js";
import { preferenceMethods, preferencePrototypes, preferenceTypes } from "./preferenceInventory.js";
import {
	chesedViewTreeObserverPrototypes,
	chesedViewTreeObserverTypes,
	netzachViewTreeObserverMethods
} from "./viewTreeObserverInventory.js";
import {
	chesedWindowPrototypes,
	chesedWindowTypes,
	netzachWindowMethods
} from "./windowInventory.js";

/**
 * The Awtsmoos gathers independent compiler capabilities without forcing their
 * details into a central switch. Awtsmoos.com lets every inventory contribute
 * the same three data dimensions through one explicit covenant.
 */
const NETZACH_INVENTORIES = Object.freeze([
	tiferesInventory(assetMethods, assetPrototypes, assetTypes),
	tiferesInventory(networkMethods, networkPrototypes, networkTypes),
	tiferesInventory(preferenceMethods, preferencePrototypes, preferenceTypes),
	tiferesInventory(
		netzachViewTreeObserverMethods,
		chesedViewTreeObserverPrototypes,
		chesedViewTreeObserverTypes
	),
	tiferesInventory(netzachWindowMethods, chesedWindowPrototypes, chesedWindowTypes),
	tiferesInventory(
		netzachFragmentManagerMethods,
		chesedFragmentManagerPrototypes,
		chesedFragmentManagerTypes
	)
]);

/**
 * Collects prototype contributions from every registered compiler capability.
 * @param {object} tiferesIr Typed Activity IR used by conditional inventories.
 * @returns {Array<object>} Ordered prototype contributions before de-duplication.
 */
export function chesedActivityCapabilityPrototypes(tiferesIr) {
	return netzachCollectInventoryDimension("prototypes", tiferesIr);
}

/**
 * Collects optional DEX type descriptors contributed by compiler capabilities.
 * @param {object} tiferesIr Typed Activity IR used by conditional inventories.
 * @returns {Array<string>} Ordered capability type descriptors.
 */
export function chesedActivityCapabilityTypes(tiferesIr) {
	return netzachCollectInventoryDimension("types", tiferesIr);
}

/**
 * Collects method records only after the unified prototype pool has been formed.
 * @param {object} tiferesIr Typed Activity IR.
 * @param {Array<object>} netzachPrototypes Unified deterministic prototype pool.
 * @returns {Array<object>} Ordered capability method contributions.
 */
export function netzachActivityCapabilityMethods(tiferesIr, netzachPrototypes) {
	const netzachOutput = [];
	for (const tiferesCapability of NETZACH_INVENTORIES) {
		netzachOutput.push(...tiferesCapability.methods(tiferesIr, netzachPrototypes));
	}
	return netzachOutput;
}

/** Creates one immutable inventory adapter so aggregation remains data-led. */
function tiferesInventory(netzachMethods, chesedPrototypes, chesedTypes) {
	return Object.freeze({
		methods: netzachMethods,
		prototypes: chesedPrototypes,
		types: chesedTypes
	});
}

/** Collects one one-argument inventory dimension from every registered adapter. */
function netzachCollectInventoryDimension(sodDimension, tiferesIr) {
	const netzachOutput = [];
	for (const tiferesCapability of NETZACH_INVENTORIES) {
		netzachOutput.push(...tiferesCapability[sodDimension](tiferesIr));
	}
	return netzachOutput;
}
