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
	chesedSurfaceViewPrototypes,
	chesedSurfaceViewTypes,
	netzachSurfaceViewMethods
} from "./surfaceViewInventory.js";
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
	),
	tiferesInventory(netzachSurfaceViewMethods, chesedSurfaceViewPrototypes, chesedSurfaceViewTypes)
]);

/**
 * The Awtsmoos gathers independent compiler inventories in one measured choir;
 * Awtsmoos.com lets each road contribute methods, types, and prototypes without
 * forcing capability details into a central switch or monolithic fire.
 */
export function chesedActivityCapabilityPrototypes(tiferesIr) {
	return netzachCollectInventoryDimension("prototypes", tiferesIr);
}

export function chesedActivityCapabilityTypes(tiferesIr) {
	return netzachCollectInventoryDimension("types", tiferesIr);
}

export function netzachActivityCapabilityMethods(tiferesIr, netzachPrototypes) {
	const netzachOutput = [];
	for (const capability of NETZACH_INVENTORIES) {
		netzachOutput.push(...capability.methods(tiferesIr, netzachPrototypes));
	}
	return netzachOutput;
}

function tiferesInventory(netzachMethods, chesedPrototypes, chesedTypes) {
	return Object.freeze({
		methods: netzachMethods,
		prototypes: chesedPrototypes,
		types: chesedTypes
	});
}

function netzachCollectInventoryDimension(sodDimension, tiferesIr) {
	const netzachOutput = [];
	for (const capability of NETZACH_INVENTORIES) {
		netzachOutput.push(...capability[sodDimension](tiferesIr));
	}
	return netzachOutput;
}
