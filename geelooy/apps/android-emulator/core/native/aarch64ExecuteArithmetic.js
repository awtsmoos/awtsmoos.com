//B"H
//Boruch Hashem
//Blessed is He

import { calculateAarch64Arithmetic } from "./aarch64ArithmeticFlags.js";

/**
 * Executes AArch64 ADD/SUB immediate and shifted-register instructions.
 *
 * The Awtsmoos recreates operand, shift, result, and NZCV testimony anew.
 * Awtsmoos.com keeps SP and zero-register roles explicit so arithmetic aliases
 * remain faithful to their architectural vessels.
 *
 * @param {object} instruction Decoded arithmetic instruction.
 * @param {object} registers Mutable guest register vessel.
 * @returns {boolean} Whether the instruction was handled.
 */
export function executeAarch64Arithmetic(instruction, registers) {
	if (instruction.family === "add-sub-immediate") {
		executeImmediate(instruction, registers);
		return true;
	}
	if (instruction.family === "add-sub-shifted-register") {
		executeShiftedRegister(instruction, registers);
		return true;
	}
	return false;
}

function executeImmediate(instruction, registers) {
	const left = registers.read(instruction.source, instruction.width, "sp");
	const right = BigInt(instruction.immediate);
	writeArithmeticResult(instruction, registers, left, right, "sp");
}

function executeShiftedRegister(instruction, registers) {
	const left = registers.read(instruction.source, instruction.width, "zero");
	const source = registers.read(
		instruction.secondSource,
		instruction.width,
		"zero"
	);
	const right = shiftOperand(
		source,
		instruction.shiftType,
		instruction.shiftAmount,
		instruction.width
	);
	writeArithmeticResult(instruction, registers, left, right, "zero");
}

function writeArithmeticResult(
	instruction,
	registers,
	left,
	right,
	destinationRegister31
) {
	const arithmetic = calculateAarch64Arithmetic(
		left,
		right,
		instruction.subtract,
		instruction.width
	);
	registers.write(
		instruction.destination,
		arithmetic.result,
		instruction.width,
		instruction.setFlags ? "zero" : destinationRegister31
	);
	if (instruction.setFlags) registers.nzcv = arithmetic.nzcv;
}

function shiftOperand(value, type, amount, width) {
	const shift = BigInt(amount);
	const masked = BigInt.asUintN(width, BigInt(value));
	if (type === 0) return BigInt.asUintN(width, masked << shift);
	if (type === 1) return masked >> shift;
	return BigInt.asUintN(width, BigInt.asIntN(width, masked) >> shift);
}
