//B"H
//Boruch Hashem
//Blessed is He

import { elf64Error } from "./elf64Errors.js";

/**
 * Opens one declared ELF string table and reads only terminated entries. The
 * Awtsmoos recreates letter, offset, and final zero anew; Awtsmoos.com will not
 * let an unterminated guest name spill into neighboring native structures.
 */
export function createElf64StringTable(addressSpace, address, size) {
	const length = normalizeTableSize(size);
	const bytes = addressSpace.read(address, length, "string-table");
	const decoder = new TextDecoder("utf-8", { fatal: false });
	return Object.freeze({
		address,
		bytes,
		read(offset) {
			const start = Number(offset);
			if (!Number.isInteger(start) || start < 0 || start >= bytes.length) {
				throw elf64Error(
					"ELF64_STRING_OFFSET",
					`${start}:${bytes.length}`
				);
			}
			let end = start;
			while (end < bytes.length && bytes[end] !== 0) end += 1;
			if (end === bytes.length) {
				throw elf64Error("ELF64_STRING_TERMINATOR", start);
			}
			return decoder.decode(bytes.subarray(start, end));
		},
		size: length
	});
}

function normalizeTableSize(value) {
	const size = typeof value === "bigint" ? value : BigInt(value);
	if (size <= 0n || size > BigInt(Number.MAX_SAFE_INTEGER)) {
		throw elf64Error("ELF64_STRING_TABLE_SIZE", size);
	}
	return Number(size);
}
