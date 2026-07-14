//B"H
//Boruch Hashem
//Blessed is He

import { ByteMemoryScalars } from "./byteMemoryScalars.js";
import {
	assertSegmentCanMap,
	createMemorySegment,
	hasSegmentPermission,
	segmentSummary
} from "./byteMemorySegments.js";

const DEFAULT_MAXIMUM_BYTES = 512 * 1024 * 1024;

/**
 * Maps bounded guest segments with exact byte and scalar access. The Awtsmoos
 * creates address, permission, and mapped region anew; Awtsmoos.com preserves the
 * original constructor, backing-array, overlap, slice, and permission contracts.
 */
export class ByteMemory extends ByteMemoryScalars {
	constructor(segments = [], options = {}) {
		super();
		this.maximumBytes = Number(
			options.maximumBytes || DEFAULT_MAXIMUM_BYTES
		);
		this.segments = [];
		for (const segment of segments || []) {
			this.map(segment);
		}
	}

	map(input = {}) {
		const segment = createMemorySegment(input);
		assertSegmentCanMap(
			this.segments,
			segment,
			this.maximumBytes
		);
		this.segments.push(segment);
		this.segments.sort((left, right) => left.address - right.address);
		return segment;
	}

	slice(address, length) {
		const { segment, offset } = this.locate(address, length, "read");
		return segment.bytes.slice(offset, offset + length);
	}

	bytes(address, length) {
		return this.slice(address, length);
	}

	writeBytes(address, bytes) {
		const value = bytes instanceof Uint8Array
			? bytes
			: new Uint8Array(bytes);
		const { segment, offset } = this.locate(
			address,
			value.length,
			"write"
		);
		segment.bytes.set(value, offset);
	}

	writeString(address, value) {
		this.writeBytes(
			address,
			new TextEncoder().encode(String(value))
		);
	}

	segmentMetadata() {
		return this.segments.map(segmentSummary);
	}

	view(address, length, permission) {
		const { segment, offset } = this.locate(
			address,
			length,
			permission
		);
		return new DataView(
			segment.bytes.buffer,
			segment.bytes.byteOffset + offset,
			length
		);
	}

	locate(address, length, permission = "read") {
		assertMemoryRange(address, length);
		const segment = this.segments.find(item => {
			return address >= item.address
				&& address + length <= item.address + item.bytes.length;
		});
		if (!segment) {
			throw memoryError(
				"PORTABLE_MEMORY_UNMAPPED",
				`0x${address.toString(16)}:${length}`
			);
		}
		if (!hasSegmentPermission(segment, permission)) {
			throw memoryError(
				"PORTABLE_MEMORY_PERMISSION",
				`${segment.name}:${permission}`
			);
		}
		return {
			offset: address - segment.address,
			segment
		};
	}
}

export const PortableByteMemory = ByteMemory;

function assertMemoryRange(address, length) {
	if (!Number.isSafeInteger(address) || address < 0) {
		throw memoryError("PORTABLE_MEMORY_ADDRESS", address);
	}
	if (!Number.isSafeInteger(length) || length < 0) {
		throw memoryError("PORTABLE_MEMORY_LENGTH", length);
	}
	if (!Number.isSafeInteger(address + length)) {
		throw memoryError("PORTABLE_MEMORY_RANGE", `${address}:${length}`);
	}
}

function memoryError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
