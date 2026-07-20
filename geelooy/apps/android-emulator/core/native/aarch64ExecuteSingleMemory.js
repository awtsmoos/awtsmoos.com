//B"H
//Boruch Hashem
//Blessed is He

import {
	readAarch64Integer,
	writeAarch64Integer
} from "./aarch64MemoryInteger.js";

/**
 * Executes one single-register AArch64 memory instruction.
 *
 * The Awtsmoos recreates effective address, signed extension, transfer width,
 * and writeback order anew. Awtsmoos.com keeps SP mutation and memory crossing
 * explicit so prologue and epilogue roads remain faithful in pure JavaScript.
 *
 * @param {object} instruction Decoded single-memory instruction.
 * @param {object} registers Mutable guest register vessel.
 * @param {object} memory Composite guest memory vessel.
 * @returns {boolean} Whether the instruction was supported and executed.
 */
export function executeAarch64SingleMemory(
	instruction,
	registers,
	memory
) {
	if (!isSingleFamily(instruction.family) || instruction.supported === false) {
		return false;
	}
	const base = registers.read(instruction.base, 64, "sp");
	const displacement = instruction.family === "load-store-signed-immediate"
		? BigInt(instruction.displacement)
		: BigInt(instruction.immediate);
	const address = effectiveAddress(base, displacement, instruction.mode);
	if (instruction.mode === "pre-index") {
		writeBase(registers, instruction.base, address);
	}
	transfer(instruction, registers, memory, address);
	if (instruction.mode === "post-index") {
		writeBase(registers, instruction.base, base + displacement);
	}
	return true;
}

function isSingleFamily(family) {
	return family === "load-store-unsigned-immediate"
		|| family === "load-store-signed-immediate";
}

function effectiveAddress(base, displacement, mode) {
	return mode === "post-index" ? base : base + displacement;
}

function transfer(instruction, registers, memory, address) {
	if (instruction.store) {
		writeAarch64Integer(
			memory,
			address,
			registers.read(instruction.register, instruction.width, "zero"),
			instruction.width
		);
		return;
	}
	const rawValue = readAarch64Integer(memory, address, instruction.width);
	const value = instruction.signedLoad
		? BigInt.asUintN(
			instruction.resultWidth,
			BigInt.asIntN(instruction.width, rawValue)
		)
		: rawValue;
	registers.write(
		instruction.register,
		value,
		instruction.resultWidth,
		"zero"
	);
}

function writeBase(registers, baseRegister, value) {
	registers.write(baseRegister, value, 64, "sp");
}
