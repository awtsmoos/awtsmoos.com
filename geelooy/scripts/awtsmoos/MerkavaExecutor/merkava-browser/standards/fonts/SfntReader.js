//B"H
//Boruch Hashem
//Blessed be He

/** Bounds-checked big-endian SFNT binary reader implemented without libraries. */
class SfntReader {
	constructor(bytes) {
		this.bytes = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes || 0);
	}

	/** Reads one unsigned 8-bit value. */
	u8(at) {
		this.assertRange(at, 1);
		return this.bytes[at];
	}

	/** Reads one unsigned 16-bit big-endian value. */
	u16(at) {
		this.assertRange(at, 2);
		return this.bytes[at] * 256 + this.bytes[at + 1];
	}

	/** Reads one signed 16-bit big-endian value. */
	i16(at) {
		const value = this.u16(at);
		return value & 0x8000 ? value - 0x10000 : value;
	}

	/** Reads one unsigned 32-bit big-endian value. */
	u32(at) {
		this.assertRange(at, 4);
		return this.bytes[at] * 0x1000000
			+ this.bytes[at + 1] * 0x10000
			+ this.bytes[at + 2] * 0x100
			+ this.bytes[at + 3];
	}

	/** Reads one four-byte SFNT table tag. */
	tag(at) {
		this.assertRange(at, 4);
		return String.fromCharCode(
			this.bytes[at],
			this.bytes[at + 1],
			this.bytes[at + 2],
			this.bytes[at + 3]
		);
	}

	/** Returns a bounded byte slice without copying when supported by the host. */
	slice(at, length) {
		this.assertRange(at, length);
		return this.bytes.subarray(at, at + length);
	}

	/** Rejects malformed offsets before they can escape the font sandbox. */
	assertRange(at, length) {
		if (!Number.isInteger(at) || !Number.isInteger(length) || at < 0 || length < 0 || at + length > this.bytes.length) {
			throw new RangeError(`SFNT range outside font bytes: ${at}+${length}/${this.bytes.length}`);
		}
	}
}

module.exports = { SfntReader };
