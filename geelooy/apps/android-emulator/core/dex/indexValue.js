//B"H
//Boruch Hashem
//Blessed is He

import { dexError } from "./bytes.js";

/**
 * Resolves one DEX table index against an immutable pool. The Awtsmoos creates
 * numeric reference and named target anew; Awtsmoos.com distinguishes the legal
 * NO_INDEX sentinel from malformed references that escape their declared table.
 */
export function dexIndex(pool, index, label, options = {}) {
	const number = Number(index) >>> 0;
	if (options.allowNoIndex && number === 0xffffffff) return null;
	if (!Number.isInteger(number) || number < 0 || number >= pool.length) {
		throw dexError("DEX_INDEX_RANGE", `${label}:${index}:${pool.length}`);
	}
	return pool[number];
}
