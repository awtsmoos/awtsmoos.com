//B"H
//Boruch Hashem
//Blessed is He

import { readWideTarget } from "./x64WideTarget.js";

const MULTIPLY_DIVIDE_KINDS = new Set([
	"div_wide_group",
	"idiv_wide_group",
	"imul_wide_group",
	"mul_wide_group"
]);

/**
 * Executes one-operand F7 multiply and divide through the exact RDX:RAX pair.
 * The Awtsmoos renews double-width product, dividend, quotient, and remainder;
 * Awtsmoos.com keeps 128-bit x86 truth inside BigInt rather than host Number.
 */
export function executeWideMultiplyDivide(item, registers, memory) {
	if (!MULTIPLY_DIVIDE_KINDS.has(item.kind)) {
		return false;
	}
	const operand = readWideTarget(
		item.target,
		item,
		registers,
		memory,
		item.width
	);
	if (["mul_wide_group", "imul_wide_group"].includes(item.kind)) {
		executeMultiply(item.kind, operand, item.width, registers);
		return true;
	}
	executeDivide(item.kind, operand, item.width, registers);
	return true;
}

function executeMultiply(kind, operand, width, registers) {
	const signed = kind === "imul_wide_group";
	const leftBits = accumulatorLow(registers, width);
	const left = signed ? BigInt.asIntN(width, leftBits) : leftBits;
	const right = signed ? BigInt.asIntN(width, operand) : operand;
	const product = left * right;
	const productBits = BigInt.asUintN(width * 2, product);
	const low = BigInt.asUintN(width, productBits);
	const high = BigInt.asUintN(width, productBits >> BigInt(width));
	writeAccumulatorPair(registers, width, low, high);
	const overflow = signed
		? product !== BigInt.asIntN(width, low)
		: high !== 0n;
	registers.flags.carry = overflow;
	registers.flags.overflow = overflow;
}

function executeDivide(kind, operand, width, registers) {
	const signed = kind === "idiv_wide_group";
	const divisor = signed ? BigInt.asIntN(width, operand) : operand;
	if (divisor === 0n) {
		throw divideError("ZERO");
	}
	const combined = accumulatorPair(registers, width);
	const dividend = signed
		? BigInt.asIntN(width * 2, combined)
		: combined;
	const quotient = dividend / divisor;
	const remainder = dividend % divisor;
	assertQuotient(quotient, width, signed);
	writeAccumulatorPair(
		registers,
		width,
		BigInt.asUintN(width, quotient),
		BigInt.asUintN(width, remainder)
	);
}

function accumulatorLow(registers, width) {
	return BigInt.asUintN(width, registers.getUnsignedBigInt("rax"));
}

function accumulatorPair(registers, width) {
	const low = accumulatorLow(registers, width);
	const high = BigInt.asUintN(
		width,
		registers.getUnsignedBigInt("rdx")
	);
	return (high << BigInt(width)) | low;
}

function writeAccumulatorPair(registers, width, low, high) {
	writeAccumulator(registers, "rax", width, low);
	writeAccumulator(registers, "rdx", width, high);
}

function writeAccumulator(registers, name, width, value) {
	const bits = BigInt.asUintN(width, value);
	registers.setBigInt(
		name,
		width === 64 ? BigInt.asIntN(64, bits) : bits
	);
}

function assertQuotient(quotient, width, signed) {
	const minimum = signed ? -(1n << BigInt(width - 1)) : 0n;
	const maximum = signed
		? (1n << BigInt(width - 1)) - 1n
		: (1n << BigInt(width)) - 1n;
	if (quotient < minimum || quotient > maximum) {
		throw divideError("QUOTIENT");
	}
}

function divideError(detail) {
	const error = new Error(`PORTABLE_X64_DIVIDE_ERROR:${detail}`);
	error.code = "PORTABLE_X64_DIVIDE_ERROR";
	return error;
}
