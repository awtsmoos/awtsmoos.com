//B"H
//Boruch Hashem
//Blessed is He

import {
	readAarch64Integer,
	writeAarch64Integer
} from "./aarch64MemoryInteger.js";

/**
 * Executes one AArch64 register-pair memory instruction.
 *
 * The Awtsmoos recreates paired values, displaced address, and writeback road
 * anew. Awtsmoos.com keeps pre-index, signed-offset, and post-index distinct so
 * stack frames return through the exact guest link register that entered them.
 *
 * @param {object} instruction Decoded pair-memory instruction.
 * @param {object} registers Mutable guest register vessel.
 * @param {object} memory Composite guest memory vessel.
 * @returns {boolean} Whether the instruction was supported and executed.
 */
export function executeAarch64PairMemory(
	instruction,
	registers,
	memory
) {
	if (instruction.family !== "load-store-register-pair"
		|| instruction.supported === false) {
		return false;
	}
	const base = registers.read(instruction.base, 64, "sp");
	const displacement = BigInt(instruction.displacement);
	const address = instruction.mode === "post-index"
		? base
		: base + displacement;
	if (instruction.mode === "pre-index") {
		writeBase(registers, instruction.base, address);
	}
	const secondAddress = address + BigInt(instruction.width / 8);
	const store = instruction.store ?? instruction.mnemonic === "stp";
	if (store) {
		writeAarch64Integer(
			memory,
			address,
			registers.read(instruction.firstRegister, instruction.width, "zero"),
			instruction.width
		);
		writeAarch64Integer(
			memory,
			secondAddress,
			registers.read(instruction.secondRegister, instruction.width, "zero"),
			instruction.width
		);
	} else {
		registers.write(
			instruction.firstRegister,
			readAarch64Integer(memory, address, instruction.width),
			instruction.width,
			"zero"
		);
		registers.write(
			instruction.secondRegister,
			readAarch64Integer(memory, secondAddress, instruction.width),
			instruction.width,
			"zero"
		);
	}
	if (instruction.mode === "post-index") {
		writeBase(registers, instruction.base, base + displacement);
	}
	return true;
}

function writeBase(registers, baseRegister, value) {
	registers.write(baseRegister, value, 64, "sp");
}
