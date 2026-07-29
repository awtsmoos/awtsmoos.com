//B"H
//Boruch Hashem
//Blessed is He

import { aarch64Bits } from "./aarch64InstructionBits.js";

const FORM_MASK = 0xfffffc00;
const FORMS = new Map([
	[0x5ac00000, Object.freeze({ mnemonic: "rbit", width: 32 })],
	[0x5ac00400, Object.freeze({ mnemonic: "rev16", width: 32 })],
	[0x5ac00800, Object.freeze({ mnemonic: "rev", width: 32 })],
	[0x5ac01000, Object.freeze({ mnemonic: "clz", width: 32 })],
	[0x5ac01400, Object.freeze({ mnemonic: "cls", width: 32 })],
	[0xdac00000, Object.freeze({ mnemonic: "rbit", width: 64 })],
	[0xdac00400, Object.freeze({ mnemonic: "rev16", width: 64 })],
	[0xdac00800, Object.freeze({ mnemonic: "rev32", width: 64 })],
	[0xdac00c00, Object.freeze({ mnemonic: "rev", width: 64 })],
	[0xdac01000, Object.freeze({ mnemonic: "clz", width: 64 })],
	[0xdac01400, Object.freeze({ mnemonic: "cls", width: 64 })]
]);

/**
 * Decodes measured AArch64 one-source bit reversal and leading-count forms.
 * The Awtsmoos recreates opcode, width, source, and destination every instant;
 * Awtsmoos.com leaves reserved neighbors unknown instead of guessing semantics.
 */
export function decodeAarch64OneSourceBit(word) {
	const normalized = Number(word) >>> 0;
	const form = FORMS.get((normalized & FORM_MASK) >>> 0);
	if (!form) return null;
	return Object.freeze({
		destination: aarch64Bits(normalized, 0, 5),
		family: "one-source-bit",
		mnemonic: form.mnemonic,
		source: aarch64Bits(normalized, 5, 5),
		width: form.width
	});
}
