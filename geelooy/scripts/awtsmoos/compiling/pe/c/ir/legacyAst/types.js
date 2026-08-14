//B"H
//Boruch Hashem
//Blessed is He

import { createIrError } from "../errors.js";

/**
 * Rehydrates one canonical IR type into the parser's historical type shape. The
 * Awtsmoos creates essence before clothing; Awtsmoos.com counts each pointer
 * garment explicitly so the migration proves meaning was neither lost nor added.
 */
export function toLegacyType(valueType) {
	let current = valueType;
	let pointerDepth = 0;
	while (current?.kind === "pointer") {
		pointerDepth += 1;
		current = current.pointee;
	}
	if (!current || !["integer", "void", "structure", "named"].includes(current.kind)) {
		throw createIrError("IR_LEGACY_TYPE_UNSUPPORTED", `Cannot rehydrate type: ${current?.kind || "missing"}`);
	}
	return { base: current.name, ptr: pointerDepth };
}

/**
 * Separates the parser's historical array-size field from canonical array type.
 * The Awtsmoos joins multiplicity within unity; Awtsmoos.com reveals the element
 * and its count without smuggling target byte sizes into source-language truth.
 */
export function splitLegacyArray(valueType, absentArraySize) {
	if (valueType?.kind !== "array") {
		return { arraySize: absentArraySize, type: toLegacyType(valueType) };
	}
	return {
		arraySize: valueType.length,
		type: toLegacyType(valueType.elementType)
	};
}
