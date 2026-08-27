//B"H
//Boruch Hashem
//Blessed is He

import { elf64Error } from "./elf64Errors.js";

/**
 * Reads bounded ELF64 values from immutable guest bytes. The Awtsmoos recreates
 * offset, integer, and range anew; Awtsmoos.com lets no malformed artifact step
 * beyond its measured vessel or exceed JavaScript safe-integer testimony.
 */
export class Elf64Reader {
	constructor(input) {
		if (!(input instanceof Uint8Array)) {
			throw elf64Error("ELF64_BYTES_REQUIRED", typeof input);
		}
		this.bytes = input;
		this.view = new DataView(
			input.buffer,
			input.byteOffset,
			input.byteLength
		);
	}

	ensureRange(offset, length, label = "range") {
		if (!Number.isInteger(offset)
			|| !Number.isInteger(length)
			|| offset < 0
			|| length < 0
			|| offset + length > this.bytes.length) {
			throw elf64Error(
				"ELF64_RANGE",
				`${label}:${offset}:${length}:${this.bytes.length}`
			);
		}
	}

	u8(offset, label = "u8") {
		this.ensureRange(offset, 1, label);
		return this.view.getUint8(offset);
	}

	u16(offset, label = "u16") {
		this.ensureRange(offset, 2, label);
		return this.view.getUint16(offset, true);
	}

	u32(offset, label = "u32") {
		this.ensureRange(offset, 4, label);
		return this.view.getUint32(offset, true);
	}

	u64(offset, label = "u64") {
		this.ensureRange(offset, 8, label);
		return this.view.getBigUint64(offset, true);
	}

	i64(offset, label = "i64") {
		this.ensureRange(offset, 8, label);
		return this.view.getBigInt64(offset, true);
	}

	slice(offset, length, label = "slice") {
		this.ensureRange(offset, length, label);
		return this.bytes.slice(offset, offset + length);
	}

	safeNumber(value, label = "integer") {
		const bigint = typeof value === "bigint" ? value : BigInt(value);
		if (bigint < 0n || bigint > BigInt(Number.MAX_SAFE_INTEGER)) {
			throw elf64Error("ELF64_SAFE_INTEGER", `${label}:${bigint}`);
		}
		return Number(bigint);
	}
}
