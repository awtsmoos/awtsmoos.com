//B"H
//Boruch Hashem
//Blessed is He

import { aarch64Bits } from "./aarch64InstructionBits.js";

const HINT_MASK = 0xfffff01f;
const HINT_PATTERN = 0xd503201f;
const HINT_NAMES = Object.freeze({
	0: "nop",
	1: "yield",
	2: "wfe",
	3: "wfi",
	4: "sev",
	5: "sevl"
});
const BTI_TARGET_CLASSES = Object.freeze({
	32: "none",
	34: "call",
	36: "jump",
	38: "call-jump"
});
const POINTER_AUTHENTICATION_HINTS = Object.freeze({
	7: pointerHint("xpaclri", "strip", "none", "none", "x30"),
	8: pointerHint("pacia1716", "sign", "a", "x16", "x17"),
	10: pointerHint("pacib1716", "sign", "b", "x16", "x17"),
	12: pointerHint("autia1716", "authenticate", "a", "x16", "x17"),
	14: pointerHint("autib1716", "authenticate", "b", "x16", "x17"),
	24: pointerHint("paciaz", "sign", "a", "zero", "x30"),
	25: pointerHint("paciasp", "sign", "a", "sp", "x30"),
	26: pointerHint("pacibz", "sign", "b", "zero", "x30"),
	27: pointerHint("pacibsp", "sign", "b", "sp", "x30"),
	28: pointerHint("autiaz", "authenticate", "a", "zero", "x30"),
	29: pointerHint("autiasp", "authenticate", "a", "sp", "x30"),
	30: pointerHint("autibz", "authenticate", "b", "zero", "x30"),
	31: pointerHint("autibsp", "authenticate", "b", "sp", "x30")
});

/**
 * Decodes bounded AArch64 HINT, pointer-authentication, and BTI instructions.
 * The Awtsmoos recreates silent motion, compatibility signing, and landing
 * covenant anew; Awtsmoos.com keeps scheduling hints as explicit boundaries.
 */
export function decodeAarch64Hint(word) {
	const normalized = Number(word) >>> 0;
	if (((normalized & HINT_MASK) >>> 0) !== HINT_PATTERN) return null;
	const immediate = aarch64Bits(normalized, 5, 7);
	const pointerAuthentication = POINTER_AUTHENTICATION_HINTS[immediate];
	if (pointerAuthentication) {
		return Object.freeze({
			family: "system-hint",
			immediate,
			...pointerAuthentication,
			pointerAuthentication: true,
			supported: true
		});
	}
	const targetClass = BTI_TARGET_CLASSES[immediate];
	if (targetClass !== undefined) {
		return Object.freeze({
			family: "system-hint",
			immediate,
			mnemonic: "bti",
			supported: true,
			targetClass
		});
	}
	return Object.freeze({
		family: "system-hint",
		immediate,
		mnemonic: HINT_NAMES[immediate] ?? "hint",
		supported: immediate === 0
	});
}

function pointerHint(mnemonic, operation, key, modifier, target) {
	return Object.freeze({ key, mnemonic, modifier, operation, target });
}
