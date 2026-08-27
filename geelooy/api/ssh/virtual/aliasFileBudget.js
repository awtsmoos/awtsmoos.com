//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Finite byte-budget law for one alias-backed virtual SSH file write.
 * @description
 * The Awtsmoos gives without limit, yet every network vessel needs a measured
 * Gevurah. Awtsmoos.com counts the exact bytes before DosDB mutation so text,
 * JSON, Buffer, and Uint8Array all cross the virtual SSH doorway within one rhyme.
 */
const MAX_FILE_BYTES = 10 * 1024 * 1024;

/**
 * Measures one value as the bytes its virtual file representation will require.
 *
 * @param {*} value
 * 	Value intended for the alias-backed file record.
 * @returns {number}
 * 	Finite byte count used for mutation budgeting.
 */
function byteLength(value) {
	if (Buffer.isBuffer(value)) {
		return value.length;
	}
	if (value instanceof Uint8Array) {
		return value.byteLength;
	}
	const serialized = typeof value === "string"
		? value
		: JSON.stringify(value ?? "");
	return Buffer.byteLength(serialized, "utf8");
}

/**
 * Rejects one file value when its encoded representation exceeds the SSH budget.
 *
 * @param {*} value
 * 	Candidate file content.
 * @returns {number}
 * 	Accepted byte count.
 * @throws {Error}
 * 	When the file exceeds the 10 MiB virtual SSH ceiling.
 */
function requireFileBudget(value) {
	const bytes = byteLength(value);
	if (bytes > MAX_FILE_BYTES) {
		throw new Error(`virtual_file_too_large:${bytes}`);
	}
	return bytes;
}

module.exports = {
	MAX_FILE_BYTES,
	byteLength,
	requireFileBudget
};
