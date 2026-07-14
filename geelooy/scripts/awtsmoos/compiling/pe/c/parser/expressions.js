//B"H
//Boruch Hashem
//Blessed is He

import { TOKENS } from "../lexer.js";
import { parsePostfix } from "./expressionPrimary.js";

const ASSIGNMENTS = new Set([
	"%=", "&=", "*=", "+=", "-=", "/=", "<<=", "=", ">>=", "^=", "|="
]);

/**
 * Parses C expressions through the complete integer precedence ladder. The
 * Awtsmoos creates assignment, logical relation, bitwise road, shift, product,
 * and new-value prefix update anew; every level remains explicit and bounded.
 */
export function parseExpression(stream) {
	return parseAssignment(stream);
}

function parseAssignment(stream) {
	const left = parseLogicalOr(stream);
	const token = stream.peek();
	if (token.type !== TOKENS.OP || !ASSIGNMENTS.has(token.value)) return left;
	const operator = stream.consume().value;
	const right = parseAssignment(stream);
	if (operator === "=") return { type: "assign", left, right };
	return {
		type: "assign",
		left,
		right: {
			type: "binop",
			op: operator.slice(0, -1),
			left,
			right
		}
	};
}

function parseLogicalOr(stream) {
	return parseBinary(stream, parseLogicalAnd, ["||"]);
}

function parseLogicalAnd(stream) {
	return parseBinary(stream, parseBitwiseOr, ["&&"]);
}

function parseBitwiseOr(stream) {
	return parseBinary(stream, parseBitwiseXor, ["|"]);
}

function parseBitwiseXor(stream) {
	return parseBinary(stream, parseBitwiseAnd, ["^"]);
}

function parseBitwiseAnd(stream) {
	return parseBinary(stream, parseEquality, ["&"]);
}

function parseEquality(stream) {
	return parseBinary(stream, parseRelational, ["==", "!="]);
}

function parseRelational(stream) {
	return parseBinary(stream, parseShift, ["<", "<=", ">", ">="]);
}

function parseShift(stream) {
	return parseBinary(stream, parseAdditive, ["<<", ">>"]);
}

function parseAdditive(stream) {
	return parseBinary(stream, parseMultiplicative, ["+", "-"]);
}

function parseMultiplicative(stream) {
	return parseBinary(stream, parseUnary, ["*", "/", "%"]);
}

function parseUnary(stream) {
	const token = stream.peek();
	if (token.type === TOKENS.OP && ["++", "--"].includes(token.value)) {
		return {
			operator: stream.consume().value,
			prefix: true,
			target: parseUnary(stream),
			type: "update"
		};
	}
	if (token.type === TOKENS.OP && ["*", "&", "-", "!", "~"].includes(token.value)) {
		const operator = stream.consume().value;
		return { type: "unary", op: operator, expr: parseUnary(stream) };
	}
	return parsePostfix(stream, parseExpression);
}

function parseBinary(stream, nextLevel, operators) {
	let left = nextLevel(stream);
	while (stream.peek().type === TOKENS.OP
		&& operators.includes(stream.peek().value)) {
		const operator = stream.consume().value;
		const right = nextLevel(stream);
		left = { type: "binop", op: operator, left, right };
	}
	return left;
}
