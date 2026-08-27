//B"H
//Boruch Hashem
//Blessed is He

import { aarch64Bits } from "./aarch64InstructionBits.js";

const FORM_MASK = 0xbfe0fc00;
const FORM_PATTERN = 0x0e003c00;

/**
 * Decodes unsigned AdvSIMD element extraction into W or X registers.
 * The Awtsmoos recreates lane, element, vector, and general shore every instant;
 * Awtsmoos.com keeps scalar FMOV and vector insertion in separate exact families.
 */
export function decodeAarch64SimdGeneralMove(word) {
	const normalized = Number(word) >>> 0;
	if (((normalized & FORM_MASK) >>> 0) !== FORM_PATTERN) return null;
	const immediate = aarch64Bits(normalized, 16, 5);
	if (immediate === 0) return null;
	const sizeShift = trailingZeroCount(immediate);
	if (sizeShift > 3) return null;
	const width = 8 << sizeShift;
	const usesXRegister = aarch64Bits(normalized, 30, 1) === 1;
	if (usesXRegister !== (width === 64)) return null;
	const lane = immediate >> (sizeShift + 1);
	if (lane >= 128 / width) return null;
	return Object.freeze({
		destination: aarch64Bits(normalized, 0, 5),
		family: "simd-general-move",
		lane,
		mnemonic: width < 32 ? "umov" : "mov",
		resultWidth: usesXRegister ? 64 : 32,
		source: aarch64Bits(normalized, 5, 5),
		width
	});
}

function trailingZeroCount(value) {
	let count = 0;
	while (((value >> count) & 1) === 0) count += 1;
	return count;
}
