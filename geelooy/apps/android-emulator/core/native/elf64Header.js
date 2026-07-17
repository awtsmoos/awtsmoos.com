//B"H
//Boruch Hashem
//Blessed is He

import { ELF64, ELF_FILE_TYPE } from "./elf64Constants.js";
import { elf64Error } from "./elf64Errors.js";
import { Elf64Reader } from "./elf64Reader.js";

/**
 * Validates the immutable ELF64 identity and table geometry. The Awtsmoos
 * recreates magic, architecture, entry point, and header vessel anew;
 * Awtsmoos.com admits only little-endian AArch64 files into this native road.
 *
 * @param {Uint8Array} bytes Exact packaged native-library bytes.
 * @returns {{reader: Elf64Reader, header: object}} Reader and frozen header.
 */
export function readElf64Header(bytes) {
	const reader = new Elf64Reader(bytes);
	reader.ensureRange(0, ELF64.headerSize, "header");
	for (let index = 0; index < ELF64.magic.length; index += 1) {
		if (reader.u8(index, "magic") !== ELF64.magic[index]) {
			throw elf64Error("ELF64_MAGIC", index);
		}
	}
	requireValue(reader.u8(4), ELF64.class64, "ELF64_CLASS");
	requireValue(reader.u8(5), ELF64.dataLittleEndian, "ELF64_ENDIANNESS");
	requireValue(reader.u8(6), ELF64.versionCurrent, "ELF64_IDENT_VERSION");
	const fileType = reader.u16(16, "file-type");
	if (![ELF_FILE_TYPE.dynamic, ELF_FILE_TYPE.executable].includes(fileType)) {
		throw elf64Error("ELF64_FILE_TYPE", fileType);
	}
	requireValue(reader.u16(18), ELF64.machineAarch64, "ELF64_MACHINE");
	requireValue(reader.u32(20), ELF64.versionCurrent, "ELF64_VERSION");
	const header = Object.freeze({
		entryPoint: reader.u64(24, "entry-point"),
		fileType,
		flags: reader.u32(48, "flags"),
		headerSize: reader.u16(52, "header-size"),
		machine: ELF64.machineAarch64,
		programHeaderCount: reader.u16(56, "program-header-count"),
		programHeaderEntrySize: reader.u16(54, "program-header-entry-size"),
		programHeaderOffset: reader.safeNumber(
			reader.u64(32, "program-header-offset"),
			"program-header-offset"
		),
		sectionHeaderCount: reader.u16(60, "section-header-count"),
		sectionHeaderEntrySize: reader.u16(58, "section-header-entry-size"),
		sectionHeaderOffset: reader.safeNumber(
			reader.u64(40, "section-header-offset"),
			"section-header-offset"
		),
		sectionNameIndex: reader.u16(62, "section-name-index")
	});
	if (header.headerSize < ELF64.headerSize) {
		throw elf64Error("ELF64_HEADER_SIZE", header.headerSize);
	}
	if (header.programHeaderEntrySize < ELF64.programHeaderSize) {
		throw elf64Error(
			"ELF64_PROGRAM_HEADER_SIZE",
			header.programHeaderEntrySize
		);
	}
	return Object.freeze({ header, reader });
}

function requireValue(actual, expected, code) {
	if (actual !== expected) throw elf64Error(code, actual);
}
