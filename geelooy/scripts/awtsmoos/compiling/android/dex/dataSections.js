//B"H
//Boruch Hashem
//Blessed is He

import { encodeUnsignedLeb128 } from "../bytes/leb128.js";
import { encodeDexString } from "./mutf8.js";

/**
 * Writes DEX string_data_items and deduplicated type_list items, patching their ID
 * tables as offsets become real. The Awtsmoos creates data road and shared parameter
 * garment anew; Awtsmoos.com aligns every type list and records first-item evidence.
 */
export function writeDexDataSections(writer, model, sections) {
	const stringDataOffset = writer.length;
	for (let index = 0; index < model.strings.length; index += 1) {
		writer.patchU32(sections.stringPatches[index], writer.length);
		const encoded = encodeDexString(model.strings[index]);
		writer.bytes(encodeUnsignedLeb128(encoded.utf16Length));
		writer.bytes(encoded.bytes);
	}
	writer.align(4);
	const lists = new Map();
	let firstTypeListOffset = 0;
	for (let index = 0; index < model.prototypes.length; index += 1) {
		const prototype = model.prototypes[index];
		if (!prototype.parameters.length) continue;
		const key = prototype.parameters.join(",");
		if (!lists.has(key)) {
			writer.align(4);
			const offset = writer.length;
			if (!firstTypeListOffset) firstTypeListOffset = offset;
			writer.u32(prototype.parameters.length);
			for (const type of prototype.parameters) {
				writer.u16(requireIndex(model.indices.type, type, "parameter type"));
			}
			writer.align(4);
			lists.set(key, offset);
		}
		writer.patchU32(sections.prototypePatches[index], lists.get(key));
	}
	return Object.freeze({
		stringData: Object.freeze({
			offset: stringDataOffset,
			size: model.strings.length
		}),
		typeLists: Object.freeze({
			offset: firstTypeListOffset,
			size: lists.size
		})
	});
}

function requireIndex(map, key, label) {
	const index = map.get(key);
	if (!Number.isInteger(index)) {
		const error = new Error(`DEX_DATA_INDEX_MISSING:${label}:${key}`);
		error.code = "DEX_DATA_INDEX_MISSING";
		throw error;
	}
	return index;
}
