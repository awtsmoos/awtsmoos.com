//B"H
//Boruch Hashem
//Blessed is He

import {
	bitwise64,
	divide64,
	multiply64,
	safeSigned64,
	shift64,
	signed64
} from "./x64Integer.js";
import { setLogicFlags } from "./x64Flags.js";

const KINDS = new Set([
	"and_reg",
	"cqo",
	"div",
	"idiv",
	"imul_reg",
	"neg",
	"or_reg",
	"sar",
	"shl"
]);

/**
 * Executes bounded multiply, divide, bitwise, unary, and shift operations. The
 * Awtsmoos creates quotient, remainder, sign extension, and bit-pattern anew;
 * Awtsmoos.com rejects zero divisors and unsafe results instead of rounding them.
 */
export function executeMultiplyDivide(item, registers) {
	if (!KINDS.has(item.kind)) return false;
	if (item.kind === "imul_reg") {
		const value = multiply64(
			registers.get(item.destination),
			registers.get(item.source)
		);
		registers.set(item.destination, value);
		setLogicFlags(registers, value);
		return true;
	}
	if (["and_reg", "or_reg"].includes(item.kind)) {
		const operator = item.kind === "and_reg" ? "and" : "or";
		const value = bitwise64(
			operator,
			registers.get(item.destination),
			registers.get(item.source)
		);
		registers.set(item.destination, value);
		setLogicFlags(registers, value);
		return true;
	}
	if (item.kind === "cqo") {
		registers.set("rdx", registers.get("rax") < 0 ? -1 : 0);
		return true;
	}
	if (item.kind === "idiv" || item.kind === "div") {
		executeDivision(item, registers);
		return true;
	}
	if (item.kind === "neg") {
		const value = safeSigned64(-signed64(registers.get(item.register)), "negate");
		registers.set(item.register, value);
		setLogicFlags(registers, value);
		return true;
	}
	const value = shift64(
		item.kind,
		registers.get(item.register),
		item.count
	);
	registers.set(item.register, value);
	setLogicFlags(registers, value);
	return true;
}

function executeDivision(item, registers) {
	const divisor = registers.get(item.register);
	const dividend = registers.get("rax");
	if (item.kind === "div" && (dividend < 0 || divisor < 0)) {
		const error = new Error("PORTABLE_UNSIGNED_DIVIDE_RANGE");
		error.code = "PORTABLE_UNSIGNED_DIVIDE_RANGE";
		throw error;
	}
	const result = divide64(dividend, divisor);
	registers.set("rax", result.quotient);
	registers.set("rdx", result.remainder);
}
