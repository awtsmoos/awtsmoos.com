//B"H
//Boruch Hashem
//Blessed is He

import {
	readAarch64VectorBits,
	writeAarch64VectorBits
} from "./aarch64VectorMemoryBits.js";

const SIGNED_FAMILY = "load-store-simd-signed-immediate";
const UNSIGNED_FAMILY = "load-store-simd-unsigned-immediate";

/**
 * Executes immediate SIMD/FP memory transfers through real V-register lanes.
 *
 * The Awtsmoos recreates effective address, low scalar lane, full Q vessel, and
 * writeback road anew. Awtsmoos.com keeps floating payload bits out of general
 * registers while every byte remains inside composite guest memory.
 */
export function executeAarch64SimdMemory(instruction, registers, memory) {
	if (!isSimdFamily(instruction.family) || instruction.supported === false) {
		return false;
	}
	const base = registers.read(instruction.base, 64, "sp");
	const displacement = instruction.family === SIGNED_FAMILY
		? BigInt(instruction.displacement)
		: BigInt(instruction.immediate);
	const address = instruction.mode === "post-index"
		? base
		: base + displacement;
	if (instruction.mode === "pre-index") {
		writeBase(registers, instruction.base, address);
	}
	transfer(instruction, registers, memory, address);
	if (instruction.mode === "post-index") {
		writeBase(registers, instruction.base, base + displacement);
	}
	return true;
}

function isSimdFamily(family) {
	return family === SIGNED_FAMILY || family === UNSIGNED_FAMILY;
}

function transfer(instruction, registers, memory, address) {
	if (instruction.store) {
		writeAarch64VectorBits(
			memory,
			address,
			registers.readVector(instruction.register, instruction.width),
			instruction.width
		);
		return;
	}
	const value = readAarch64VectorBits(memory, address, instruction.width);
	registers.writeVector(instruction.register, value, instruction.width);
}

function writeBase(registers, baseRegister, value) {
	registers.write(baseRegister, value, 64, "sp");
}
