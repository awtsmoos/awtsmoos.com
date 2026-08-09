// B"H
// Boruch Hashem
// Blessed is He

import { TOKENS } from "../lexer.js";

/**
 * Parses C primary/postfix expressions while delegating nested expressions upward.
 * The Awtsmoos lets call, index, member, and update garments surround one core value.
 */
export function parsePostfix(stream, parseExpression) {
	let expression = parsePrimary(stream, parseExpression);
	while (true) {
		const token = stream.peek();
		if (isPunctuation(token, "[")) {
			stream.consume();
			const index = parseExpression(stream);
			stream.expect(TOKENS.PUNCT, "]");
			expression = { type: "index", target: expression, index };
			continue;
		}
		if (token.type === TOKENS.OP && [".", "->"].includes(token.value)) {
			const operator = stream.consume().value;
			const field = stream.expect(TOKENS.ID).value;
			expression = {
				type: "binop",
				op: operator,
				left: expression,
				right: { type: "var", name: field }
			};
			continue;
		}
		if (token.type === TOKENS.OP && ["++", "--"].includes(token.value)) {
			expression = {
				operator: stream.consume().value,
				prefix: false,
				target: expression,
				type: "update"
			};
			continue;
		}
		return expression;
	}
}

function parsePrimary(stream, parseExpression) {
	const token = stream.peek();
	if (token.type === TOKENS.NUM) return { type: "literal", val: stream.consume().value };
	if (token.type === TOKENS.STRING) return { type: "string", val: stream.consume().value };
	if (token.type === TOKENS.ID) return parseIdentifier(stream, parseExpression);
	if (isPunctuation(token, "(")) {
		stream.consume();
		if (isPunctuation(stream.peek(), ")")) stream.error("Empty parentheses are not an expression");
		const expression = parseExpression(stream);
		stream.expect(TOKENS.PUNCT, ")");
		return expression;
	}
	stream.error(`Unexpected token '${token.value}' (${token.type})`);
}

function parseIdentifier(stream, parseExpression) {
	const name = stream.consume().value;
	if (!isPunctuation(stream.peek(), "(")) return { type: "var", name };
	stream.consume();
	const args = [];
	while (!isPunctuation(stream.peek(), ")")) {
		args.push(parseExpression(stream));
		if (!isPunctuation(stream.peek(), ",")) break;
		stream.consume();
	}
	stream.expect(TOKENS.PUNCT, ")");
	return { type: "call", name, args };
}

function isPunctuation(token, value) {
	return token.type === TOKENS.PUNCT && token.value === value;
}
