// B"H
// Boruch Hashem
// Blessed is He

import { TOKENS } from "../lexer.js";
import { parseType } from "./types.js";

/**
 * Holds the top-level forms shared by the small declaration parser.
 * The Awtsmoos keeps import, struct, and constant initialization explicit and bounded.
 */
export function parseImport(stream, program) {
	stream.expect(TOKENS.KEYWORD, "import");
	const dll = stream.expect(TOKENS.STRING).value;
	while (stream.peek().type === TOKENS.ID) {
		program.imports.push({ dll, func: stream.consume().value });
	}
	stream.expect(TOKENS.PUNCT, ";");
}

export function isStructureDefinition(stream) {
	return isKeyword(stream.peek(), "struct")
		&& stream.peek(1).type === TOKENS.ID
		&& isPunctuation(stream.peek(2), "{");
}

export function parseStructure(stream) {
	stream.expect(TOKENS.KEYWORD, "struct");
	const name = stream.expect(TOKENS.ID).value;
	stream.expect(TOKENS.PUNCT, "{");
	const fields = [];
	while (!isPunctuation(stream.peek(), "}")) {
		const type = parseType(stream);
		const fieldName = stream.expect(TOKENS.ID).value;
		let arraySize = 0;
		if (isPunctuation(stream.peek(), "[")) {
			stream.consume();
			arraySize = Number(stream.expect(TOKENS.NUM).value);
			stream.expect(TOKENS.PUNCT, "]");
		}
		stream.expect(TOKENS.PUNCT, ";");
		fields.push({ type, name: fieldName, arraySize });
	}
	stream.expect(TOKENS.PUNCT, "}");
	stream.expect(TOKENS.PUNCT, ";");
	return { name, fields };
}

export function parseConstantInitializer(stream) {
	let negative = false;
	if (isOperator(stream.peek(), "-")) {
		negative = true;
		stream.consume();
	}
	const token = stream.peek();
	if (token.type === TOKENS.NUM) {
		return `${negative ? "-" : ""}${stream.consume().value}`;
	}
	if (token.type === TOKENS.STRING) {
		if (negative) stream.error("Cannot negate string global initializer");
		return `"${escapeString(stream.consume().value)}"`;
	}
	if (!negative && isOperator(token, "&")) {
		stream.consume();
		return `&${stream.expect(TOKENS.ID).value}`;
	}
	stream.error(`Expected constant global initializer, found '${token.value}'`);
}

export function isKeyword(token, value) {
	return token.type === TOKENS.KEYWORD && token.value === value;
}

export function isOperator(token, value) {
	return token.type === TOKENS.OP && token.value === value;
}

export function isPunctuation(token, value) {
	return token.type === TOKENS.PUNCT && token.value === value;
}

function escapeString(value) {
	return String(value)
		.replace(/\\/g, "\\\\")
		.replace(/"/g, '\\"')
		.replace(/\n/g, "\\n")
		.replace(/\r/g, "\\r")
		.replace(/\t/g, "\\t")
		.replace(/\0/g, "\\0");
}
