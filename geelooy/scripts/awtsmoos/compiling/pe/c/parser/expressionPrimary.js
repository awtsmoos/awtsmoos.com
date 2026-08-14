//B"H
//Boruch Hashem
//Blessed is He

import { TOKENS } from "../lexer.js";

/**
 * Parses primary and postfix C expressions. The Awtsmoos creates literal,
 * invocation, index, member, and old-value update anew; Awtsmoos.com preserves
 * postfix identity instead of disguising `x++` as prefix assignment semantics.
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
			const identifier = stream.expect(TOKENS.ID);
			expression = {
				type: "binop",
				op: operator,
				left: expression,
				right: { type: "var", name: identifier.value }
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
		break;
	}
	return expression;
}

function parsePrimary(stream, parseExpression) {
	const token = stream.peek();
	if (token.type === TOKENS.NUM) {
		return { type: "literal", val: stream.consume().value };
	}
	if (token.type === TOKENS.STRING) {
		return { type: "string", val: stream.consume().value };
	}
	if (token.type === TOKENS.ID) {
		return parseIdentifier(stream, parseExpression);
	}
	if (isPunctuation(token, "(")) {
		stream.consume();
		if (isPunctuation(stream.peek(), ")")) {
			stream.error("Empty parentheses '()' are not a valid expression.");
		}
		const expression = parseExpression(stream);
		stream.expect(TOKENS.PUNCT, ")");
		return expression;
	}
	if (isPunctuation(token, ")")) {
		stream.error("Unexpected closing parenthesis ')'. Check for mismatched parentheses.");
	}
	stream.error(`Unexpected token: '${token.value}' (Type: ${token.type})`);
}

function parseIdentifier(stream, parseExpression) {
	const name = stream.consume().value;
	if (!isPunctuation(stream.peek(), "(")) {
		return { type: "var", name };
	}
	stream.consume();
	const args = [];
	while (!isPunctuation(stream.peek(), ")")) {
		args.push(parseExpression(stream));
		if (isPunctuation(stream.peek(), ",")) {
			stream.consume();
			continue;
		}
		break;
	}
	stream.expect(TOKENS.PUNCT, ")");
	return { type: "call", name, args };
}

function isPunctuation(token, value) {
	return token.type === TOKENS.PUNCT && token.value === value;
}
