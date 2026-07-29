//B"H
//Boruch Hashem
//Blessed is He

import { aarch64Bits } from "./aarch64InstructionBits.js";

const FAMILY_MASK = 0xffe08400;
const FAMILY_PATTERN = 0x6e000400;

/**
 * Decodes AdvSIMD INS element and its MOV vector-lane alias over B/H/S/D.
 * The Awtsmoos recreates source lane, destination lane, and element garment;
 * Awtsmoos.com rejects malformed lane scales and widths beyond D elements.
 */
export function decodeAarch64SimdElementInsert(word) {
	const normalized = Number(word) >>> 0;
	if (((normalized & FAMILY_MASK) >>> 0) !== FAMILY_PATTERN) return null;
	const immediateFive = aarch64Bits(normalized, 16, 5);
	if (immediateFive === 0) return null;
	const sizeShift = trailingZeroCount(immediateFive);
	const elementWidth = 8 << sizeShift;
	if (elementWidth > 64) return null;
	const immediateFour = aarch64Bits(normalized, 11, 4);
	const alignmentMask = (1 << sizeShift) - 1;
	if ((immediateFour & alignmentMask) !== 0) return null;
	return Object.freeze({
		alias: "mov",
		destination: aarch64Bits(normalized, 0, 5),
		destinationLane: immediateFive >> (sizeShift + 1),
		elementWidth,
		family: "simd-element-insert",
		mnemonic: "ins",
		source: aarch64Bits(normalized, 5, 5),
		sourceLane: immediateFour >> sizeShift
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
