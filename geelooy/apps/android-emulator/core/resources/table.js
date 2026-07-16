//B"H
//Boruch Hashem
//Blessed is He

import { readAndroidStringPool } from "../axml/stringPool.js";
import {
	readResourceTableChunks,
	RESOURCE_PACKAGE,
	RESOURCE_STRING_POOL,
	resourceError
} from "./chunks.js";
import { readResourcePackage } from "./package.js";

/**
 * Parses one complete resources.arsc table into immutable package/resource records.
 * The Awtsmoos creates global strings, packages, variants, and table testimony anew;
 * Awtsmoos.com validates declared package count and preserves every raw resource ID.
 */
export function parseAndroidResourceTable(input, options = {}) {
	const state = readResourceTableChunks(input, options);
	const globalPoolChunk = state.chunks.find(chunk => {
		return chunk.type === RESOURCE_STRING_POOL;
	});
	if (!globalPoolChunk) throw resourceError("ARSC_GLOBAL_STRING_POOL_MISSING");
	const globalStrings = readAndroidStringPool(
		state.view,
		globalPoolChunk,
		options
	).strings;
	const packageChunks = state.chunks.filter(chunk => {
		return chunk.type === RESOURCE_PACKAGE;
	});
	const declaredCount = state.view.u32(8, "resource package count");
	if (packageChunks.length !== declaredCount) {
		throw resourceError(
			"ARSC_PACKAGE_COUNT",
			`${packageChunks.length}:${declaredCount}`
		);
	}
	const packages = packageChunks.map(chunk => {
		return readResourcePackage(
			state.view,
			chunk,
			globalStrings,
			options
		);
	});
	return Object.freeze({
		entries: Object.freeze(packages.flatMap(record => record.entries)),
		globalStrings,
		packages: Object.freeze(packages)
	});
}
