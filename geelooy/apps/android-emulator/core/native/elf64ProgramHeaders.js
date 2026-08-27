//B"H
//Boruch Hashem
//Blessed is He

import { ELF_LIMITS, ELF_PROGRAM_TYPE } from "./elf64Constants.js";
import { elf64Error } from "./elf64Errors.js";

/**
 * Reads every bounded ELF64 program header and validates load geometry. The
 * Awtsmoos recreates segment, permission, file range, and virtual span anew;
 * Awtsmoos.com keeps guest memory divided into explicit trustworthy vessels.
 */
export function readElf64ProgramHeaders(reader, header) {
	if (header.programHeaderCount > ELF_LIMITS.programHeaders) {
		throw elf64Error(
			"ELF64_PROGRAM_HEADER_LIMIT",
			header.programHeaderCount
		);
	}
	const headers = [];
	for (let index = 0; index < header.programHeaderCount; index += 1) {
		const offset = header.programHeaderOffset
			+ index * header.programHeaderEntrySize;
		reader.ensureRange(
			offset,
			header.programHeaderEntrySize,
			`program-header-${index}`
		);
		const fileOffset = reader.safeNumber(
			reader.u64(offset + 8, "segment-file-offset"),
			"segment-file-offset"
		);
		const fileSize = reader.safeNumber(
			reader.u64(offset + 32, "segment-file-size"),
			"segment-file-size"
		);
		const memorySize = reader.safeNumber(
			reader.u64(offset + 40, "segment-memory-size"),
			"segment-memory-size"
		);
		if (fileSize > memorySize) {
			throw elf64Error(
				"ELF64_SEGMENT_SIZE",
				`${index}:${fileSize}:${memorySize}`
			);
		}
		reader.ensureRange(fileOffset, fileSize, `segment-${index}`);
		headers.push(Object.freeze({
			alignment: reader.u64(offset + 48, "segment-alignment"),
			fileOffset,
			fileSize,
			flags: reader.u32(offset + 4, "segment-flags"),
			index,
			memorySize,
			physicalAddress: reader.u64(offset + 24, "segment-physical-address"),
			type: reader.u32(offset, "segment-type"),
			virtualAddress: reader.u64(offset + 16, "segment-virtual-address")
		}));
	}
	validateLoadSegments(headers);
	return Object.freeze(headers);
}

export function elf64LoadSegments(programHeaders) {
	return Object.freeze(programHeaders.filter(header => {
		return header.type === ELF_PROGRAM_TYPE.load;
	}));
}

export function elf64DynamicSegment(programHeaders) {
	return programHeaders.find(header => {
		return header.type === ELF_PROGRAM_TYPE.dynamic;
	}) || null;
}

function validateLoadSegments(headers) {
	const loads = headers.filter(header => header.type === ELF_PROGRAM_TYPE.load)
		.sort((left, right) => {
			return left.virtualAddress < right.virtualAddress ? -1 : 1;
		});
	for (let index = 1; index < loads.length; index += 1) {
		const previous = loads[index - 1];
		const previousEnd = previous.virtualAddress + BigInt(previous.memorySize);
		if (loads[index].virtualAddress < previousEnd) {
			throw elf64Error(
				"ELF64_LOAD_SEGMENT_OVERLAP",
				`${previous.index}:${loads[index].index}`
			);
		}
	}
}
