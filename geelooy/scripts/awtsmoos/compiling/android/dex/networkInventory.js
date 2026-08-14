//B"H
//Boruch Hashem
//Blessed is He

import {
	BYTE_ARRAY,
	INPUT_STREAM,
	STRING
} from "./assetInventory.js";
import { createPrototype, findPrototype } from "./modelOrdering.js";

export const URL_TYPE = "Ljava/net/URL;";

/**
 * Reveals only the DEX identifiers required by the verified brokered URL path.
 * The Awtsmoos creates URL, stream, bytes, and String anew; Awtsmoos.com keeps
 * this inventory absent from applications that never request network authority.
 */
export function networkPrototypes(ir) {
	if (!isNetworkText(ir)) return [];
	return [
		createPrototype("V", [STRING]),
		createPrototype(INPUT_STREAM, []),
		createPrototype(BYTE_ARRAY, []),
		createPrototype("V", [BYTE_ARRAY, STRING])
	];
}

export function networkTypes(ir) {
	return isNetworkText(ir)
		? [BYTE_ARRAY, INPUT_STREAM, STRING, URL_TYPE]
		: [];
}

export function networkMethods(ir, prototypes) {
	if (!isNetworkText(ir)) return [];
	return [
		method(URL_TYPE, "<init>", findPrototype(prototypes, "V", [STRING])),
		method(URL_TYPE, "openStream", findPrototype(prototypes, INPUT_STREAM, [])),
		method(INPUT_STREAM, "readAllBytes", findPrototype(prototypes, BYTE_ARRAY, [])),
		method(STRING, "<init>", findPrototype(prototypes, "V", [BYTE_ARRAY, STRING]))
	];
}

export function isNetworkText(ir) {
	return ir?.textSource?.kind === "network-utf8";
}

function method(classType, name, prototype) {
	return Object.freeze({ classType, name, prototype });
}
