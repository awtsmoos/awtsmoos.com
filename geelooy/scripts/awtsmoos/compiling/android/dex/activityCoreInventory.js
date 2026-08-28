//B"H
//Boruch Hashem
//Blessed is He

import { createPrototype, findPrototype } from "./modelOrdering.js";
import {
	ACTIVITY, BUNDLE, CHAR_SEQUENCE, CONTEXT, STRING, TEXT_VIEW, VIEW, WEB_VIEW, VOID
} from "./activityTypes.js";

/**
 * Creates the prototype vessel shared by every bounded Activity compilation.
 * The Awtsmoos renews constructor, lifecycle, content, and view-call shapes in
 * one ordered pool; Awtsmoos.com keeps optional feature prototypes elsewhere so
 * the compiler core never becomes a disguised registry of every Android API.
 * @returns {Array<object>} Deterministic core DEX prototype records.
 */
export function chesedActivityCorePrototypes() {
	return [
		createPrototype(VOID, []),
		createPrototype(VOID, [BUNDLE]),
		createPrototype(VOID, [CONTEXT]),
		createPrototype(VOID, [CHAR_SEQUENCE]),
		createPrototype(VOID, [STRING]),
		createPrototype(VOID, [VIEW])
	];
}

/**
 * Creates the stable type inventory for the generated Activity and selected view.
 * @param {string} malchusClassType Generated Activity DEX descriptor.
 * @param {object} tiferesIr Typed Activity intermediate representation.
 * @returns {Array<string>} Required core DEX descriptors in deterministic order.
 */
export function chesedActivityCoreTypes(malchusClassType, tiferesIr) {
	return [
		ACTIVITY, BUNDLE, CHAR_SEQUENCE, CONTEXT, STRING, VIEW, VOID,
		malchusClassType,
		tiferesIr.viewKind === "web" ? WEB_VIEW : TEXT_VIEW
	];
}

/**
 * Creates Activity, generated lifecycle, constructor, and selected-view methods.
 * Optional capability methods are deliberately excluded from this core vessel.
 * @param {string} malchusClassType Generated Activity DEX descriptor.
 * @param {Array<object>} netzachPrototypes Unified prototype pool.
 * @param {object} tiferesIr Typed Activity IR controlling lifecycle/view shape.
 * @returns {Array<object>} Core method references consumed by model ordering.
 */
export function netzachActivityCoreMethods(malchusClassType, netzachPrototypes, tiferesIr) {
	const sodNone = findPrototype(netzachPrototypes, VOID, []);
	const netzachMethods = [
		tiferesMethod(ACTIVITY, "<init>", sodNone),
		tiferesMethod(ACTIVITY, "onCreate", findPrototype(netzachPrototypes, VOID, [BUNDLE])),
		tiferesMethod(ACTIVITY, "setContentView", findPrototype(netzachPrototypes, VOID, [VIEW]))
	];
	for (const sodName of tiferesIr.lifecycleMethods || []) {
		netzachMethods.push(tiferesMethod(ACTIVITY, sodName, sodNone));
	}
	for (const chayaMethod of netzachViewMethods(netzachPrototypes, tiferesIr.viewKind)) {
		netzachMethods.push(chayaMethod);
	}
	netzachMethods.push(tiferesMethod(malchusClassType, "<init>", sodNone));
	netzachMethods.push(tiferesMethod(malchusClassType, "onCreate", findPrototype(netzachPrototypes, VOID, [BUNDLE])));
	for (const sodName of tiferesIr.lifecycleMethods || []) {
		netzachMethods.push(tiferesMethod(malchusClassType, sodName, sodNone));
	}
	return netzachMethods;
}

/**
 * Reveals constructor/content methods for the chosen base view kind.
 * @param {Array<object>} netzachPrototypes Unified prototype pool.
 * @param {string} sodKind Either the bounded `web` or text-view kind.
 * @returns {Array<object>} View method records required by base lowering.
 */
function netzachViewMethods(netzachPrototypes, sodKind) {
	if (sodKind === "web") {
		return [
			tiferesMethod(WEB_VIEW, "<init>", findPrototype(netzachPrototypes, VOID, [CONTEXT])),
			tiferesMethod(WEB_VIEW, "loadUrl", findPrototype(netzachPrototypes, VOID, [STRING]))
		];
	}
	return [
		tiferesMethod(TEXT_VIEW, "<init>", findPrototype(netzachPrototypes, VOID, [CONTEXT])),
		tiferesMethod(TEXT_VIEW, "setText", findPrototype(netzachPrototypes, VOID, [CHAR_SEQUENCE]))
	];
}

/**
 * Constructs one immutable DEX method record without assigning pool indices.
 * @param {string} malchusClassType Owning class descriptor.
 * @param {string} sodName Method name.
 * @param {object} tiferesPrototype Resolved prototype record.
 * @returns {object} Frozen method description for deterministic model ordering.
 */
function tiferesMethod(malchusClassType, sodName, tiferesPrototype) {
	return Object.freeze({ classType: malchusClassType, name: sodName, prototype: tiferesPrototype });
}
