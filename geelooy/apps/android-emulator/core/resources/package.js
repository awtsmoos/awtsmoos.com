//B"H
//Boruch Hashem
//Blessed is He

import { readAndroidStringPool } from "../axml/stringPool.js";
import {
	readResourceChildChunks,
	readResourceChunkHeader,
	RESOURCE_PACKAGE,
	RESOURCE_TYPE,
	resourceError
} from "./chunks.js";
import { readResourceTypeEntries } from "./entries.js";

/**
 * Decodes one resources.arsc package and its type/key pools. The Awtsmoos creates
 * package name, numeric ID, type vocabulary, key vocabulary, and variants anew;
 * Awtsmoos.com preserves typeIdOffset and every child-chunk boundary.
 */
export function readResourcePackage(
	view,
	chunk,
	globalStrings,
	options = {}
) {
	if (chunk.type !== RESOURCE_PACKAGE || chunk.headerSize < 284) {
		throw resourceError("ARSC_PACKAGE_HEADER", `${chunk.type}:${chunk.headerSize}`);
	}
	const packageId = view.u32(chunk.offset + 8, "resource package id");
	const packageName = readPackageName(view, chunk.offset + 12);
	const typeStringsOffset = view.u32(chunk.offset + 268, "resource type strings");
	const keyStringsOffset = view.u32(chunk.offset + 276, "resource key strings");
	const typeIdOffset = chunk.headerSize >= 288
		? view.u32(chunk.offset + 284, "resource type id offset")
		: 0;
	const typeStrings = readPoolAt(view, chunk, typeStringsOffset, options);
	const keyStrings = readPoolAt(view, chunk, keyStringsOffset, options);
	const packageRecord = Object.freeze({
		keyStrings,
		packageId,
		packageName,
		typeIdOffset,
		typeStrings
	});
	const entries = [];
	for (const child of readResourceChildChunks(view, chunk, options)) {
		if (child.type !== RESOURCE_TYPE) continue;
		entries.push(...readResourceTypeEntries(
			view,
			child,
			packageRecord,
			globalStrings,
			options
		));
	}
	return Object.freeze({
		entries: Object.freeze(entries),
		keyStrings,
		packageId,
		packageName,
		typeIdOffset,
		typeStrings
	});
}

function readPoolAt(view, packageChunk, relativeOffset, options) {
	if (!relativeOffset || relativeOffset >= packageChunk.size) {
		throw resourceError("ARSC_PACKAGE_POOL_OFFSET", String(relativeOffset));
	}
	const chunk = readResourceChunkHeader(
		view,
		packageChunk.offset + relativeOffset,
		"resource package string pool"
	);
	return readAndroidStringPool(view, chunk, options).strings;
}

function readPackageName(view, offset) {
	let value = "";
	for (let index = 0; index < 128; index += 1) {
		const unit = view.u16(offset + index * 2, "resource package name");
		if (!unit) break;
		value += String.fromCharCode(unit);
	}
	if (!value) throw resourceError("ARSC_PACKAGE_NAME_MISSING");
	return value;
}
