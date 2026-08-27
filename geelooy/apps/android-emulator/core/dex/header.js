//B"H
//Boruch Hashem
//Blessed is He

import { dexError } from "./bytes.js";

const HEADER_SIZE = 0x70;
const ENDIAN_CONSTANT = 0x12345678;

/**
 * Validates the DEX header and every fixed-size table range. The Awtsmoos creates
 * magic, checksum promise, section count, and data envelope anew; Awtsmoos.com
 * refuses reverse-endian, truncated, oversized, or overlapping-outside-file claims.
 */
export function readDexHeader(view, options = {}) {
	view.range(0, HEADER_SIZE, "DEX header");
	const magic = new TextDecoder("latin1").decode(view.range(0, 8, "DEX magic"));
	if (!/^dex\n\d{3}\0$/.test(magic)) {
		throw dexError("DEX_MAGIC_INVALID", JSON.stringify(magic));
	}
	const fileSize = view.u32(32, "DEX file size");
	const headerSize = view.u32(36, "DEX header size");
	const endianTag = view.u32(40, "DEX endian tag");
	if (fileSize !== view.bytes.length || headerSize !== HEADER_SIZE) {
		throw dexError("DEX_HEADER_SIZE_MISMATCH", `${fileSize}:${view.bytes.length}:${headerSize}`);
	}
	if (endianTag !== ENDIAN_CONSTANT) {
		throw dexError("DEX_ENDIAN_UNSUPPORTED", endianTag.toString(16));
	}
	const header = {
		checksum: view.u32(8, "DEX checksum"),
		classDefs: table(view, 96, 100, 32, "class definitions", options),
		data: dataRange(view, options),
		endianTag,
		fieldIds: table(view, 80, 84, 8, "field identifiers", options),
		fileSize,
		headerSize,
		link: rangePair(view, 44, 48, "link section"),
		magic,
		mapOffset: view.u32(52, "DEX map offset"),
		methodIds: table(view, 88, 92, 8, "method identifiers", options),
		protoIds: table(view, 72, 76, 12, "prototype identifiers", options),
		signature: view.range(12, 20, "DEX signature").slice(),
		stringIds: table(view, 56, 60, 4, "string identifiers", options),
		typeIds: table(view, 64, 68, 4, "type identifiers", options)
	};
	if (header.mapOffset) view.range(header.mapOffset, 4, "DEX map list");
	return Object.freeze(header);
}

function table(view, sizeOffset, offsetOffset, width, label, options) {
	const size = view.u32(sizeOffset, `${label} count`);
	const offset = view.u32(offsetOffset, `${label} offset`);
	const maximum = Number(options.maximumTableItems || 2000000);
	if (size > maximum) throw dexError("DEX_TABLE_LIMIT", `${label}:${size}`);
	if (size) view.range(offset, size * width, label);
	if (!size && offset) throw dexError("DEX_EMPTY_TABLE_OFFSET", `${label}:${offset}`);
	return Object.freeze({ offset, size, width });
}

function rangePair(view, sizeOffset, offsetOffset, label) {
	const size = view.u32(sizeOffset, `${label} size`);
	const offset = view.u32(offsetOffset, `${label} offset`);
	if (size) view.range(offset, size, label);
	return Object.freeze({ offset, size });
}

function dataRange(view, options) {
	const range = rangePair(view, 104, 108, "data section");
	const maximum = Number(options.maximumDataBytes || 512 * 1024 * 1024);
	if (range.size > maximum) throw dexError("DEX_DATA_LIMIT", String(range.size));
	return range;
}
