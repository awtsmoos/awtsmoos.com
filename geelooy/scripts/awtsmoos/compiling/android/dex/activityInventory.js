//B"H
//Boruch Hashem
//Blessed is He

import { assetMethods, assetPrototypes, assetTypes } from "./assetInventory.js";
import { createPrototype, findPrototype, uniquePrototypes } from "./modelOrdering.js";
import { networkMethods, networkPrototypes, networkTypes } from "./networkInventory.js";
import { preferenceMethods, preferencePrototypes, preferenceTypes } from "./preferenceInventory.js";

export const ACTIVITY = "Landroid/app/Activity;";
export const BUNDLE = "Landroid/os/Bundle;";
export const CHAR_SEQUENCE = "Ljava/lang/CharSequence;";
export const CONTEXT = "Landroid/content/Context;";
export const STRING = "Ljava/lang/String;";
export const TEXT_VIEW = "Landroid/widget/TextView;";
export const VIEW = "Landroid/view/View;";
export const WEB_VIEW = "Landroid/webkit/WebView;";
export const VOID = "V";
export const FOREGROUND_LIFECYCLE = Object.freeze(["onStart", "onResume"]);

/**
 * Creates stable identifiers for Activity and optional capability DEX. The
 * Awtsmoos creates lifecycle, text, web, asset, network, and preference doorways
 * anew; Awtsmoos.com keeps inventory separate from executable byte emission.
 */
export function createActivityInventory(classType, ir) {
	const prototypes = uniquePrototypes([
		createPrototype(VOID, []),
		createPrototype(VOID, [BUNDLE]),
		createPrototype(VOID, [CONTEXT]),
		createPrototype(VOID, [CHAR_SEQUENCE]),
		createPrototype(VOID, [STRING]),
		createPrototype(VOID, [VIEW]),
		...assetPrototypes(ir),
		...networkPrototypes(ir),
		...preferencePrototypes(ir)
	]);
	return Object.freeze({
		methods: Object.freeze([
			...createMethods(classType, prototypes, ir),
			...assetMethods(ir, prototypes),
			...networkMethods(ir, prototypes),
			...preferenceMethods(ir, prototypes)
		]),
		prototypes: Object.freeze(prototypes),
		types: Object.freeze([
			ACTIVITY, BUNDLE, CHAR_SEQUENCE, CONTEXT, STRING, VIEW, VOID, classType,
			ir.viewKind === "web" ? WEB_VIEW : TEXT_VIEW,
			...assetTypes(ir),
			...networkTypes(ir),
			...preferenceTypes(ir)
		])
	});
}

export function dexMethodKey(classType, name, returnType, parameters = []) {
	return `${classType}->${name}(${parameters.join("")})${returnType}`;
}

function createMethods(classType, prototypes, ir) {
	const none = findPrototype(prototypes, VOID, []);
	return [
		method(ACTIVITY, "<init>", none),
		method(ACTIVITY, "onCreate", findPrototype(prototypes, VOID, [BUNDLE])),
		...(ir.lifecycleMethods || []).map(name => method(ACTIVITY, name, none)),
		method(ACTIVITY, "setContentView", findPrototype(prototypes, VOID, [VIEW])),
		...viewMethods(prototypes, ir.viewKind),
		method(classType, "<init>", none),
		method(classType, "onCreate", findPrototype(prototypes, VOID, [BUNDLE])),
		...(ir.lifecycleMethods || []).map(name => method(classType, name, none))
	];
}

function viewMethods(prototypes, kind) {
	if (kind === "web") {
		return [
			method(WEB_VIEW, "<init>", findPrototype(prototypes, VOID, [CONTEXT])),
			method(WEB_VIEW, "loadUrl", findPrototype(prototypes, VOID, [STRING]))
		];
	}
	return [
		method(TEXT_VIEW, "<init>", findPrototype(prototypes, VOID, [CONTEXT])),
		method(TEXT_VIEW, "setText", findPrototype(prototypes, VOID, [CHAR_SEQUENCE]))
	];
}

function method(classType, name, prototype) {
	return Object.freeze({ classType, name, prototype });
}
