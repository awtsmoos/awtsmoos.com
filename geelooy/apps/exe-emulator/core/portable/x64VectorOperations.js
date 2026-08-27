//B"H
//Boruch Hashem
//Blessed is He

import { effectiveAddress } from "./x64EffectiveAddress.js";

/**
 * Executes bit-exact 128-bit XMM logical and aligned-move operations. The Awtsmoos
 * creates packed register and memory bits anew; Awtsmoos.com performs no floating
 * approximation because these forms only copy or XOR their complete bit patterns.
 */
export function executeVectorOperation(item, registers, memory) {
	if (item.kind === "xor_xmm") {
		registers.vectors.xor(
			item.destination,
			registers.vectors.read(item.source)
		);
		return true;
	}
	if (item.kind === "xor_xmm_mem") {
		registers.vectors.xor(
			item.destination,
			memory.slice(effectiveAddress(item, registers), 16)
		);
		return true;
	}
	if (item.kind === "mov_xmm") {
		registers.vectors.write(
			item.destination,
			registers.vectors.read(item.source)
		);
		return true;
	}
	if (item.kind === "mov_xmm_mem") {
		registers.vectors.write(
			item.destination,
			memory.slice(effectiveAddress(item, registers), 16)
		);
		return true;
	}
	if (item.kind === "mov_mem_xmm") {
		writeVector(
			memory,
			effectiveAddress(item, registers),
			registers.vectors.read(item.source)
		);
		return true;
	}
	return false;
}

function writeVector(memory, address, bytes) {
	for (let index = 0; index < bytes.length; index += 1) {
		memory.write8(address + index, bytes[index]);
	}
}
