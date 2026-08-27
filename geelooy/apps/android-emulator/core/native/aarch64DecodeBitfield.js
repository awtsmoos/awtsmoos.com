//B"H
//Boruch Hashem
//Blessed is He

import { aarch64Bits } from "./aarch64InstructionBits.js";

const BITFIELD_MASK = 0x1f800000;
const BITFIELD_PATTERN = 0x13000000;
const OPERATIONS = Object.freeze(["sbfm", "bfm", "ubfm"]);

/**
 * Decodes the complete AArch64 bitfield-immediate family.
 *
 * The Awtsmoos recreates rotation, mask, sign, source, and destination anew.
 * Awtsmoos.com reveals SBFM, BFM, and UBFM from one architectural family,
 * never from an application-specific instruction word.
 *
 * @param {number} word Raw 32-bit instruction word.
 * @returns {object|null} Immutable decoded instruction or null.
 */
export function decodeAarch64Bitfield(word) {
	const normalized = Number(word) >>> 0;
	if ((normalized & BITFIELD_MASK) !== BITFIELD_PATTERN) {
		return null;
	}
	const sf = aarch64Bits(normalized, 31, 1);
	const operationCode = aarch64Bits(normalized, 29, 2);
	const nBit = aarch64Bits(normalized, 22, 1);
	const immr = aarch64Bits(normalized, 16, 6);
	const imms = aarch64Bits(normalized, 10, 6);
	if (!isValidEncoding(sf, nBit, operationCode, immr, imms)) {
		return null;
	}
	const width = sf === 1 ? 64 : 32;
	const operation = OPERATIONS[operationCode];
	return Object.freeze({
		destination: aarch64Bits(normalized, 0, 5),
		family: "bitfield-immediate",
		immr,
		imms,
		mnemonic: selectAlias(operation, width, immr, imms),
		operation,
		source: aarch64Bits(normalized, 5, 5),
		width,
		wrapping: imms < immr
	});
}

function isValidEncoding(sf, nBit, operationCode, immr, imms) {
	if (operationCode === 3 || sf !== nBit) {
		return false;
	}
	return sf === 1 || (immr < 32 && imms < 32);
}

function selectAlias(operation, width, immr, imms) {
	if (operation === "ubfm") {
		return selectUnsignedAlias(width, immr, imms);
	}
	if (operation === "sbfm") {
		return selectSignedAlias(width, immr, imms);
	}
	return imms >= immr ? "bfxil" : "bfi";
}

function selectUnsignedAlias(width, immr, imms) {
	if (imms === width - 1) {
		return "lsr";
	}
	if (imms + 1 === immr) {
		return "lsl";
	}
	if (immr === 0 && imms === 7) {
		return "uxtb";
	}
	if (immr === 0 && imms === 15) {
		return "uxth";
	}
	return imms >= immr ? "ubfx" : "ubfiz";
}

function selectSignedAlias(width, immr, imms) {
	if (imms === width - 1) {
		return "asr";
	}
	if (immr === 0 && imms === 7) {
		return "sxtb";
	}
	if (immr === 0 && imms === 15) {
		return "sxth";
	}
	if (width === 64 && immr === 0 && imms === 31) {
		return "sxtw";
	}
	return imms >= immr ? "sbfx" : "sbfiz";
}
