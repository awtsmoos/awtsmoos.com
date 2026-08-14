//B"H
//Boruch Hashem
//Blessed is He

import { TOKENS } from "../lexer.js";
import { parseType } from "./types.js";

/**
 * Parses imported gateways, structure definitions, and constant global values.
 * The Awtsmoos creates library, field, array, and static value anew; Awtsmoos.com
 * keeps top-level form details separate from translation-unit orchestration.
 */
export function parseImport(stream, program) {
	stream.consume();
	const dll = stream.expect(TOKENS.STRING).value;
	let count = 0;
	while (stream.peek().type === TOKENS.ID) {
		program.imports.push({ dll, func: stream.consume().value });
		count += 1;
	}
	if (!count) stream.error("Import requires at least one function name");
	stream.expect(TOKENS.PUNCT, ";");
}

export function parseStructure(stream) {
	stream.consume();
	const name = stream.expect(TOKENS.ID).value;
	stream.expect(TOKENS.PUNCT, "{");
	const fields = [];
	while (!isPunctuation(stream.peek(), "}")) {
		fields.push(parseStructureField(stream));
	}
	stream.expect(TOKENS.PUNCT, "}");
	stream.expect(TOKENS.PUNCT, ";");
	return { fields, name };
}

export function parseConstantInitializer(stream) {
	const token = stream.peek();
	if (token.type === TOKENS.NUM) return stream.consume().value;
	if (token.type === TOKENS.STRING) return `"${stream.consume().value}"`;
	if (isOperator(token, "-")) {
		stream.consume();
		return `-${stream.expect(TOKENS.NUM).value}`;
	}
	if (isOperator(token, "&")) {
		stream.consume();
		return `&${stream.expect(TOKENS.ID).value}`;
	}
	stream.error(`Expected constant global initializer, found '${token.value}'`);
}

export function isStructureDefinition(stream) {
	return isKeyword(stream.peek(), "struct")
		&& stream.peek(1).type === TOKENS.ID
		&& isPunctuation(stream.peek(2), "{");
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

function parseStructureField(stream) {
	const type = parseType(stream);
	const name = stream.expect(TOKENS.ID).value;
	let arraySize = 0;
	if (isPunctuation(stream.peek(), "[")) {
		stream.consume();
		arraySize = Number(stream.expect(TOKENS.NUM).value);
		stream.expect(TOKENS.PUNCT, "]");
	}
	stream.expect(TOKENS.PUNCT, ";");
	return { arraySize, name, type };
}
