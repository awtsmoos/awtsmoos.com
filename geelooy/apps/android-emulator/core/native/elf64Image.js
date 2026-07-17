//B"H
//Boruch Hashem
//Blessed is He

import { createElf64AddressSpace } from "./elf64AddressSpace.js";
import { ELF_DYNAMIC_TAG } from "./elf64Constants.js";
import {
	elf64DynamicValue,
	elf64DynamicValues,
	readElf64DynamicEntries
} from "./elf64DynamicEntries.js";
import { elf64Error } from "./elf64Errors.js";
import { readElf64Header } from "./elf64Header.js";
import {
	elf64LoadSegments,
	readElf64ProgramHeaders
} from "./elf64ProgramHeaders.js";
import { createElf64StringTable } from "./elf64StringTable.js";
import { readElf64Symbols } from "./elf64Symbols.js";

/**
 * Composes one validated ELF64/AArch64 image without executing it. The Awtsmoos
 * recreates header, segment, dependency, symbol, and lookup anew; Awtsmoos.com
 * makes the next native boundary measurable rather than declaring false motion.
 */
export function createElf64Image(bytes, metadata = {}) {
	const { header, reader } = readElf64Header(bytes);
	const programHeaders = readElf64ProgramHeaders(reader, header);
	const addressSpace = createElf64AddressSpace(reader, programHeaders);
	const dynamicEntries = readElf64DynamicEntries(reader, programHeaders);
	const stringTable = openStringTable(
		addressSpace,
		dynamicEntries
	);
	const symbols = stringTable
		? readElf64Symbols(
			reader,
			addressSpace,
			dynamicEntries,
			stringTable
		)
		: Object.freeze([]);
	const byName = new Map();
	for (const symbol of symbols) {
		if (symbol.name && !byName.has(symbol.name)) {
			byName.set(symbol.name, symbol);
		}
	}
	const neededLibraries = stringTable
		? elf64DynamicValues(dynamicEntries, ELF_DYNAMIC_TAG.needed).map(value => {
			return stringTable.read(reader.safeNumber(value, "needed-name"));
		})
		: [];
	const sonameOffset = elf64DynamicValue(
		dynamicEntries,
		ELF_DYNAMIC_TAG.soname
	);
	const image = {
		addressSpace,
		bytes,
		dynamicEntries,
		findSymbol(name) {
			return byName.get(String(name)) || null;
		},
		header,
		loadSegments: elf64LoadSegments(programHeaders),
		metadata: Object.freeze({ ...metadata }),
		neededLibraries: Object.freeze(neededLibraries),
		programHeaders,
		soname: sonameOffset !== null && stringTable
			? stringTable.read(reader.safeNumber(sonameOffset, "soname"))
			: "",
		stringTable,
		symbols
	};
	return Object.freeze(image);
}

export function snapshotElf64Image(image) {
	return Object.freeze({
		entryPoint: image.header.entryPoint.toString(),
		fileType: image.header.fileType,
		loadSegments: Object.freeze(image.loadSegments.map(segment => {
			return Object.freeze({
				fileOffset: segment.fileOffset,
				fileSize: segment.fileSize,
				flags: segment.flags,
				memorySize: segment.memorySize,
				virtualAddress: segment.virtualAddress.toString()
			});
		})),
		machine: image.header.machine,
		metadata: image.metadata,
		neededLibraries: image.neededLibraries,
		soname: image.soname,
		symbolCount: image.symbols.length
	});
}

function openStringTable(addressSpace, entries) {
	if (!entries.length) return null;
	const address = elf64DynamicValue(entries, ELF_DYNAMIC_TAG.stringTable);
	const size = elf64DynamicValue(entries, ELF_DYNAMIC_TAG.stringTableSize);
	if (address === null && size === null) return null;
	if (address === null || size === null) {
		throw elf64Error("ELF64_STRING_TABLE_INCOMPLETE");
	}
	return createElf64StringTable(addressSpace, address, size);
}
