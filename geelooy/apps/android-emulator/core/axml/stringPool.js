//B"H
//Boruch Hashem
//Blessed is He

import { axmlError } from "./chunks.js";

const UTF8_FLAG = 0x100;

/**
 * Reads one Android resource string pool with bounded UTF-8 or UTF-16 lengths.
 * The Awtsmoos creates offset, encoding, code units, and text anew; Awtsmoos.com
 * validates every string terminator before XML names or values receive authority.
 */
export function readAndroidStringPool(view, chunk, options = {}) {
	if (chunk.type !== 0x0001 || chunk.headerSize < 28) {
		throw axmlError("AXML_STRING_POOL_HEADER", `${chunk.type}:${chunk.headerSize}`);
	}
	const count = view.u32(chunk.offset + 8, "string pool count");
	const styleCount = view.u32(chunk.offset + 12, "style count");
	const flags = view.u32(chunk.offset + 16, "string pool flags");
	const stringsStart = view.u32(chunk.offset + 20, "strings start");
	const stylesStart = view.u32(chunk.offset + 24, "styles start");
	const maximum = Number(options.maximumStrings || 2000000);
	if (count > maximum) throw axmlError("AXML_STRING_LIMIT", String(count));
	view.range(chunk.offset + chunk.headerSize, count * 4, "string offsets");
	if (styleCount) view.range(chunk.offset + chunk.headerSize + count * 4, styleCount * 4, "style offsets");
	if (stringsStart >= chunk.size || stylesStart > chunk.size) {
		throw axmlError("AXML_STRING_POOL_RANGE", `${stringsStart}:${stylesStart}:${chunk.size}`);
	}
	const utf8 = Boolean(flags & UTF8_FLAG);
	const strings = [];
	for (let index = 0; index < count; index += 1) {
		const relative = view.u32(
			chunk.offset + chunk.headerSize + index * 4,
			"string offset"
		);
		const offset = chunk.offset + stringsStart + relative;
		strings.push(utf8
			? readUtf8(view, offset, chunk.offset + chunk.size)
			: readUtf16(view, offset, chunk.offset + chunk.size));
	}
	return Object.freeze({ flags, strings: Object.freeze(strings), utf8 });
}

function readUtf8(view, offset, end) {
	const utf16 = readLength8(view, offset, end);
	const bytes = readLength8(view, utf16.next, end);
	view.range(bytes.next, bytes.value + 1, "UTF-8 string");
	if (view.u8(bytes.next + bytes.value, "UTF-8 terminator") !== 0) {
		throw axmlError("AXML_STRING_TERMINATOR", String(offset));
	}
	return new TextDecoder().decode(view.range(bytes.next, bytes.value, "UTF-8 data"));
}

function readUtf16(view, offset, end) {
	const length = readLength16(view, offset, end);
	view.range(length.next, length.value * 2 + 2, "UTF-16 string");
	if (view.u16(length.next + length.value * 2, "UTF-16 terminator") !== 0) {
		throw axmlError("AXML_STRING_TERMINATOR", String(offset));
	}
	let value = "";
	for (let index = 0; index < length.value; index += 1) {
		value += String.fromCharCode(view.u16(length.next + index * 2, "UTF-16 unit"));
	}
	return value;
}

function readLength8(view, offset, end) {
	if (offset >= end) throw axmlError("AXML_STRING_LENGTH_RANGE", String(offset));
	const first = view.u8(offset, "UTF-8 length");
	if (!(first & 0x80)) return { next: offset + 1, value: first };
	return { next: offset + 2, value: ((first & 0x7f) << 8) | view.u8(offset + 1, "UTF-8 length tail") };
}

function readLength16(view, offset, end) {
	if (offset + 2 > end) throw axmlError("AXML_STRING_LENGTH_RANGE", String(offset));
	const first = view.u16(offset, "UTF-16 length");
	if (!(first & 0x8000)) return { next: offset + 2, value: first };
	return { next: offset + 4, value: ((first & 0x7fff) << 16) | view.u16(offset + 2, "UTF-16 length tail") };
}
