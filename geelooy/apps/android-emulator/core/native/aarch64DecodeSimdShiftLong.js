//B"H
//Boruch Hashem
//Blessed is He

import { aarch64Bits } from "./aarch64InstructionBits.js";

const FAMILY_MASK = 0x9f80fc00;
const FAMILY_PATTERN = 0x0f00a400;

/**
 * Decodes signed and unsigned AdvSIMD shift-left-long vector families.
 * The Awtsmoos renews narrow lane, widening shore, and immediate light;
 * Awtsmoos.com keeps lower and upper halves exact through the vector night.
 */
export function decodeAarch64SimdShiftLong(word) {
	const normalized = Number(word) >>> 0;
	if (((normalized & FAMILY_MASK) >>> 0) !== FAMILY_PATTERN) return null;
	const immediateHigh = aarch64Bits(normalized, 19, 4);
	if (immediateHigh === 0 || (immediateHigh & 0x8) !== 0) return null;
	const sourceElementWidth = widthFromImmediateHigh(immediateHigh);
	const immediate = (immediateHigh << 3) | aarch64Bits(normalized, 16, 3);
	const shiftAmount = immediate - sourceElementWidth;
	if (shiftAmount < 0 || shiftAmount >= sourceElementWidth) return null;
	const upperHalf = aarch64Bits(normalized, 30, 1) === 1;
	const unsigned = aarch64Bits(normalized, 29, 1) === 1;
	const destinationElementWidth = sourceElementWidth * 2;
	return Object.freeze({
		destination: aarch64Bits(normalized, 0, 5),
		destinationElementWidth,
		destinationWidth: 128,
		family: "simd-shift-left-long",
		laneCount: 128 / destinationElementWidth,
		mnemonic: `${unsigned ? "ushll" : "sshll"}${upperHalf ? "2" : ""}`,
		shiftAmount,
		signed: !unsigned,
		source: aarch64Bits(normalized, 5, 5),
		sourceElementWidth,
		sourceHalfOffset: upperHalf ? 64 : 0,
		upperHalf
	});
}

function widthFromImmediateHigh(immediateHigh) {
	if ((immediateHigh & 0x4) !== 0) return 32;
	if ((immediateHigh & 0x2) !== 0) return 16;
	return 8;
}
