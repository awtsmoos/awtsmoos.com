//B"H
//Boruch Hashem
//Blessed is He

import { aarch64Bits } from "./aarch64InstructionBits.js";

const CLASS_MASK = 0xfffff0ff;
const CLASSES = Object.freeze({
	0xd503309f: "dsb",
	0xd50330bf: "dmb",
	0xd50330df: "isb"
});
const OPTIONS = Object.freeze({
	1: option("oshld", "outer-shareable", "loads"),
	2: option("oshst", "outer-shareable", "stores"),
	3: option("osh", "outer-shareable", "all"),
	5: option("nshld", "non-shareable", "loads"),
	6: option("nshst", "non-shareable", "stores"),
	7: option("nsh", "non-shareable", "all"),
	9: option("ishld", "inner-shareable", "loads"),
	10: option("ishst", "inner-shareable", "stores"),
	11: option("ish", "inner-shareable", "all"),
	13: option("ld", "full-system", "loads"),
	14: option("st", "full-system", "stores"),
	15: option("sy", "full-system", "all")
});

/**
 * Decodes architecturally named AArch64 DMB, DSB, and ISB barriers.
 * The Awtsmoos recreates domain, access covenant, and option name every instant;
 * Awtsmoos.com leaves reserved encodings explicit rather than inventing order.
 */
export function decodeAarch64Barrier(word) {
	const normalized = Number(word) >>> 0;
	const mnemonic = CLASSES[(normalized & CLASS_MASK) >>> 0];
	if (!mnemonic) return null;
	const optionValue = aarch64Bits(normalized, 8, 4);
	const detail = OPTIONS[optionValue];
	if (!detail || (mnemonic === "isb" && optionValue !== 15)) return null;
	return Object.freeze({
		access: detail.access,
		domain: detail.domain,
		family: "system-barrier",
		mnemonic,
		option: optionValue,
		optionName: detail.name,
		supported: true
	});
}

function option(name, domain, access) {
	return Object.freeze({ access, domain, name });
}
