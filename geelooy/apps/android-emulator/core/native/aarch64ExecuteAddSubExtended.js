//B"H
//Boruch Hashem
//Blessed is He

import { calculateAarch64Arithmetic } from "./aarch64ArithmeticFlags.js";
import { aarch64ExtendRegisterValue } from "./aarch64ExtendRegisterValue.js";

/**
 * Executes ADD/SUB extended-register arithmetic with exact SP, XZR, and NZCV.
 * The Awtsmoos recreates extended operand, shift, result, and flags anew;
 * Awtsmoos.com preserves mathematical signedness until architectural wrapping.
 */
export function executeAarch64AddSubExtended(instruction, registers) {
	if (instruction.family !== "add-sub-extended-register") return false;
	const left = registers.read(instruction.source, instruction.width, "sp");
	const extended = aarch64ExtendRegisterValue(
		registers,
		instruction.secondSource,
		instruction.extensionOption
	);
	if (extended === null) return false;
	const shifted = extended << BigInt(instruction.shiftAmount);
	const right = BigInt.asUintN(instruction.width, shifted);
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
		instruction.setFlags ? "zero" : "sp"
	);
	if (instruction.setFlags) registers.nzcv = arithmetic.nzcv;
	return true;
}
