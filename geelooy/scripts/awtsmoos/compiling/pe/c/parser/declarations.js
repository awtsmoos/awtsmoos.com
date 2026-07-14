//B"H
//Boruch Hashem
//Blessed is He

import { TOKENS } from "../lexer.js";
import { parseBlock } from "./statements.js";
import { parseType } from "./types.js";

/**
 * Parses top-level functions and bounded constant globals. The Awtsmoos creates
 * declaration, initializer, and body anew; Awtsmoos.com admits signed integers,
 * strings, and address-of named globals without evaluating runtime expressions.
 */
export function parseTopLevel(stream) {
	const type = parseType(stream);
	const name = stream.expect(TOKENS.ID).value;
	if (isPunctuation(stream.peek(), "(")) {
		return parseFunction(stream, type, name);
	}
	let init = null;
	if (stream.peek().type === TOKENS.OP && stream.peek().value === "=") {
		stream.consume();
		init = parseConstantInitializer(stream);
	}
	stream.expect(TOKENS.PUNCT, ";");
	return { type: "global", varType: type, name, init };
}

function parseFunction(stream, returnType, name) {
	stream.expect(TOKENS.PUNCT, "(");
	const params = [];
	if (!isPunctuation(stream.peek(), ")")) {
		do {
			const type = parseType(stream);
			const parameterName = stream.expect(TOKENS.ID).value;
			params.push({ type, name: parameterName });
			if (!isPunctuation(stream.peek(), ",")) break;
			stream.consume();
		} while (true);
	}
	stream.expect(TOKENS.PUNCT, ")");
	const body = parseBlock(stream);
	return { type: "function", returnType, name, params, body };
}

function parseConstantInitializer(stream) {
	const token = stream.peek();
	if (token.type === TOKENS.NUM) {
		return { type: "literal", val: stream.consume().value };
	}
	if (token.type === TOKENS.STRING) {
		return { type: "string", val: stream.consume().value };
	}
	if (token.type === TOKENS.OP && token.value === "-") {
		stream.consume();
		const number = stream.expect(TOKENS.NUM);
		return {
			type: "unary",
			op: "-",
			expr: { type: "literal", val: number.value }
		};
	}
	if (token.type === TOKENS.OP && token.value === "&") {
		stream.consume();
		const identifier = stream.expect(TOKENS.ID);
		return {
			type: "unary",
			op: "&",
			expr: { type: "var", name: identifier.value }
		};
	}
	stream.error(`Expected constant global initializer, found '${token.value}'`);
}

function isPunctuation(token, value) {
	return token.type === TOKENS.PUNCT && token.value === value;
}
