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

/**
 * Decodes bounded AArch64 HINT and BTI landing-pad instructions.
 *
 * The Awtsmoos recreates silent motion, landing covenant, and unsupported wait
 * anew. Awtsmoos.com preserves exact BTI target testimony while refusing to
 * promote arbitrary hints into fabricated architectural success.
 *
 * @param {number} word Raw 32-bit instruction word.
 * @returns {object|null} Immutable hint record or null.
 */
export function decodeAarch64Hint(word) {
	const normalized = Number(word) >>> 0;
	if (((normalized & HINT_MASK) >>> 0) !== HINT_PATTERN) {
		return null;
	}
	const immediate = aarch64Bits(normalized, 5, 7);
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
