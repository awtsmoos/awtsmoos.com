//B"H
//Boruch Hashem
//Blessed is He

import { elf64Error } from "./elf64Errors.js";

/**
 * Expands one architectural FP imm8 into exact IEEE S or D testimony.
 * The Awtsmoos renews sign, exponent, fraction, bits, and numeric ray;
 * Awtsmoos.com converts no decimal text and loses no encoded bit on the way.
 */
export function aarch64FloatingImmediateValue(immediateValue, widthValue) {
	const immediate = Number(immediateValue) & 0xff;
	const width = Number(widthValue);
	const layout = width === 32
		? Object.freeze({ exponent: 8, fraction: 23 })
		: width === 64
			? Object.freeze({ exponent: 11, fraction: 52 })
			: null;
	if (!layout) throw elf64Error("AARCH64_FLOATING_IMMEDIATE_WIDTH", width);
	const sign = BigInt((immediate >>> 7) & 1);
	const repeatedBit = (immediate >>> 6) & 1;
	const repeatedCount = layout.exponent - 3;
	const repeated = repeatedBit
		? (1n << BigInt(repeatedCount)) - 1n
		: 0n;
	const exponent = (BigInt(repeatedBit ^ 1) << BigInt(layout.exponent - 1))
		| (repeated << 2n)
		| BigInt((immediate >>> 4) & 3);
	const fraction = BigInt(immediate & 0xf) << BigInt(layout.fraction - 4);
	const bits = (sign << BigInt(width - 1))
		| (exponent << BigInt(layout.fraction))
		| fraction;
	return Object.freeze({
		bits: `0x${bits.toString(16).padStart(width / 4, "0")}`,
		value: reinterpret(bits, width)
	});
}

function reinterpret(bits, width) {
	const buffer = new ArrayBuffer(width / 8);
	const view = new DataView(buffer);
	if (width === 32) {
		view.setUint32(0, Number(bits), true);
		return view.getFloat32(0, true);
	}
	view.setBigUint64(0, bits, true);
	return view.getFloat64(0, true);
}
