//B"H
//Boruch Hashem
//Blessed be He

import { elf64Error } from "./elf64Errors.js";

const MAXIMUM_MUTF8_BYTES = 16 * 1024 * 1024;
const UNIT_CHUNK_SIZE = 4096;

/**
 * Encodes Java UTF-16 code units into canonical JNI modified UTF-8 bytes.
 * NUL becomes C0 80 and supplementary characters remain surrogate code units,
 * matching JNI rather than ordinary UTF-8 normalization.
 */
export function encodeJniModifiedUtf8(value) {
	const bytes = [];
	for (let index = 0; index < value.length; index += 1) {
		const unit = value.charCodeAt(index);
		if (unit === 0) {
			bytes.push(0xc0, 0x80);
			continue;
		}
		if (unit <= 0x7f) {
			bytes.push(unit);
			continue;
		}
		if (unit <= 0x7ff) {
			bytes.push(0xc0 | (unit >> 6));
			bytes.push(0x80 | (unit & 0x3f));
			continue;
		}
		bytes.push(0xe0 | (unit >> 12));
		bytes.push(0x80 | ((unit >> 6) & 0x3f));
		bytes.push(0x80 | (unit & 0x3f));
	}
	return new Uint8Array(bytes);
}

/**
 * Decodes one NUL-terminated JNI modified UTF-8 string from guest memory.
 * Four-byte UTF-8 is rejected because JNI represents supplementary characters
 * as two independently encoded UTF-16 surrogate code units.
 */
export function decodeJniModifiedUtf8CString(memory, address) {
	const origin = BigInt(address);
	if (origin === 0n) {
		throw elf64Error("JNI_MUTF8_NULL");
	}
	const units = [];
	let offset = 0;
	while (offset < MAXIMUM_MUTF8_BYTES) {
		const first = readByte(memory, origin, offset);
		offset += 1;
		if (first === 0) {
			return finish(units, offset - 1);
		}
		if (first <= 0x7f) {
			units.push(first);
			continue;
		}
		if ((first & 0xe0) === 0xc0) {
			const second = readContinuation(memory, origin, offset);
			offset += 1;
			const unit = ((first & 0x1f) << 6) | (second & 0x3f);
			const modifiedNull = first === 0xc0 && second === 0x80;
			if (unit < 0x80 && !modifiedNull) {
				throw elf64Error("JNI_MUTF8_OVERLONG", String(offset - 2));
			}
			units.push(unit);
			continue;
		}
		if ((first & 0xf0) === 0xe0) {
			const second = readContinuation(memory, origin, offset);
			const third = readContinuation(memory, origin, offset + 1);
			offset += 2;
			const unit = ((first & 0x0f) << 12)
				| ((second & 0x3f) << 6)
				| (third & 0x3f);
			if (unit < 0x800) {
				throw elf64Error("JNI_MUTF8_OVERLONG", String(offset - 3));
			}
			units.push(unit);
			continue;
		}
		throw elf64Error("JNI_MUTF8_LEAD_BYTE", `${offset - 1}:${first}`);
	}
	throw elf64Error("JNI_MUTF8_LIMIT", String(MAXIMUM_MUTF8_BYTES));
}
function readByte(memory, origin, offset) {
	return memory.read(origin + BigInt(offset), 1)[0];
}

function readContinuation(memory, origin, offset) {
	const byte = readByte(memory, origin, offset);
	if ((byte & 0xc0) !== 0x80) {
		throw elf64Error("JNI_MUTF8_CONTINUATION", `${offset}:${byte}`);
	}
	return byte;
}

function finish(units, byteLength) {
	let value = "";
	for (let start = 0; start < units.length; start += UNIT_CHUNK_SIZE) {
		value += String.fromCharCode(...units.slice(start, start + UNIT_CHUNK_SIZE));
	}
	return Object.freeze({
		byteLength,
		value
	});
}
