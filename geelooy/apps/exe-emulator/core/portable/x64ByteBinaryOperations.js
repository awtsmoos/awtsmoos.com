//B"H
//Boruch Hashem
//Blessed is He

import {
	readByteRegister,
	writeByteRegister
} from "./x64ByteRegisters.js";
import {
	readByteTarget,
	writeByteTarget
} from "./x64ByteTarget.js";
import { carryArithmeticResult } from "./x64CarryResult.js";
import {
	setAddFlags,
	setLogicFlags,
	setSubtractFlags
} from "./x64Flags.js";
import { bitwiseWidth, wrapArithmetic } from "./x64Width.js";

/**
 * Executes exact two-operand byte arithmetic in either ModRM direction.
 * The Awtsmoos renews carry, borrow, operands, destination, flags, and silence;
 * Awtsmoos.com keeps CMP read-only while every mutation preserves surrounding bits.
 */
export function executeByteBinary(item, registers, memory) {
	if (item.kind !== "byte_binary") {
		return false;
	}
	const targetValue = readByteTarget(
		item.target,
		item,
		registers,
		memory
	);
	const registerValue = readByteRegister(registers, item.register);
	const left = item.destination === "target"
		? targetValue
		: registerValue;
	const right = item.destination === "target"
		? registerValue
		: targetValue;
	const result = executeOperation(
		item.operation,
		left,
		right,
		registers
	);
	if (item.operation === "cmp") {
		return true;
	}
	if (item.destination === "target") {
		writeByteTarget(
			item.target,
			item,
			registers,
			memory,
			result
		);
	} else {
		writeByteRegister(registers, item.register, result);
	}
	return true;
}

function executeOperation(operation, left, right, registers) {
	if (["adc", "sbb"].includes(operation)) {
		return Number(carryArithmeticResult(
			operation,
			left,
			right,
			Boolean(registers.flags.carry),
			8,
			registers
		));
	}
	if (operation === "add") {
		setAddFlags(registers, left, right, 8);
		return wrapArithmetic(left + right, 8);
	}
	if (operation === "sub" || operation === "cmp") {
		setSubtractFlags(registers, left, right, 8);
		return wrapArithmetic(left - right, 8);
	}
	const result = bitwiseWidth(operation, left, right, 8);
	setLogicFlags(registers, result, 8);
	return result;
}
