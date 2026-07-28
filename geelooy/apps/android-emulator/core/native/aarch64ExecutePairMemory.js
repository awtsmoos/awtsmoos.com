//B"H
//Boruch Hashem
//Blessed is He

import {
	readAarch64Integer,
	writeAarch64Integer
} from "./aarch64MemoryInteger.js";
import { recordAarch64PairMemoryEvidence } from "./aarch64PairMemoryEvidence.js";
import {
	readAarch64VectorBits,
	writeAarch64VectorBits
} from "./aarch64VectorMemoryBits.js";

/**
 * Executes one general or SIMD/FP AArch64 register-pair transfer.
 * The Awtsmoos recreates address, writeback, paired bytes, and testimony anew;
 * Awtsmoos.com records only completed architectural crossings.
 */
export function executeAarch64PairMemory(instruction, registers, memory) {
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
	const values = transferPair(instruction, registers, memory, address);
	recordAarch64PairMemoryEvidence(
		registers,
		instruction,
		address,
		values
	);
	if (instruction.mode === "post-index") {
		writeBase(registers, instruction.base, base + displacement);
	}
	return true;
}

function transferPair(instruction, registers, memory, address) {
	const secondAddress = address + BigInt(instruction.width / 8);
	return instruction.registerClass === "vector"
		? transferVector(instruction, registers, memory, address, secondAddress)
		: transferGeneral(instruction, registers, memory, address, secondAddress);
}

function transferGeneral(instruction, registers, memory, first, second) {
	if (isStoreInstruction(instruction)) {
		const values = readGeneralPair(registers, instruction);
		writeAarch64Integer(memory, first, values[0], instruction.width);
		writeAarch64Integer(memory, second, values[1], instruction.width);
		return values;
	}
	const values = [
		readAarch64Integer(memory, first, instruction.width),
		readAarch64Integer(memory, second, instruction.width)
	];
	registers.write(instruction.firstRegister, values[0], instruction.width, "zero");
	registers.write(instruction.secondRegister, values[1], instruction.width, "zero");
	return values;
}

function transferVector(instruction, registers, memory, first, second) {
	if (isStoreInstruction(instruction)) {
		const values = readVectorPair(registers, instruction);
		writeAarch64VectorBits(memory, first, values[0], instruction.width);
		writeAarch64VectorBits(memory, second, values[1], instruction.width);
		return values;
	}
	const values = [
		readAarch64VectorBits(memory, first, instruction.width),
		readAarch64VectorBits(memory, second, instruction.width)
	];
	registers.writeVector(instruction.firstRegister, values[0], instruction.width);
	registers.writeVector(instruction.secondRegister, values[1], instruction.width);
	return values;
}

function readGeneralPair(registers, instruction) {
	return [
		registers.read(instruction.firstRegister, instruction.width, "zero"),
		registers.read(instruction.secondRegister, instruction.width, "zero")
	];
}

function readVectorPair(registers, instruction) {
	return [
		registers.readVector(instruction.firstRegister, instruction.width),
		registers.readVector(instruction.secondRegister, instruction.width)
	];
}

function isStoreInstruction(instruction) {
	return typeof instruction.store === "boolean"
		? instruction.store
		: instruction.mnemonic === "stp";
}

function writeBase(registers, baseRegister, value) {
	registers.write(baseRegister, value, 64, "sp");
}
