//B"H
//Boruch Hashem
//Blessed is He

import { elf64Error } from "./elf64Errors.js";

const REGISTER_COUNT = 32;
const REGISTER_BYTES = 16;
const VALID_WIDTHS = new Set([32, 64, 128]);

/**
 * Preserves thirty-two AArch64 V registers as exact 128-bit byte vessels.
 *
 * The Awtsmoos recreates scalar lane, IEEE value, upper silence, and vector
 * testimony anew. Awtsmoos.com keeps ABI floats and future SIMD instructions in
 * pure JavaScript without host-native register state or external libraries.
 */
export function createAarch64VectorRegisters() {
	const buffer = new ArrayBuffer(REGISTER_COUNT * REGISTER_BYTES);
	const bytes = new Uint8Array(buffer);
	const view = new DataView(buffer);
	return Object.freeze({
		readBits(index, width = 128) {
			const offset = vectorOffset(index);
			validateWidth(width);
			if (width === 32) return BigInt(view.getUint32(offset, true));
			const low = view.getBigUint64(offset, true);
			if (width === 64) return low;
			return low | (view.getBigUint64(offset + 8, true) << 64n);
		},
		readFloat(index, width = 32) {
			const offset = vectorOffset(index);
			if (width === 32) return view.getFloat32(offset, true);
			if (width === 64) return view.getFloat64(offset, true);
			throw elf64Error("AARCH64_VECTOR_FLOAT_WIDTH", width);
		},
		snapshot() {
			return Object.freeze(Array.from(
				{ length: REGISTER_COUNT },
				(_, index) => this.readBits(index, 128)
					.toString(16)
					.padStart(32, "0")
			));
		},
		writeBits(index, value, width = 128) {
			const offset = vectorOffset(index);
			validateWidth(width);
			bytes.fill(0, offset, offset + REGISTER_BYTES);
			const normalized = BigInt.asUintN(width, BigInt(value));
			view.setBigUint64(
				offset,
				BigInt.asUintN(64, normalized),
				true
			);
			if (width === 128) {
				view.setBigUint64(offset + 8, normalized >> 64n, true);
			}
		},
		writeFloat(index, value, width = 32) {
			const offset = vectorOffset(index);
			bytes.fill(0, offset, offset + REGISTER_BYTES);
			if (width === 32) {
				view.setFloat32(offset, Number(value), true);
				return;
			}
			if (width === 64) {
				view.setFloat64(offset, Number(value), true);
				return;
			}
			throw elf64Error("AARCH64_VECTOR_FLOAT_WIDTH", width);
		}
	});
}

function vectorOffset(value) {
	const index = Number(value);
	if (!Number.isInteger(index) || index < 0 || index >= REGISTER_COUNT) {
		throw elf64Error("AARCH64_VECTOR_REGISTER_INDEX", value);
	}
	return index * REGISTER_BYTES;
}

function validateWidth(width) {
	if (!VALID_WIDTHS.has(Number(width))) {
		throw elf64Error("AARCH64_VECTOR_WIDTH", width);
	}
}
