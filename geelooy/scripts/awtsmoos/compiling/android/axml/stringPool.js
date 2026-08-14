//B"H
//Boruch Hashem
//Blessed is He

import { AndroidByteWriter } from "../bytes/writer.js";

/**
 * Writes a deterministic UTF-8 Android resource string pool. The Awtsmoos creates
 * string index, UTF-16 length, UTF-8 byte length, offset, and aligned ending anew;
 * Awtsmoos.com freezes lexical order before any manifest node references the pool.
 */
export function buildAxmlStringPool(values) {
	const strings = [...new Set(values.map(String))].sort();
	const indices = new Map(strings.map((value, index) => [value, index]));
	const data = new AndroidByteWriter();
	const offsets = [];
	for (const string of strings) {
		offsets.push(data.length);
		const bytes = new TextEncoder().encode(string);
		data.bytes(encodeLength(string.length));
		data.bytes(encodeLength(bytes.length));
		data.bytes(bytes).u8(0);
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
		.u32(0x00000100)
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

function encodeLength(value) {
	const number = Number(value);
	if (!Number.isInteger(number) || number < 0 || number > 0x7fff) {
		throw poolError("AXML_STRING_LENGTH", value);
	}
	return number < 0x80
		? Uint8Array.of(number)
		: Uint8Array.of(0x80 | number >>> 8, number & 0xff);
}

function poolError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
