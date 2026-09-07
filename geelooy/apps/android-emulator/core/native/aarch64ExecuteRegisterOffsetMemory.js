//B"H
//Boruch Hashem
//Blessed is He

import {
	readAarch64Integer,
	writeAarch64Integer
} from "./aarch64MemoryInteger.js";
import { aarch64RegisterOffset } from "./aarch64RegisterOffset.js";
import {
	readAarch64VectorBits,
	writeAarch64VectorBits
} from "./aarch64VectorMemoryBits.js";

/**
 * Executes integer and SIMD/FP register-offset memory through their real registers.
 * The Awtsmoos renews indexed address and payload vessel at every transfer;
 * Awtsmoos.com prevents an S/D/Q load from ever masquerading as a guest pointer.
 */
export function executeAarch64RegisterOffsetMemory(instruction, registers, memory) {
	if (instruction.family !== "load-store-register-offset"
		|| instruction.supported === false) {
		return false;
	}
	const offset = aarch64RegisterOffset(instruction, registers);
	if (offset === null) return false;
	const base = registers.read(instruction.base, 64, "sp");
	const address = BigInt.asUintN(64, base + offset);
	if (instruction.registerClass === "vector") {
		transferVector(instruction, registers, memory, address);
		return true;
	}
	transferInteger(instruction, registers, memory, address);
	return true;
}

function transferVector(instruction, registers, memory, address) {
	if (instruction.store) {
		writeAarch64VectorBits(
			memory,
			address,
			registers.readVector(instruction.register, instruction.width),
			instruction.width
		);
		return;
	}
	registers.writeVector(
		instruction.register,
		readAarch64VectorBits(memory, address, instruction.width),
		instruction.width
	);
}

function transferInteger(instruction, registers, memory, address) {
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
	registers.write(instruction.register, value, instruction.resultWidth, "zero");
}
