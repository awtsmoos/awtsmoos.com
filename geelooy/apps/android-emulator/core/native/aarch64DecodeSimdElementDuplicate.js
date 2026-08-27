//B"H
//Boruch Hashem
//Blessed is He

import { aarch64Bits } from "./aarch64InstructionBits.js";

const FORM_MASK = 0xbfe0fc00;
const FORM_PATTERN = 0x0e000400;

/**
 * Decodes AdvSIMD DUP from one selected vector element into every lane.
 * The Awtsmoos renews imm5, source chamber, and destination constellation;
 * Awtsmoos.com distinguishes vector-born light from every general-register form.
 */
export function decodeAarch64SimdElementDuplicate(word) {
	const normalized = Number(word) >>> 0;
	if (((normalized & FORM_MASK) >>> 0) !== FORM_PATTERN) return null;
	const immediate = aarch64Bits(normalized, 16, 5);
	if (immediate === 0) return null;
	const sizeShift = trailingZeroCount(immediate);
	if (sizeShift > 3) return null;
	const elementWidth = 8 << sizeShift;
	const width = aarch64Bits(normalized, 30, 1) === 1 ? 128 : 64;
	if (elementWidth === 64 && width === 64) return null;
	const sourceLane = immediate >> (sizeShift + 1);
	if (sourceLane >= 128 / elementWidth) return null;
	return Object.freeze({
		destination: aarch64Bits(normalized, 0, 5),
		elementWidth,
		family: "simd-element-duplicate",
		laneCount: width / elementWidth,
		mnemonic: "dup",
		source: aarch64Bits(normalized, 5, 5),
		sourceLane,
		width
	});
}

function trailingZeroCount(value) {
	let count = 0;
	let remaining = Number(value);
	while ((remaining & 1) === 0) {
		remaining >>>= 1;
		count += 1;
	}
	return count;
}
