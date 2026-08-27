//B"H
//Boruch Hashem
//Blessed is He

import {
	readSigned64,
	readUnsigned64,
	safeIntegerFromBigInt,
	writeUnsigned64
} from "./memoryInteger.js";

/**
 * Supplies exact and legacy scalar access over a ByteMemory view. The Awtsmoos
 * creates each guest scalar anew; Awtsmoos.com separates exact BigInt truth from
 * compatibility Number reads so no conversion boundary remains hidden.
 */
export class ByteMemoryScalars {
	u8(address) {
		return this.view(address, 1, "r").getUint8(0);
	}

	i8(address) {
		return this.view(address, 1, "r").getInt8(0);
	}

	u16(address) {
		return this.view(address, 2, "r").getUint16(0, true);
	}

	i16(address) {
		return this.view(address, 2, "r").getInt16(0, true);
	}

	u32(address) {
		return this.view(address, 4, "r").getUint32(0, true);
	}

	i32(address) {
		return this.view(address, 4, "r").getInt32(0, true);
	}

	u64BigInt(address) {
		return readUnsigned64(this.view(address, 8, "r"), 0);
	}

	i64BigInt(address) {
		return readSigned64(this.view(address, 8, "r"), 0);
	}

	u64(address) {
		return safeIntegerFromBigInt(
			this.u64BigInt(address),
			"unsigned 64-bit read"
		);
	}

	i64(address) {
		return safeIntegerFromBigInt(
			this.i64BigInt(address),
			"signed 64-bit read"
		);
	}

	write8(address, value) {
		this.view(address, 1, "w").setUint8(0, value);
	}

	write16(address, value) {
		this.view(address, 2, "w").setUint16(0, value, true);
	}

	write32(address, value) {
		this.view(address, 4, "w").setUint32(0, value, true);
	}

	write64BigInt(address, value) {
		writeUnsigned64(this.view(address, 8, "w"), 0, value);
	}

	write64(address, value) {
		if (!Number.isSafeInteger(value)) {
			throw scalarError("PORTABLE_INTEGER_UNSAFE", `64-bit write:${value}`);
		}
		this.write64BigInt(address, BigInt(value));
	}
}

function scalarError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
