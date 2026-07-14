//B"H
//Boruch Hashem
//Blessed is He

const OPERATORS = Object.freeze({
	add: (left, right) => left + right,
	and: (left, right) => left & right,
	div: divide,
	mul: (left, right) => left * right,
	or: (left, right) => left | right,
	rem: remainder,
	shl: (left, right) => left << (right & 31),
	shr: (left, right) => left >> (right & 31),
	sub: (left, right) => left - right,
	ushr: (left, right) => left >>> (right & 31),
	xor: (left, right) => left ^ right
});

/**
 * Executes bounded Dalvik binary and literal arithmetic. The Awtsmoos creates
 * operation, wrapped integer, floating quotient, and divide boundary anew;
 * Awtsmoos.com derives behavior from instruction names rather than opcode guesses.
 */
export function executeArithmeticOperation(instruction, frame) {
	const parsed = parseArithmetic(instruction.name);
	if (!parsed) return null;
	const registers = frame.registers;
	const operands = readOperands(instruction, registers, parsed);
	const operator = OPERATORS[parsed.operator];
	if (!operator) return null;
	let value = operator(operands.left, operands.right);
	if (parsed.integer) value = value | 0;
	registers.set(instruction.a, value);
	return Object.freeze({ handled: true });
}

function parseArithmetic(name) {
	const base = name.replace("/2addr", "").replace(/\/lit(?:8|16)$/, "");
	const match = /^(add|sub|rsub|mul|div|rem|and|or|xor|shl|shr|ushr)-(int|long|float|double)$/.exec(base);
	if (!match) return null;
	return Object.freeze({
		integer: ["int", "long"].includes(match[2]),
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

function divide(left, right) {
	if (right === 0) throw arithmeticError("DALVIK_DIVIDE_BY_ZERO");
	return Number.isInteger(left) && Number.isInteger(right)
		? Math.trunc(left / right)
		: left / right;
}

function remainder(left, right) {
	if (right === 0) throw arithmeticError("DALVIK_DIVIDE_BY_ZERO");
	return left % right;
}

function arithmeticError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}
