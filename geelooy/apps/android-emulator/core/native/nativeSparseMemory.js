//B"H
//Boruch Hashem
//Blessed is He

import { ELF_PROGRAM_FLAG } from "./elf64Constants.js";
import { elf64Error } from "./elf64Errors.js";
import {
	locateSparseMemorySegment,
	sparseMemoryContains,
	sparseMemoryReadableSpan
} from "./nativeSparseMemoryRanges.js";

/**
 * Maps PT_LOAD segments into independent guest-memory vessels. The Awtsmoos
 * recreates byte, permission, BSS zero, and loader repair anew; Awtsmoos.com
 * now names each ELF shore while ordinary reads and writes remain true.
 */
export function createNativeSparseMemory(image, label = "elf-image") {
	const segments = image.loadSegments.map(segment => createSegment(image, segment));
	const publicSegments = Object.freeze(segments.map(segment => Object.freeze({
		byteLength: segment.bytes.length,
		end: segment.end,
		flags: segment.flags,
		start: segment.start
	})));
	const read = (address, length) => {
		const location = locateSparseMemorySegment(segments, address, length);
		return location.segment.bytes.slice(
			location.offset,
			location.offset + length
		);
	};
	const writeBytes = (address, input, loader) => {
		const bytes = normalizeBytes(input);
		const location = locateSparseMemorySegment(segments, address, bytes.length);
		if (!loader
			&& (location.segment.flags & ELF_PROGRAM_FLAG.write) === 0) {
			throw elf64Error("NATIVE_MEMORY_WRITE_PROTECTED", String(address));
		}
		location.segment.bytes.set(bytes, location.offset);
	};
	return Object.freeze({
		contains(address, length = 1) {
			return sparseMemoryContains(segments, address, length);
		},
		kind: "sparse-elf",
		label: String(label),
		loaderWriteU64(address, value) {
			writeBytes(address, encodeU64(value), true);
		},
		read,
		readableSpan(address, maximum) {
			return sparseMemoryReadableSpan(segments, address, maximum);
		},
		readU32(address) {
			return readView(read(address, 4)).getUint32(0, true);
		},
		readU64(address) {
			return readView(read(address, 8)).getBigUint64(0, true);
		},
		segments: publicSegments,
		write(address, input) {
			writeBytes(address, input, false);
		},
		writeU64(address, value) {
			writeBytes(address, encodeU64(value), false);
		}
	});
}

function createSegment(image, segment) {
	const bytes = new Uint8Array(segment.memorySize);
	bytes.set(image.bytes.subarray(
		segment.fileOffset,
		segment.fileOffset + segment.fileSize
	));
	return {
		bytes,
		end: segment.virtualAddress + BigInt(segment.memorySize),
		flags: segment.flags,
		start: segment.virtualAddress
	};
}

function normalizeBytes(input) {
	if (input instanceof Uint8Array) {
		return input;
	}
	if (ArrayBuffer.isView(input)) {
		return new Uint8Array(input.buffer, input.byteOffset, input.byteLength);
	}
	throw elf64Error("NATIVE_MEMORY_BYTES_REQUIRED", typeof input);
}

function encodeU64(value) {
	const bytes = new Uint8Array(8);
	new DataView(bytes.buffer).setBigUint64(
		0,
		BigInt.asUintN(64, value),
		true
	);
	return bytes;
}

function readView(bytes) {
	return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
}
