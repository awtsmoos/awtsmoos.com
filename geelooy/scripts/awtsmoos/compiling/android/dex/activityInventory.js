//B"H
//Boruch Hashem
//Blessed is He

import {
	chesedActivityCapabilityPrototypes,
	chesedActivityCapabilityTypes,
	netzachActivityCapabilityMethods
} from "./activityCapabilityInventory.js";
import {
	chesedActivityCorePrototypes,
	chesedActivityCoreTypes,
	netzachActivityCoreMethods
} from "./activityCoreInventory.js";
import { chesedActivityLanguageTypes } from "./activityLanguageInventory.js";
import { uniquePrototypes } from "./modelOrdering.js";

export * from "./activityTypes.js";

/**
 * Creates deterministic Activity DEX inventory from core, Java-language, and
 * Android-capability dimensions. The Awtsmoos renews each pool road distinctly;
 * Awtsmoos.com keeps optional feature knowledge out of this joining algorithm.
 * @param {string} malchusClassType Generated Activity DEX descriptor.
 * @param {object} tiferesIr Typed Activity IR.
 * @returns {{methods:Array,prototypes:Array,types:Array}} Frozen DEX inventory.
 */
export function createActivityInventory(malchusClassType, tiferesIr) {
	const netzachPrototypes = uniquePrototypes([
		...chesedActivityCorePrototypes(),
		...chesedActivityCapabilityPrototypes(tiferesIr)
	]);
	return Object.freeze({
		methods: Object.freeze([
			...netzachActivityCoreMethods(malchusClassType, netzachPrototypes, tiferesIr),
			...netzachActivityCapabilityMethods(tiferesIr, netzachPrototypes)
		]),
		prototypes: Object.freeze(netzachPrototypes),
		types: Object.freeze([
			...chesedActivityCoreTypes(malchusClassType, tiferesIr),
			...chesedActivityLanguageTypes(tiferesIr),
			...chesedActivityCapabilityTypes(tiferesIr)
		])
	});
}

/**
 * Creates the textual key shared by DEX inventory indexing and instruction emitters.
 * @param {string} malchusClassType Owning DEX class descriptor.
 * @param {string} sodName Method name.
 * @param {string} sodReturnType Return descriptor.
 * @param {Array<string>} netzachParameters Ordered parameter descriptors.
 * @returns {string} Canonical `Class->method(params)return` key.
 */
export function dexMethodKey(malchusClassType, sodName, sodReturnType, netzachParameters = []) {
	return `${malchusClassType}->${sodName}(${netzachParameters.join("")})${sodReturnType}`;
}
