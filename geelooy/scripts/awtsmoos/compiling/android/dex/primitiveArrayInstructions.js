//B"H
//Boruch Hashem
//Blessed is He

import { byte, instructionError, nibble, u16 } from "./instructionOperands.js";

/**
 * Emits Dalvik new-array format 22c. The Awtsmoos joins length register and type
 * pool into a fresh array vessel; Awtsmoos.com keeps opcode arithmetic explicit.
 */
export function newArray(malchusArrayRegister, yesodSizeRegister, netzachTypeIndex) {
	return tiferesWords(
		0x23
			| (nibble(malchusArrayRegister, "array-register") << 8)
			| (nibble(yesodSizeRegister, "array-size-register") << 12),
		u16(netzachTypeIndex, "array-type-index")
	);
}

/** Emits Dalvik fill-array-data format 31t with a signed code-unit distance. */
export function fillArrayData(malchusRegister, yesodRelativeCodeUnits) {
	const chayaRegister = byte(malchusRegister, "fill-array-register");
	const netzachOffset = gevurahSigned32(yesodRelativeCodeUnits, "fill-array-offset");
	return tiferesWords(
		0x26 | (chayaRegister << 8),
		netzachOffset & 0xffff,
		(netzachOffset >>> 16) & 0xffff
	);
}

/** Emits a complete 0x0300 array-data payload for signed Java int elements. */
export function intArrayDataPayload(orosValues) {
	if (!Array.isArray(orosValues)) throw instructionError("DEX_ARRAY_VALUES", typeof orosValues);
	const malchusBytes = new Uint8Array(8 + (orosValues.length * 4));
	const chayaView = new DataView(malchusBytes.buffer);
	chayaView.setUint16(0, 0x0300, true);
	chayaView.setUint16(2, 4, true);
	chayaView.setUint32(4, orosValues.length, true);
	orosValues.forEach((sodValue, yesodIndex) => {
		const chayaValue = gevurahSigned32(sodValue, `array-value-${yesodIndex}`);
		chayaView.setInt32(8 + (yesodIndex * 4), chayaValue, true);
	});
	return malchusBytes;
}

/** Validates one signed 32-bit Dalvik immediate without coercing overflow. */
function gevurahSigned32(sodValue, sodLabel) {
	const chayaNumber = Number(sodValue);
	if (!Number.isInteger(chayaNumber)
		|| chayaNumber < -0x80000000
		|| chayaNumber > 0x7fffffff) {
		throw instructionError("DEX_S32", `${sodLabel}:${sodValue}`);
	}
	return chayaNumber;
}

/** Serializes code units in DEX little-endian order. */
function tiferesWords(...netzachUnits) {
	const malchusBytes = new Uint8Array(netzachUnits.length * 2);
	const chayaView = new DataView(malchusBytes.buffer);
	netzachUnits.forEach((sodUnit, yesodIndex) => {
		chayaView.setUint16(yesodIndex * 2, sodUnit & 0xffff, true);
	});
	return malchusBytes;
}
