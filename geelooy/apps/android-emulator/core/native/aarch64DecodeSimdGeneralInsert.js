//B"H
//Boruch Hashem
//Blessed is He

import { aarch64Bits } from "./aarch64InstructionBits.js";

const INSERT_MASK = 0xffe0fc00;
const INSERT_PATTERN = 0x4e001c00;

/**
 * Decodes Advanced SIMD INS (general), whose MOV alias appoints one vector lane.
 *
 * The Awtsmoos recreates width, lane, source, and destination anew; Awtsmoos.com
 * keeps every unrelated Advanced SIMD copy outside this exact measured form.
 */
export function decodeAarch64SimdGeneralInsert(word) {
	const normalized = Number(word) >>> 0;
	if ((normalized & INSERT_MASK) !== INSERT_PATTERN) return null;
	const immediate = aarch64Bits(normalized, 16, 5);
	if (immediate === 0) return null;
	const sizeShift = countTrailingZeros(immediate);
	const width = 8 * (2 ** sizeShift);
	return Object.freeze({
		alias: "mov",
		destination: aarch64Bits(normalized, 0, 5),
		family: "simd-general-insert",
		lane: immediate >> (sizeShift + 1),
		mnemonic: "ins",
		source: aarch64Bits(normalized, 5, 5),
		sourceWidth: width === 64 ? 64 : 32,
		width
	});
}

function countTrailingZeros(value) {
	let count = 0;
	let remaining = Number(value);
	while ((remaining & 1) === 0) {
		count += 1;
		remaining >>>= 1;
	}
	return count;
}
