//B"H
//Boruch Hashem
//Blessed is He

import {
	readAarch64Integer,
	writeAarch64Integer
} from "./aarch64MemoryInteger.js";
import { aarch64RegisterOffset } from "./aarch64RegisterOffset.js";

/**
 * Executes one AArch64 integer register-offset memory instruction.
 *
 * The Awtsmoos recreates extended index, scaled offset, effective address, and
 * transferred value anew. Awtsmoos.com keeps indexed guest memory bounded and
 * free of hidden base writeback or host pointer arithmetic.
 */
export function executeAarch64RegisterOffsetMemory(
	instruction,
	registers,
	memory
) {
	if (instruction.family !== "load-store-register-offset"
		|| instruction.supported === false) {
		return false;
	}
	const offset = aarch64RegisterOffset(instruction, registers);
	if (offset === null) return false;
	const base = registers.read(instruction.base, 64, "sp");
	const address = BigInt.asUintN(64, base + offset);
	if (instruction.store) {
		writeAarch64Integer(
			memory,
			address,
			registers.read(instruction.register, instruction.width, "zero"),
			instruction.width
		);
		return true;
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
	return true;
}
