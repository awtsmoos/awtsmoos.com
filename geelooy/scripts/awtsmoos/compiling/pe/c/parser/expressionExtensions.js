//B"H
//Boruch Hashem
//Blessed is He

import { TOKENS } from "../lexer.js";
import { parseType } from "./types.js";

const CASTABLE_TYPE_KEYWORDS = new Set(["int", "char", "void", "struct", "union", "enum"]);

/**
 * Parses the conditional-choice level the Awtsmoos added between assignment and
 * logical-or: `cond ? then : else`. The neighboring levels arrive as guests,
 * the way parsePostfix receives parseExpression, so the ladder never cycles.
 */
export function parseConditionalExpression(stream, parseLogicalOr, parseAssignment) {
	const cond = parseLogicalOr(stream);
	const token = stream.peek();
	if (token.type !== TOKENS.OP || token.value !== "?") return cond;
	stream.consume();
	const thenBranch = parseAssignment(stream);
	stream.expect(TOKENS.PUNCT, ":");
	const elseBranch = parseConditionalExpression(stream, parseLogicalOr, parseAssignment);
	return { type: "ternary", cond, then: thenBranch, else: elseBranch };
}

/**
 * Parses the unary-level extensions: explicit casts and compile-time sizeof.
 * Returns the node, or null when the stream holds no extension. parseUnary
 * arrives as a guest for the cast operand and the sizeof expression operand.
 */
export function parseUnaryExtension(stream, parseUnary) {
	const token = stream.peek();
	if (token.type === TOKENS.KEYWORD && token.value === "sizeof") {
		return parseSizeof(stream, parseUnary);
	}
	if (isPunctuation(token, "(") && isCastAhead(stream)) {
		return parseCast(stream, parseUnary);
	}
	return null;
}

/**
 * Distinguishes a cast `( type ) expr` from a parenthesized expression by
 * looking ahead for a type keyword, optional pointer stars, and `)`. Bare
 * identifiers are never treated as type names: without typedefs only the
 * keywords name types, so `(x) + 1` stays a grouped expression.
 */
function isCastAhead(stream) {
	let offset = 1;
	const first = stream.peek(offset);
	if (first.type !== TOKENS.KEYWORD || !CASTABLE_TYPE_KEYWORDS.has(first.value)) {
		return false;
	}
	offset += 1;
	if (first.value === "struct" || first.value === "union") {
		if (stream.peek(offset).type !== TOKENS.ID) return false;
		offset += 1;
	}
	if (first.value === "enum") {
		if (stream.peek(offset).type === TOKENS.ID) offset += 1;
	}
	while (stream.peek(offset).type === TOKENS.OP && stream.peek(offset).value === "*") {
		offset += 1;
	}
	const close = stream.peek(offset);
	return close.type === TOKENS.PUNCT && close.value === ")";
}

function parseCast(stream, parseUnary) {
	stream.expect(TOKENS.PUNCT, "(");
	const targetType = parseType(stream);
	stream.expect(TOKENS.PUNCT, ")");
	const expr = parseUnary(stream);
	return { type: "cast", targetType, expr };
}

/**
 * Parses `sizeof(type)`, `sizeof (expr)`, and `sizeof expr`. A parenthesized
 * type keyword selects the type form; anything else parses as an expression
 * whose lowered type is measured.
 */
function parseSizeof(stream, parseUnary) {
	stream.consume();
	if (isPunctuation(stream.peek(), "(")) {
		const afterOpen = stream.peek(1);
		if (afterOpen.type === TOKENS.KEYWORD && CASTABLE_TYPE_KEYWORDS.has(afterOpen.value)) {
			stream.consume();
			const targetType = parseType(stream);
			stream.expect(TOKENS.PUNCT, ")");
			return { type: "sizeof", targetType, expr: null };
		}
	}
	const expr = parseUnary(stream);
	return { type: "sizeof", targetType: null, expr };
}

function isPunctuation(token, value) {
	return token.type === TOKENS.PUNCT && token.value === value;
}
