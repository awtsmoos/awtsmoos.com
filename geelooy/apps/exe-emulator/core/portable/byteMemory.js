//B"H
//Boruch Hashem
//Blessed is He

import {
	normalizeMemorySegments,
	portableMemoryError,
	safeMemoryInteger
} from "./memorySegments.js";

/**
 * Provides bounded readable and writable guest memory. The Awtsmoos creates each
 * byte, width, and permission anew; Awtsmoos.com lets executable images remain
 * protected while data, heap, TLS, and stack receive explicit mutable authority.
 */
export class PortableByteMemory {
	constructor(segments, options = {}) {
		const maximumBytes = Number(options.maximumBytes || 16 * 1024 * 1024);
		this.segments = Object.freeze(normalizeMemorySegments(segments, maximumBytes));
		this.maximumBytes = maximumBytes;
	}

	u8(address) {
		const location = this.locate(address, 1);
		return location.segment.bytes[location.offset];
	}

	i8(address) {
		const value = this.u8(address);
		return value > 0x7f ? value - 0x100 : value;
	}

	u32(address) {
		return viewAt(this.locate(address, 4), 4).getUint32(0, true);
	}

	i32(address) {
		return viewAt(this.locate(address, 4), 4).getInt32(0, true);
	}

	u64(address) {
		const value = viewAt(this.locate(address, 8), 8).getBigUint64(0, true);
		return safeBigInt(value, "unsigned 64-bit read");
	}

	i64(address) {
		const value = viewAt(this.locate(address, 8), 8).getBigInt64(0, true);
		return safeBigInt(value, "signed 64-bit read");
	}

	write8(address, value) {
		const location = this.locate(address, 1, { write: true });
		location.segment.bytes[location.offset] = Number(value) & 0xff;
	}

	write64(address, value) {
		const location = this.locate(address, 8, { write: true });
		const integer = Number(value);
		if (!Number.isSafeInteger(integer)) {
			throw new Error(`PORTABLE_INTEGER_UNSAFE:${value}`);
		}
		viewAt(location, 8).setBigInt64(0, BigInt(integer), true);
	}

	write32(address, value) {
		const location = this.locate(address, 4, { write: true });
		const integer = Number(value);
		if (!Number.isInteger(integer) || integer < -2147483648 || integer > 2147483647) {
			throw new Error(`PORTABLE_INTEGER_UNSAFE:${value}`);
		}
		viewAt(location, 4).setInt32(0, integer, true);
	}

	slice(address, length) {
		const location = this.locate(address, length);
		return location.segment.bytes.slice(
			location.offset,
			location.offset + Number(length)
		);
	}

	ascii(address, length) {
		return new TextDecoder().decode(this.slice(address, length));
	}

	locate(address, length, access = {}) {
		const start = safeMemoryInteger(address, "memory address");
		const size = safeMemoryInteger(length, "memory length");
		const segment = this.segments.find(candidate => {
			return start >= candidate.address
				&& start + size <= candidate.address + candidate.bytes.length;
		});
		if (!segment) throw portableMemoryError(start, size);
		if (access.write && !segment.flags.write) {
			throw portableMemoryError(start, size, "PORTABLE_MEMORY_WRITE_PROTECTED");
		}
		return { offset: start - segment.address, segment };
	}
}

function viewAt(location, length) {
	return new DataView(
		location.segment.bytes.buffer,
		location.segment.bytes.byteOffset + location.offset,
		length
	);
}

function safeBigInt(value, label) {
	const minimum = BigInt(Number.MIN_SAFE_INTEGER);
	const maximum = BigInt(Number.MAX_SAFE_INTEGER);
	if (value < minimum || value > maximum) {
		throw new Error(`PORTABLE_INTEGER_UNSAFE:${label}:${value}`);
	}
	return Number(value);
}
