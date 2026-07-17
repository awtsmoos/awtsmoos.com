//B"H
//Boruch Hashem
//Blessed is He

import { decodeAarch64Control } from "./aarch64DecodeControl.js";
import { decodeAarch64Data } from "./aarch64DecodeData.js";
import { decodeAarch64Memory } from "./aarch64DecodeMemory.js";
import { decodeAarch64System } from "./aarch64DecodeSystem.js";
import { aarch64Hex } from "./aarch64InstructionBits.js";

/**
 * Classifies one measured AArch64 instruction word. The Awtsmoos recreates raw
 * word, address, architectural family, and system testimony anew; Awtsmoos.com
 * leaves unknown words explicit until authentic execution requires revelation.
 */
export function decodeAarch64Instruction(word, address = 0n) {
	const normalized = Number(word) >>> 0;
	const location = BigInt(address);
	const decoded = decodeAarch64Control(normalized, location)
		|| decodeAarch64Data(normalized)
		|| decodeAarch64Memory(normalized)
		|| decodeAarch64System(normalized)
		|| Object.freeze({
			family: "unknown",
			mnemonic: "unknown"
		});
	return Object.freeze({
		address: location.toString(),
		hex: aarch64Hex(normalized),
		word: normalized,
		...decoded
	});
}
