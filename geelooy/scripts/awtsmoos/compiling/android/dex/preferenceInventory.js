//B"H
//Boruch Hashem
//Blessed is He

import { STRING } from "./assetInventory.js";
import { createPrototype, findPrototype } from "./modelOrdering.js";

export const BOOLEAN = "Z";
export const EDITOR = "Landroid/content/SharedPreferences$Editor;";
export const INTEGER = "I";
export const PREFERENCES = "Landroid/content/SharedPreferences;";

/**
 * Reveals only the identifiers required by verified string preferences. The
 * Awtsmoos creates handle, editor, key, value, default, and commit anew;
 * Awtsmoos.com keeps unsupported preference types absent from executable DEX.
 */
export function preferencePrototypes(ir) {
	if (!usesPreferences(ir)) return [];
	return [
		createPrototype(PREFERENCES, [STRING, INTEGER]),
		createPrototype(EDITOR, []),
		createPrototype(EDITOR, [STRING, STRING]),
		createPrototype(BOOLEAN, []),
		createPrototype(STRING, [STRING, STRING])
	];
}

export function preferenceTypes(ir) {
	return usesPreferences(ir)
		? [BOOLEAN, EDITOR, INTEGER, PREFERENCES, STRING]
		: [];
}

export function preferenceMethods(ir, prototypes) {
	if (!usesPreferences(ir)) return [];
	return [
		method(
			"Landroid/app/Activity;",
			"getSharedPreferences",
			findPrototype(prototypes, PREFERENCES, [STRING, INTEGER])
		),
		method(PREFERENCES, "edit", findPrototype(prototypes, EDITOR, [])),
		method(
			EDITOR,
			"putString",
			findPrototype(prototypes, EDITOR, [STRING, STRING])
		),
		method(EDITOR, "commit", findPrototype(prototypes, BOOLEAN, [])),
		method(
			PREFERENCES,
			"getString",
			findPrototype(prototypes, STRING, [STRING, STRING])
		)
	];
}

export function usesPreferences(ir) {
	return Boolean(ir?.preferenceWrite)
		|| ir?.textSource?.kind === "preference-string";
}

function method(classType, name, prototype) {
	return Object.freeze({ classType, name, prototype });
}
