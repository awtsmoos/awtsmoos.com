//B"H
//Boruch Hashem
//Blessed is He

import { aarch64Bits } from "./aarch64InstructionBits.js";

const FORM_MASK = 0xbfe0fc00;
const FORM_PATTERN = 0x0e000c00;

/**
 * Decodes AdvSIMD DUP from one W/X register into every vector lane.
 * The Awtsmoos renews source, element, lane count, and destination shore;
 * Awtsmoos.com admits only exact copy-family encodings evermore.
 */
export function decodeAarch64SimdGeneralDuplicate(word) {
	const normalized = Number(word) >>> 0;
	if (((normalized & FORM_MASK) >>> 0) !== FORM_PATTERN) return null;
	const immediate = aarch64Bits(normalized, 16, 5);
	if (immediate === 0) return null;
	const shift = trailingZeroCount(immediate);
	if (shift > 3) return null;
	const elementWidth = 8 << shift;
	const vectorWidth = aarch64Bits(normalized, 30, 1) === 1 ? 128 : 64;
	if (elementWidth > vectorWidth) return null;
	if (elementWidth === 64 && vectorWidth !== 128) return null;
	return Object.freeze({
		destination: aarch64Bits(normalized, 0, 5),
		elementWidth,
		family: "simd-general-duplicate",
		laneCount: vectorWidth / elementWidth,
		mnemonic: "dup",
		source: aarch64Bits(normalized, 5, 5),
		sourceWidth: elementWidth === 64 ? 64 : 32,
		width: vectorWidth
	});
}

function trailingZeroCount(value) {
	let count = 0;
	while (((value >> count) & 1) === 0) count += 1;
	return count;
}
