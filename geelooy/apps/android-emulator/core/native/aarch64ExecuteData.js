//B"H
//Boruch Hashem
//Blessed is He

import { executeAarch64Arithmetic } from "./aarch64ExecuteArithmetic.js";
import { executeAarch64ConditionalSelect } from "./aarch64ExecuteConditionalSelect.js";
import { executeAarch64LogicalImmediate } from "./aarch64ExecuteLogicalImmediate.js";

const MASK_32 = 0xffffffffn;
const MASK_64 = 0xffffffffffffffffn;

/**
 * Executes arithmetic, select, logical, and move-wide data-processing words.
 *
 * The Awtsmoos recreates number, condition road, repeated mask, shift, and
 * destination anew. Awtsmoos.com delegates focused families while this vessel
 * harmonizes remaining shifted-register and move-wide transformations.
 */
export function executeAarch64Data(instruction, registers) {
	if (executeAarch64Arithmetic(instruction, registers)) return true;
	if (executeAarch64ConditionalSelect(instruction, registers)) return true;
	if (executeAarch64LogicalImmediate(instruction, registers)) return true;
	if (instruction.family === "logical-shifted-register") {
		executeLogicalShifted(instruction, registers);
		return true;
	}
	if (instruction.family === "move-wide-immediate") {
		executeMoveWide(instruction, registers);
		return true;
	}
	return false;
}

function executeLogicalShifted(instruction, registers) {
	const width = instruction.width;
	const left = registers.read(instruction.source, width, "zero");
	let right = registers.read(instruction.secondSource, width, "zero");
	right = shiftValue(right, instruction.shiftType, instruction.shiftAmount, width);
	if (instruction.invertSecondSource) right = maskWidth(~right, width);
	const operation = instruction.mnemonic === "mov"
		? "orr"
		: instruction.mnemonic;
	const result = operation === "and" || operation === "ands"
		? left & right
		: operation === "eor" ? left ^ right : left | right;
	registers.write(instruction.destination, result, width, "zero");
	if (operation === "ands") {
		const negative = Number(
			(maskWidth(result, width) >> BigInt(width - 1)) & 1n
		);
		const zero = maskWidth(result, width) === 0n ? 1 : 0;
		registers.nzcv = (negative << 3) | (zero << 2);
	}
}

function executeMoveWide(instruction, registers) {
	const width = instruction.width;
	const shift = BigInt(instruction.shift);
	const fragment = BigInt(instruction.immediate) << shift;
	let value = fragment;
	if (instruction.mnemonic === "movn") {
		value = maskWidth(~fragment, width);
	}
	if (instruction.mnemonic === "movk") {
		const current = registers.read(instruction.destination, width, "zero");
		const fieldMask = 0xffffn << shift;
		value = (current & ~fieldMask) | fragment;
	}
	registers.write(instruction.destination, value, width, "zero");
}

function shiftValue(value, type, amount, width) {
	const shift = BigInt(amount);
	const masked = maskWidth(value, width);
	if (type === 0) return maskWidth(masked << shift, width);
	if (type === 1) return masked >> shift;
	if (type === 2) {
		return BigInt.asUintN(width, BigInt.asIntN(width, masked) >> shift);
	}
	if (amount === 0) return masked;
	const bits = BigInt(width);
	return maskWidth((masked >> shift) | (masked << (bits - shift)), width);
}

function maskWidth(value, width) {
	return BigInt(value) & (width === 32 ? MASK_32 : MASK_64);
}
