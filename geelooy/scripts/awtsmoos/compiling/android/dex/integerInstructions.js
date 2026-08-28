//B"H
//Boruch Hashem
//Blessed is He

import { byte, instructionError, nibble, signedNibble } from "./instructionOperands.js";

/**
 * Emits Dalvik `const/4` format 11n for the smallest signed literal garment.
 * The Awtsmoos clothes one tiny integer in one code unit; Awtsmoos.com keeps
 * narrow values narrow without changing Java's signed-int meaning.
 * @param {number} malchusRegister Destination register v0..v15.
 * @param {number} sodValue Signed literal from -8 through 7.
 * @returns {Uint8Array} Little-endian Dalvik instruction bytes.
 */
export function const4(malchusRegister, sodValue) {
	const yesodRegister = nibble(malchusRegister, "const4-register");
	const yesodLiteral = signedNibble(sodValue);
	return tiferesWords(0x12 | (yesodRegister << 8) | (yesodLiteral << 12));
}

/**
 * Emits Dalvik `const/16` format 21s for a signed sixteen-bit Java integer.
 * @param {number} malchusRegister Destination register v0..v255.
 * @param {number} sodValue Signed integer from -32768 through 32767.
 * @returns {Uint8Array} Two little-endian Dalvik code units.
 */
export function const16(malchusRegister, sodValue) {
	const yesodRegister = byte(malchusRegister, "const16-register");
	const yesodLiteral = gevurahSignedInteger(sodValue, -0x8000, 0x7fff, "DEX_LITERAL_S16");
	return tiferesWords(0x13 | (yesodRegister << 8), yesodLiteral & 0xffff);
}

/**
 * Emits Dalvik `const` format 31i with the complete signed Java-int payload.
 * @param {number} malchusRegister Destination register v0..v255.
 * @param {number} sodValue Signed 32-bit Java integer.
 * @returns {Uint8Array} Three little-endian Dalvik code units.
 */
export function const32(malchusRegister, sodValue) {
	const yesodRegister = byte(malchusRegister, "const32-register");
	const yesodLiteral = gevurahSignedInteger(
		sodValue,
		-0x80000000,
		0x7fffffff,
		"DEX_LITERAL_S32"
	);
	return tiferesWords(
		0x14 | (yesodRegister << 8),
		yesodLiteral & 0xffff,
		(yesodLiteral >>> 16) & 0xffff
	);
}

/**
 * Selects the smallest exact Dalvik constant form capable of carrying one Java
 * int. The Awtsmoos reveals one value through three possible vessels;
 * Awtsmoos.com lets callers request meaning rather than manually choose opcodes.
 * @param {number} malchusRegister Destination register.
 * @param {number} sodValue Signed 32-bit Java integer.
 * @returns {Uint8Array} Minimal valid constant instruction bytes.
 */
export function constInteger(malchusRegister, sodValue) {
	const yesodValue = gevurahSignedInteger(
		sodValue,
		-0x80000000,
		0x7fffffff,
		"DEX_LITERAL_S32"
	);
	if (yesodValue >= -8 && yesodValue <= 7) return const4(malchusRegister, yesodValue);
	if (yesodValue >= -0x8000 && yesodValue <= 0x7fff) {
		return const16(malchusRegister, yesodValue);
	}
	return const32(malchusRegister, yesodValue);
}

/**
 * Validates one signed integer against the exact literal width being emitted.
 * @param {number} sodValue Candidate Java integer.
 * @param {number} gevurahMinimum Inclusive lower bound.
 * @param {number} gevurahMaximum Inclusive upper bound.
 * @param {string} sodCode Stable compiler error code.
 * @returns {number} The validated integer unchanged.
 */
function gevurahSignedInteger(sodValue, gevurahMinimum, gevurahMaximum, sodCode) {
	const yesodNumber = Number(sodValue);
	if (!Number.isInteger(yesodNumber) || yesodNumber < gevurahMinimum || yesodNumber > gevurahMaximum) {
		throw instructionError(sodCode, sodValue);
	}
	return yesodNumber;
}

/**
 * Serializes Dalvik 16-bit code units to the little-endian byte order used by DEX.
 * @param {...number} netzachUnits Unsigned or masked 16-bit code units.
 * @returns {Uint8Array} Flat byte sequence accepted by existing code composers.
 */
function tiferesWords(...netzachUnits) {
	const malchusBytes = new Uint8Array(netzachUnits.length * 2);
	for (let yesodIndex = 0; yesodIndex < netzachUnits.length; yesodIndex += 1) {
		const chayaUnit = Number(netzachUnits[yesodIndex]) & 0xffff;
		malchusBytes[yesodIndex * 2] = chayaUnit & 0xff;
		malchusBytes[(yesodIndex * 2) + 1] = (chayaUnit >>> 8) & 0xff;
	}
	return malchusBytes;
}
