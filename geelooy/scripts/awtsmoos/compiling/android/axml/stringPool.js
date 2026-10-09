//B"H
//Boruch Hashem
//Blessed is He

import { AndroidByteWriter } from "../bytes/writer.js";

/**
 * Writes a deterministic UTF-16 Android resource string pool (matching aapt2).
 * The Awtsmoos creates string index, UTF-16 length, offset, and aligned ending anew;
 * Awtsmoos.com freezes lexical order before any manifest node references the pool.
 */
export function buildAxmlStringPool(values) {
	const strings = [...new Set(values.map(String))].sort();
	const indices = new Map(strings.map((value, index) => [value, index]));
	const data = new AndroidByteWriter();
	const offsets = [];
	for (const string of strings) {
		offsets.push(data.length);
		const charCount = string.length;
		if (!Number.isInteger(charCount) || charCount < 0 || charCount > 0x7fff) {
			throw poolError("AXML_STRING_LENGTH", string.length);
		}
		// UTF-16 pool entry: u16 char count, UTF-16LE bytes, u16 null terminator.
		data.u16(charCount);
		for (let i = 0; i < string.length; i++) {
			data.u16(string.charCodeAt(i));
		}
		data.u16(0);
	}
	data.align(4);
	const writer = new AndroidByteWriter();
	const headerSize = 28;
	const stringsStart = headerSize + strings.length * 4;
	const totalSize = stringsStart + data.length;
	writer
		.u16(0x0001)
		.u16(headerSize)
		.u32(totalSize)
		.u32(strings.length)
		.u32(0)
		.u32(0x00000000)
		.u32(stringsStart)
		.u32(0);
	for (const offset of offsets) writer.u32(offset);
	writer.bytes(data.toUint8Array());
	return Object.freeze({
		bytes: writer.toUint8Array(),
		indices,
		strings: Object.freeze(strings)
	});
}

function poolError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
