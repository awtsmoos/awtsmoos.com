//B"H
//Boruch Hashem
//Blessed is He

import { elf64DynamicValue } from "./elf64DynamicEntries.js";
import { elf64Error } from "./elf64Errors.js";
import { Elf64Reader } from "./elf64Reader.js";
import {
	ELF_RELOCATION_FORMAT,
	ELF_RELOCATION_LIMIT,
	ELF_RELOCATION_TAG
} from "./elf64RelocationConstants.js";

/**
 * Reads standard ELF64 RELA tables from one measured image. The Awtsmoos
 * recreates place, symbol index, type, and signed addend anew; Awtsmoos.com
 * bounds every table before the loader is permitted to repair a guest pointer.
 */
export function readElf64Relocations(image) {
	const reader = new Elf64Reader(image.bytes);
	const main = readRelocationTable(
		image,
		reader,
		ELF_RELOCATION_TAG.rela,
		ELF_RELOCATION_TAG.relaSize,
		"rela"
	);
	const plt = readPltRelocations(image, reader);
	return Object.freeze([...main, ...plt]);
}

export function relocationHistogram(relocations) {
	const histogram = {};
	for (const relocation of relocations) {
		const key = String(relocation.type);
		histogram[key] = (histogram[key] || 0) + 1;
	}
	return Object.freeze(histogram);
}

function readPltRelocations(image, reader) {
	const entries = image.dynamicEntries;
	const address = elf64DynamicValue(
		entries,
		ELF_RELOCATION_TAG.jumpRelocations
	);
	const size = elf64DynamicValue(
		entries,
		ELF_RELOCATION_TAG.pltRelocationSize
	);
	if (address === null && size === null) return Object.freeze([]);
	const format = elf64DynamicValue(
		entries,
		ELF_RELOCATION_TAG.pltRelocationType
	);
	if (format !== ELF_RELOCATION_FORMAT.rela) {
		throw elf64Error("ELF64_PLT_RELOCATION_FORMAT", format);
	}
	return readTable(image, reader, address, size, "plt");
}

function readRelocationTable(image, reader, addressTag, sizeTag, source) {
	const entries = image.dynamicEntries;
	const address = elf64DynamicValue(entries, addressTag);
	const size = elf64DynamicValue(entries, sizeTag);
	if (address === null && size === null) return Object.freeze([]);
	const entrySize = elf64DynamicValue(
		entries,
		ELF_RELOCATION_TAG.relaEntrySize
	);
	if (entrySize !== BigInt(ELF_RELOCATION_FORMAT.relaEntrySize)) {
		throw elf64Error("ELF64_RELA_ENTRY_SIZE", entrySize);
	}
	return readTable(image, reader, address, size, source);
}

function readTable(image, reader, address, sizeValue, source) {
	if (address === null || sizeValue === null) {
		throw elf64Error("ELF64_RELOCATION_TABLE_INCOMPLETE", source);
	}
	const size = safeTableSize(sizeValue, source);
	if (size % ELF_RELOCATION_FORMAT.relaEntrySize !== 0) {
		throw elf64Error("ELF64_RELOCATION_TABLE_SIZE", `${source}:${size}`);
	}
	const count = size / ELF_RELOCATION_FORMAT.relaEntrySize;
	if (count > ELF_RELOCATION_LIMIT) {
		throw elf64Error("ELF64_RELOCATION_LIMIT", `${source}:${count}`);
	}
	const relocations = [];
	for (let index = 0; index < count; index += 1) {
		const entryAddress = address
			+ BigInt(index * ELF_RELOCATION_FORMAT.relaEntrySize);
		const offset = image.addressSpace.translate(
			entryAddress,
			ELF_RELOCATION_FORMAT.relaEntrySize,
			`${source}-relocation-${index}`
		);
		const info = reader.u64(offset + 8, "relocation-info");
		relocations.push(Object.freeze({
			addend: reader.i64(offset + 16, "relocation-addend"),
			index,
			offset: reader.u64(offset, "relocation-offset"),
			source,
			symbolIndex: Number(info >> 32n),
			type: Number(info & 0xffffffffn)
		}));
	}
	return Object.freeze(relocations);
}

function safeTableSize(value, label) {
	if (value < 0n || value > BigInt(Number.MAX_SAFE_INTEGER)) {
		throw elf64Error("ELF64_RELOCATION_SAFE_SIZE", `${label}:${value}`);
	}
	return Number(value);
}
