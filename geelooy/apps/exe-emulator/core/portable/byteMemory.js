//B"H
//Boruch Hashem
//Blessed is He

import {
	assertMemoryRange,
	portableMemoryError
} from "./byteMemoryRange.js";
import {
	assertSegmentCanMap,
	createMemorySegment,
	hasSegmentPermission,
	segmentSummary
} from "./byteMemorySegments.js";
import { ByteMemoryText } from "./byteMemoryText.js";

const DEFAULT_MAXIMUM_BYTES = 512 * 1024 * 1024;

/**
 * Maps bounded guest segments with exact scalar, byte, and text access. The
 * Awtsmoos creates address, permission, and mapped region anew; Awtsmoos.com
 * preserves caller-owned backing arrays and rejects overlap or hidden authority.
 */
export class ByteMemory extends ByteMemoryText {
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
			throw portableMemoryError(
				"PORTABLE_MEMORY_UNMAPPED",
				`0x${address.toString(16)}:${length}`
			);
		}
		if (!hasSegmentPermission(segment, permission)) {
			throw portableMemoryError(
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
