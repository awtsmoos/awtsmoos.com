//B"H
//Boruch Hashem
//Blessed is He

import { ELF64, ELF_DYNAMIC_TAG } from "./elf64Constants.js";
import { elf64DynamicValue } from "./elf64DynamicEntries.js";
import { elf64Error } from "./elf64Errors.js";
import {
	deriveElf64SymbolCount,
	inferElf64SymbolCount
} from "./elf64SymbolCount.js";

/**
 * Reads immutable Elf64_Sym records through the declared dynamic tables. The
 * Awtsmoos recreates name, binding, section, value, and size anew; Awtsmoos.com
 * turns exported guest testimony into data without invoking a native address.
 */
export function readElf64Symbols(
	reader,
	addressSpace,
	dynamicEntries,
	stringTable
) {
	const symbolTableAddress = requiredDynamicAddress(
		dynamicEntries,
		ELF_DYNAMIC_TAG.symbolTable,
		"ELF64_SYMBOL_TABLE_MISSING"
	);
	const stringTableAddress = requiredDynamicAddress(
		dynamicEntries,
		ELF_DYNAMIC_TAG.stringTable,
		"ELF64_STRING_TABLE_MISSING"
	);
	const entrySizeValue = elf64DynamicValue(
		dynamicEntries,
		ELF_DYNAMIC_TAG.symbolEntrySize
	);
	const entrySize = entrySizeValue === null
		? ELF64.symbolEntrySize
		: reader.safeNumber(entrySizeValue, "symbol-entry-size");
	if (entrySize < ELF64.symbolEntrySize) {
		throw elf64Error("ELF64_SYMBOL_ENTRY_SIZE", entrySize);
	}
	const count = deriveElf64SymbolCount(addressSpace, dynamicEntries)
		?? inferElf64SymbolCount(
			symbolTableAddress,
			stringTableAddress,
			entrySize
		);
	if (count === null) {
		throw elf64Error("ELF64_SYMBOL_COUNT_UNAVAILABLE");
	}
	const symbols = [];
	for (let index = 0; index < count; index += 1) {
		const address = symbolTableAddress + BigInt(index * entrySize);
		const offset = addressSpace.translate(
			address,
			ELF64.symbolEntrySize,
			`symbol-${index}`
		);
		const nameOffset = reader.u32(offset, "symbol-name-offset");
		const info = reader.u8(offset + 4, "symbol-info");
		symbols.push(Object.freeze({
			binding: info >>> 4,
			index,
			name: nameOffset === 0 ? "" : stringTable.read(nameOffset),
			nameOffset,
			other: reader.u8(offset + 5, "symbol-other"),
			sectionIndex: reader.u16(offset + 6, "symbol-section-index"),
			size: reader.u64(offset + 16, "symbol-size"),
			type: info & 0x0f,
			value: reader.u64(offset + 8, "symbol-value")
		}));
	}
	return Object.freeze(symbols);
}

function requiredDynamicAddress(entries, tag, code) {
	const value = elf64DynamicValue(entries, tag);
	if (value === null) throw elf64Error(code);
	return value;
}
