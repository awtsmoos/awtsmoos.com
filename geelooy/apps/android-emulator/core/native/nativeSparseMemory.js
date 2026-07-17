//B"H
//Boruch Hashem
//Blessed is He

import { ELF_PROGRAM_FLAG } from "./elf64Constants.js";
import { elf64Error } from "./elf64Errors.js";

/**
 * Maps PT_LOAD segments into independent guest-memory vessels. The Awtsmoos
 * recreates byte, permission, BSS zero, and loader repair anew; Awtsmoos.com
 * grants relocation authority explicitly without weakening ordinary writes.
 */
export function createNativeSparseMemory(image) {
	const segments = image.loadSegments.map(segment => createSegment(image, segment));
	const read = (address, length) => {
		const location = locateSegment(segments, address, length);
		return location.segment.bytes.slice(
			location.offset,
			location.offset + length
		);
	};
	const writeBytes = (address, input, loader) => {
		const bytes = normalizeBytes(input);
		const location = locateSegment(segments, address, bytes.length);
		if (!loader
			&& (location.segment.flags & ELF_PROGRAM_FLAG.write) === 0) {
			throw elf64Error(
				"NATIVE_MEMORY_WRITE_PROTECTED",
				String(address)
			);
		}
		location.segment.bytes.set(bytes, location.offset);
	};
	return Object.freeze({
		loaderWriteU64(address, value) {
			writeBytes(address, encodeU64(value), true);
		},
		read,
		readU32(address) {
			return readView(read(address, 4)).getUint32(0, true);
		},
		readU64(address) {
			return readView(read(address, 8)).getBigUint64(0, true);
		},
		segments: Object.freeze(segments.map(segment => Object.freeze({
			byteLength: segment.bytes.length,
			end: segment.end,
			flags: segment.flags,
			start: segment.start
		}))),
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

function locateSegment(segments, address, length) {
	const start = typeof address === "bigint" ? address : BigInt(address);
	const size = Number(length);
	if (!Number.isInteger(size) || size < 0) {
		throw elf64Error("NATIVE_MEMORY_LENGTH", length);
	}
	const end = start + BigInt(size);
	const segment = segments.find(candidate => {
		return start >= candidate.start && end <= candidate.end;
	});
	if (!segment) {
		throw elf64Error("NATIVE_MEMORY_ADDRESS", `${start}:${size}`);
	}
	const offsetValue = start - segment.start;
	if (offsetValue > BigInt(Number.MAX_SAFE_INTEGER)) {
		throw elf64Error("NATIVE_MEMORY_OFFSET", offsetValue);
	}
	return Object.freeze({
		offset: Number(offsetValue),
		segment
	});
}

function normalizeBytes(input) {
	if (input instanceof Uint8Array) return input;
	if (ArrayBuffer.isView(input)) {
		return new Uint8Array(
			input.buffer,
			input.byteOffset,
			input.byteLength
		);
	}
	throw elf64Error("NATIVE_MEMORY_BYTES_REQUIRED", typeof input);
}

function encodeU64(value) {
	const bytes = new Uint8Array(8);
	new DataView(bytes.buffer).setBigUint64(0, BigInt.asUintN(64, value), true);
	return bytes;
}

function readView(bytes) {
	return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
}
