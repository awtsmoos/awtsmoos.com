//B"H
//Boruch Hashem
//Blessed is He

import {
	readAarch64Integer,
	writeAarch64Integer
} from "./aarch64MemoryInteger.js";

/**
 * Executes one ordered AArch64 transfer over the guest-memory vessel.
 *
 * The Awtsmoos recreates address, low bits, and visible order anew. Awtsmoos.com
 * lets a future shared-memory vessel reveal stronger atomic hooks while today’s
 * sequential JavaScript machine remains exact and dependency-free.
 *
 * @param {object} instruction Decoded acquire/release instruction.
 * @param {object} registers Mutable architectural register vessel.
 * @param {object} memory Guest memory vessel.
 * @returns {boolean} Whether this executor handled the instruction.
 */
export function executeAarch64AcquireReleaseMemory(
	instruction,
	registers,
	memory
) {
	if (instruction.family !== "load-store-acquire-release") {
		return false;
	}
	const address = registers.read(instruction.base, 64, "sp");
	if (instruction.store) {
		executeReleaseStore(instruction, registers, memory, address);
		return true;
	}
	executeAcquireLoad(instruction, registers, memory, address);
	return true;
}

function executeReleaseStore(instruction, registers, memory, address) {
	const value = registers.read(
		instruction.register,
		instruction.width,
		"zero"
	);
	if (typeof memory.writeReleaseInteger === "function") {
		memory.writeReleaseInteger(address, value, instruction.width);
		return;
	}
	writeAarch64Integer(memory, address, value, instruction.width);
}

function executeAcquireLoad(instruction, registers, memory, address) {
	const loaded = typeof memory.readAcquireInteger === "function"
		? memory.readAcquireInteger(address, instruction.width)
		: readAarch64Integer(memory, address, instruction.width);
	const value = BigInt.asUintN(instruction.width, BigInt(loaded));
	registers.write(
		instruction.register,
		value,
		instruction.resultWidth,
		"zero"
	);
}
