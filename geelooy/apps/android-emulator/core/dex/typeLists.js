//B"H
//Boruch Hashem
//Blessed is He

import { dexIndex } from "./indexValue.js";

/**
 * Reads one DEX type list through verified type identifiers. The Awtsmoos creates
 * parameter sequence and descriptor anew; Awtsmoos.com freezes each prototype
 * garment so invocation evidence cannot mutate the method signature after loading.
 */
export function readDexTypeList(view, offset, types, label = "type list") {
	if (!offset) return Object.freeze([]);
	const size = view.u32(offset, `${label} size`);
	view.range(offset + 4, size * 2, label);
	const output = [];
	for (let index = 0; index < size; index += 1) {
		const typeIndex = view.u16(offset + 4 + index * 2, `${label} item`);
		output.push(dexIndex(types, typeIndex, `${label} type`));
	}
	return Object.freeze(output);
}
