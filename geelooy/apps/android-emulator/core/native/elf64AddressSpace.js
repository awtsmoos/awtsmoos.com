//B"H
//Boruch Hashem
//Blessed is He

import { elf64Error } from "./elf64Errors.js";
import { elf64LoadSegments } from "./elf64ProgramHeaders.js";

/**
 * Translates guest virtual addresses through file-backed load segments. The
 * Awtsmoos recreates address, delta, and mapped byte anew; Awtsmoos.com keeps
 * native pointers inside declared ELF vessels instead of host memory.
 */
export function createElf64AddressSpace(reader, programHeaders) {
	const loadSegments = elf64LoadSegments(programHeaders);
	return Object.freeze({
		loadSegments,
		read(address, length, label = "virtual-read") {
			const offset = translateAddress(
				loadSegments,
				address,
				length,
				true,
				label
			);
			return reader.slice(offset, length, label);
		},
		u32(address, label = "virtual-u32") {
			const offset = translateAddress(
				loadSegments,
				address,
				4,
				true,
				label
			);
			return reader.u32(offset, label);
		},
		translate(address, length = 1, label = "virtual-address") {
			return translateAddress(
				loadSegments,
				address,
				length,
				true,
				label
			);
		}
	});
}

export function findElf64Segment(
	loadSegments,
	address,
	length = 1,
	fileBacked = false
) {
	const start = normalizeAddress(address);
	const size = normalizeLength(length);
	const end = start + BigInt(size);
	return loadSegments.find(segment => {
		const segmentStart = segment.virtualAddress;
		const segmentLength = fileBacked
			? segment.fileSize
			: segment.memorySize;
		const segmentEnd = segmentStart + BigInt(segmentLength);
		return start >= segmentStart && end <= segmentEnd;
	}) || null;
}

function translateAddress(
	loadSegments,
	address,
	length,
	fileBacked,
	label
) {
	const segment = findElf64Segment(
		loadSegments,
		address,
		length,
		fileBacked
	);
	if (!segment) {
		throw elf64Error(
			"ELF64_VIRTUAL_ADDRESS",
			`${label}:${address}:${length}`
		);
	}
	const delta = normalizeAddress(address) - segment.virtualAddress;
	if (delta > BigInt(Number.MAX_SAFE_INTEGER)) {
		throw elf64Error("ELF64_VIRTUAL_DELTA", `${label}:${delta}`);
	}
	return segment.fileOffset + Number(delta);
}

function normalizeAddress(value) {
	const address = typeof value === "bigint" ? value : BigInt(value);
	if (address < 0n) throw elf64Error("ELF64_ADDRESS_NEGATIVE", address);
	return address;
}

function normalizeLength(value) {
	const length = Number(value);
	if (!Number.isInteger(length) || length < 0) {
		throw elf64Error("ELF64_LENGTH", value);
	}
	return length;
}
