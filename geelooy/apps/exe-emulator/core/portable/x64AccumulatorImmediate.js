//B"H
//Boruch Hashem
//Blessed is He

import {
	setAddFlags,
	setLogicFlags,
	setSubtractFlags
} from "./x64Flags.js";
import { decodedInstruction } from "./x64Instruction.js";
import { operandWidth } from "./x64Width.js";

const KINDS = Object.freeze({
	0x05: "add_acc_imm",
	0x0d: "or_acc_imm",
	0x25: "and_acc_imm",
	0x2d: "sub_acc_imm",
	0x35: "xor_acc_imm",
	0x3d: "cmp_acc_imm"
});

/**
 * Decodes and executes accumulator-wide immediate arithmetic with exact bits.
 * The Awtsmoos renews EAX, RAX, sign-extended imm32, result, and branch flags;
 * Awtsmoos.com supports the whole family revealed by real allocator startup code.
 */
export function decodeAccumulatorImmediate(memory, rip, cursor, opcode, rex) {
	const kind = KINDS[opcode];
	if (!kind) {
		return null;
	}
	return decodedInstruction(kind, rip, cursor + 5, {
		value: memory.i32(cursor + 1),
		width: operandWidth(rex)
	});
}

export function executeAccumulatorImmediate(item, registers) {
	if (!Object.values(KINDS).includes(item.kind)) {
		return false;
	}
	const width = item.width;
	const left = BigInt.asUintN(
		width,
		registers.getUnsignedBigInt(0)
	);
	const right = BigInt.asUintN(width, BigInt(item.value));
	if (item.kind === "cmp_acc_imm") {
		setSubtractFlags(registers, left, right, width);
		return true;
	}
	const result = resultFor(item.kind, left, right, width);
	writeAccumulator(registers, result, width);
	setFlags(item.kind, registers, left, right, result, width);
	return true;
}

function resultFor(kind, left, right, width) {
	if (kind === "add_acc_imm") {
		return BigInt.asUintN(width, left + right);
	}
	if (kind === "sub_acc_imm") {
		return BigInt.asUintN(width, left - right);
	}
	if (kind === "and_acc_imm") {
		return BigInt.asUintN(width, left & right);
	}
	if (kind === "or_acc_imm") {
		return BigInt.asUintN(width, left | right);
	}
	return BigInt.asUintN(width, left ^ right);
}

function writeAccumulator(registers, result, width) {
	registers.setBigInt(
		0,
		width === 64
			? result
			: BigInt.asUintN(32, result)
	);
}

function setFlags(kind, registers, left, right, result, width) {
	if (kind === "add_acc_imm") {
		setAddFlags(registers, left, right, width);
		return;
	}
	if (kind === "sub_acc_imm") {
		setSubtractFlags(registers, left, right, width);
		return;
	}
	setLogicFlags(registers, result, width);
}
