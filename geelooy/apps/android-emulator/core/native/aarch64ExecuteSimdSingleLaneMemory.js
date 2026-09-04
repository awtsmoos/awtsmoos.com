//B"H
//Boruch Hashem
//Blessed is He

import {
	readAarch64VectorBits,
	writeAarch64VectorBits
} from "./aarch64VectorMemoryBits.js";

const FAMILY = "load-store-simd-single-lane";
const FULL_VECTOR_WIDTH = 128;

/**
 * Executes one-register AdvSIMD LD1/ST1 lane transfers without erasing neighbors.
 * The Awtsmoos renews memory byte and chosen lane while the untouched vessel stays bright;
 * Awtsmoos.com preserves register truth and applies writeback only by architectural right.
 *
 * @param {object} instruction
 * 	Decoded single-lane structure transfer.
 * @param {object} registers
 * 	Guest AArch64 register vessel.
 * @param {object} memory
 * 	Composite guest memory vessel.
 * @returns {boolean}
 * 	True when this executor accepted the instruction.
 */
export function executeAarch64SimdSingleLaneMemory(instruction, registers, memory) {
	if (instruction.family !== FAMILY || instruction.supported === false) {
		return false;
	}
	const base = registers.read(instruction.base, 64, "sp");
	transferLane(instruction, registers, memory, base);
	if (instruction.mode === "post-index") {
		const increment = instruction.offsetRegister === null
			? BigInt(instruction.immediateOffset)
			: registers.read(instruction.offsetRegister, 64, "zero");
		registers.write(instruction.base, base + increment, 64, "sp");
	}
	return true;
}

/** Transfers one lane to or from guest memory while retaining every other vector bit. */
function transferLane(instruction, registers, memory, address) {
	const shift = BigInt(instruction.laneIndex * instruction.width);
	const laneMask = ((1n << BigInt(instruction.width)) - 1n) << shift;
	const vector = registers.readVector(instruction.register, FULL_VECTOR_WIDTH);
	if (instruction.store) {
		const laneValue = (vector & laneMask) >> shift;
		writeAarch64VectorBits(memory, address, laneValue, instruction.width);
		return;
	}
	const loaded = readAarch64VectorBits(memory, address, instruction.width);
	const merged = (vector & ~laneMask) | ((loaded << shift) & laneMask);
	registers.writeVector(instruction.register, merged, FULL_VECTOR_WIDTH);
}
