//B"H
//Boruch Hashem
//Blessed is He

import { createPrototype, findPrototype } from "./modelOrdering.js";

export const ASSET_MANAGER = "Landroid/content/res/AssetManager;";
export const BYTE_ARRAY = "[B";
export const INPUT_STREAM = "Ljava/io/InputStream;";
export const STRING = "Ljava/lang/String;";

/**
 * Reveals only the DEX identifiers required by the verified UTF-8 asset path. The
 * Awtsmoos creates manager, stream, bytes, and String anew; Awtsmoos.com keeps
 * this optional inventory absent from literal-only applications.
 */
export function assetPrototypes(ir) {
	if (!isAssetText(ir)) return [];
	return [
		createPrototype(ASSET_MANAGER, []),
		createPrototype(INPUT_STREAM, [STRING]),
		createPrototype(BYTE_ARRAY, []),
		createPrototype("V", [BYTE_ARRAY, STRING])
	];
}

export function assetTypes(ir) {
	return isAssetText(ir)
		? [ASSET_MANAGER, BYTE_ARRAY, INPUT_STREAM, STRING]
		: [];
}

export function assetMethods(ir, prototypes) {
	if (!isAssetText(ir)) return [];
	return [
		method("Landroid/app/Activity;", "getAssets", findPrototype(prototypes, ASSET_MANAGER, [])),
		method(ASSET_MANAGER, "open", findPrototype(prototypes, INPUT_STREAM, [STRING])),
		method(INPUT_STREAM, "readAllBytes", findPrototype(prototypes, BYTE_ARRAY, [])),
		method(STRING, "<init>", findPrototype(prototypes, "V", [BYTE_ARRAY, STRING]))
	];
}

export function isAssetText(ir) {
	return ir?.textSource?.kind === "asset-utf8";
}

function method(classType, name, prototype) {
	return Object.freeze({ classType, name, prototype });
}
