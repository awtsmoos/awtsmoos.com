//B"H
//Boruch Hashem
//Blessed is He

import { readByteTarget, writeByteTarget } from "./x64ByteTarget.js";
import { setLogicFlags, setSubtractFlags } from "./x64Flags.js";
import { bitwiseWidth } from "./x64Width.js";

const GROUP_KINDS = new Set([
	"div_byte_group",
	"idiv_byte_group",
	"imul_byte_group",
	"mul_byte_group",
	"neg_byte_group",
	"not_byte_group",
	"test_byte_group"
]);

/**
 * Executes exact F6 byte unary, multiply, and divide operations through AX.
 * The Awtsmoos renews AL, AH, target byte, quotient, remainder, and flags together;
 * Awtsmoos.com preserves every untouched accumulator bit and mapped guest byte.
 */
export function executeByteGroup(item, registers, memory) {
	if (!GROUP_KINDS.has(item.kind)) {
		return false;
	}
	const operand = readByteTarget(item.target, item, registers, memory);
	if (item.kind === "test_byte_group") {
		setLogicFlags(
			registers,
			bitwiseWidth("and", operand, item.value, 8),
			8
		);
		return true;
	}
	if (item.kind === "not_byte_group") {
		writeByteTarget(item.target, item, registers, memory, (~operand) & 0xff);
		return true;
	}
	if (item.kind === "neg_byte_group") {
		writeByteTarget(item.target, item, registers, memory, (-operand) & 0xff);
		setSubtractFlags(registers, 0, operand, 8);
		return true;
	}
	if (["mul_byte_group", "imul_byte_group"].includes(item.kind)) {
		executeMultiply(item.kind, operand, registers);
		return true;
	}
	executeDivide(item.kind, operand, registers);
	return true;
}

function executeMultiply(kind, operand, registers) {
	const al = readAx(registers) & 0xff;
	const product = kind === "mul_byte_group"
		? al * operand
		: signedByte(al) * signedByte(operand);
	writeAx(registers, product);
	const overflow = kind === "mul_byte_group"
		? product > 0xff
		: product < -128 || product > 127;
	registers.flags.carry = overflow;
	registers.flags.overflow = overflow;
}

function executeDivide(kind, operand, registers) {
	const signed = kind === "idiv_byte_group";
	const divisor = signed ? signedByte(operand) : operand;
	if (divisor === 0) {
		throw divideError("ZERO");
	}
	const dividendBits = readAx(registers);
	const dividend = signed ? signedWord(dividendBits) : dividendBits;
	const quotient = Math.trunc(dividend / divisor);
	const minimum = signed ? -128 : 0;
	const maximum = signed ? 127 : 255;
	if (quotient < minimum || quotient > maximum) {
		throw divideError("QUOTIENT");
	}
	const remainder = dividend - quotient * divisor;
	writeAx(
		registers,
		((remainder & 0xff) << 8) | (quotient & 0xff)
	);
}

function readAx(registers) {
	return Number(registers.getUnsignedBigInt("rax") & 0xffffn);
}

function writeAx(registers, value) {
	const original = registers.getUnsignedBigInt("rax");
	const replacement = (original & ~0xffffn)
		| BigInt(value & 0xffff);
	registers.setBigInt("rax", BigInt.asIntN(64, replacement));
}

function signedByte(value) {
	return value & 0x80 ? value - 0x100 : value;
}

function signedWord(value) {
	return value & 0x8000 ? value - 0x10000 : value;
}

function divideError(detail) {
	const error = new Error(`PORTABLE_X64_DIVIDE_ERROR:${detail}`);
	error.code = "PORTABLE_X64_DIVIDE_ERROR";
	return error;
}
