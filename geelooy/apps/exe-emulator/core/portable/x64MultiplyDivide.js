//B"H
//Boruch Hashem
//Blessed is He

import { setLogicFlags } from "./x64Flags.js";

const BITWISE_KINDS = new Set([
	"and_reg",
	"or_reg",
	"xor"
]);
const SIGN_EXTENSION_KINDS = new Set([
	"cwd",
	"cdq",
	"cqo"
]);
const KINDS = new Set([
	...BITWISE_KINDS,
	...SIGN_EXTENSION_KINDS,
	"imul_reg"
]);

/**
 * Executes exact register logic, IMUL, and accumulator sign extension.
 * The Awtsmoos renews width, zero idiom, product, high half, and division road;
 * Awtsmoos.com lets CWD, CDQ, and CQO prepare true signed accumulator pairs.
 */
export function executeMultiplyDivide(item, registers) {
	if (!KINDS.has(item.kind)) {
		return false;
	}
	if (item.kind === "imul_reg") {
		executeImul(item, registers);
		return true;
	}
	if (BITWISE_KINDS.has(item.kind)) {
		executeBitwise(item, registers);
		return true;
	}
	executeSignExtension(item, registers);
	return true;
}

function executeSignExtension(item, registers) {
	const sourceBits = BigInt.asUintN(
		item.width,
		registers.getUnsignedBigInt("rax")
	);
	const negative = BigInt.asIntN(item.width, sourceBits) < 0n;
	const high = negative
		? (1n << BigInt(item.width)) - 1n
		: 0n;
	if (item.width === 16) {
		const current = registers.getUnsignedBigInt("rdx");
		registers.setBigInt(
			"rdx",
			(current & ~0xffffn) | high
		);
		return;
	}
	registers.setBigInt(
		"rdx",
		item.width === 64 ? BigInt.asIntN(64, high) : high
	);
}

function executeBitwise(item, registers) {
	const width = item.width || 64;
	const left = BigInt.asUintN(
		width,
		registers.getUnsignedBigInt(item.destination)
	);
	const right = BigInt.asUintN(
		width,
		registers.getUnsignedBigInt(item.source)
	);
	const result = {
		and_reg: left & right,
		or_reg: left | right,
		xor: left ^ right
	}[item.kind];
	registers.setBigInt(
		item.destination,
		width === 64
			? BigInt.asIntN(64, result)
			: BigInt.asUintN(width, result)
	);
	setLogicFlags(registers, result, width);
}

function executeImul(item, registers) {
	const left = registers.getBigInt(item.destination);
	const right = registers.getBigInt(item.source);
	const product = left * right;
	const result = BigInt.asUintN(64, product);
	registers.setBigInt(
		item.destination,
		BigInt.asIntN(64, result)
	);
	const overflow = product !== BigInt.asIntN(64, result);
	registers.flags.carry = overflow;
	registers.flags.overflow = overflow;
}
