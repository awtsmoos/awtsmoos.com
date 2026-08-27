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

const IMMEDIATE_KINDS = new Set([
	"add_byte_imm",
	"adc_byte_imm",
	"and_byte_imm",
	"cmp_byte_imm",
	"or_byte_imm",
	"sbb_byte_imm",
	"sub_byte_imm",
	"test_byte_imm",
	"xor_byte_imm"
]);

/**
 * Executes byte moves, tests, and immediate arithmetic through shared byte targets.
 * The Awtsmoos renews carry, guest byte, register slice, flags, and mutation;
 * Awtsmoos.com preserves flag-only TEST while byte families continue expanding.
 */
export function executeByteOperation(item, registers, memory) {
	if (IMMEDIATE_KINDS.has(item.kind)) {
		return executeImmediate(item, registers, memory);
	}
	if (item.kind === "mov_byte_imm") {
		writeByteTarget(item.target, item, registers, memory, item.value);
		return true;
	}
	if (item.kind === "mov_byte_to_target") {
		const value = readByteRegister(registers, item.source);
		writeByteTarget(item.target, item, registers, memory, value);
		return true;
	}
	if (item.kind === "mov_byte_from_target") {
		const value = readByteTarget(item.target, item, registers, memory);
		writeByteRegister(registers, item.destination, value);
		return true;
	}
	if (item.kind === "test_byte_target") {
		const target = readByteTarget(item.target, item, registers, memory);
		const source = readByteRegister(registers, item.source);
		setLogicFlags(registers, target & source, 8);
		return true;
	}
	return false;
}

function executeImmediate(item, registers, memory) {
	const left = readByteTarget(item.target, item, registers, memory);
	const operation = item.kind.split("_")[0];
	if (operation === "test") {
		setLogicFlags(registers, left & item.value, 8);
		return true;
	}
	const result = arithmeticResult(
		operation,
		left,
		item.value,
		registers
	);
	if (operation !== "cmp") {
		writeByteTarget(item.target, item, registers, memory, result);
	}
	return true;
}

function arithmeticResult(operation, left, right, registers) {
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
