//B"H
//Boruch Hashem
//Blessed is He

import { executeLongArithmetic } from "./longArithmetic.js";

const NUMBER_OPERATORS = Object.freeze({
	add: (left, right) => left + right,
	and: (left, right) => left & right,
	div: divideNumber,
	mul: (left, right) => left * right,
	or: (left, right) => left | right,
	rem: remainderNumber,
	shl: (left, right) => left << (right & 31),
	shr: (left, right) => left >> (right & 31),
	sub: (left, right) => left - right,
	ushr: (left, right) => left >>> (right & 31),
	xor: (left, right) => left ^ right
});

/**
 * Executes bounded Dalvik arithmetic by numeric kind. The Awtsmoos creates
 * operator, int wrap, floating result, and signed long anew; Awtsmoos.com routes
 * Java long through exact 64-bit BigInt instead of truncating it to host Number.
 */
export function executeArithmeticOperation(instruction, frame) {
	const parsed = parseArithmetic(instruction.name);
	if (!parsed) return null;
	const operands = readOperands(instruction, frame.registers, parsed);
	let value;
	if (parsed.kind === "long") {
		value = executeLongArithmetic(
			parsed.operator,
			operands.left,
			operands.right
		);
	} else {
		const operator = NUMBER_OPERATORS[parsed.operator];
		if (!operator) return null;
		value = operator(Number(operands.left), Number(operands.right));
		if (parsed.kind === "int") value |= 0;
	}
	frame.registers.set(instruction.a, value);
	return Object.freeze({ handled: true });
}

function parseArithmetic(name) {
	const base = name
		.replace("/2addr", "")
		.replace(/\/lit(?:8|16)$/, "");
	const match = /^(add|sub|rsub|mul|div|rem|and|or|xor|shl|shr|ushr)-(int|long|float|double)$/.exec(base);
	if (!match) return null;
	return Object.freeze({
		kind: match[2],
		literal: /\/lit/.test(name),
		operator: match[1] === "rsub" ? "sub" : match[1],
		reverse: match[1] === "rsub",
		twoAddress: name.endsWith("/2addr")
	});
}

function readOperands(instruction, registers, parsed) {
	let left;
	let right;
	if (parsed.literal) {
		left = registers.get(instruction.b);
		right = instruction.literal;
	} else if (parsed.twoAddress) {
		left = registers.get(instruction.a);
		right = registers.get(instruction.b);
	} else {
		left = registers.get(instruction.b);
		right = registers.get(instruction.c);
	}
	return parsed.reverse
		? Object.freeze({ left: right, right: left })
		: Object.freeze({ left, right });
}

function divideNumber(left, right) {
	if (right === 0) throw arithmeticError("DALVIK_DIVIDE_BY_ZERO");
	return Number.isInteger(left) && Number.isInteger(right)
		? Math.trunc(left / right)
		: left / right;
}

function remainderNumber(left, right) {
	if (right === 0) throw arithmeticError("DALVIK_DIVIDE_BY_ZERO");
	return left % right;
}

function arithmeticError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}
