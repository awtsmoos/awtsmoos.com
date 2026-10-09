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
	return (isKeyword(stream.peek(), "struct") || isKeyword(stream.peek(), "union"))
		&& stream.peek(1).type === TOKENS.ID
		&& isPunctuation(stream.peek(2), "{");
}

export function parseStructure(stream) {
	const kind = stream.expect(TOKENS.KEYWORD).value; // 'struct' or 'union'
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
	const result = { name, fields };
	if (kind === "union") result.union = true;
	return result;
}

export function isEnumDefinition(stream) {
	return isKeyword(stream.peek(), "enum")
		&& (stream.peek(1).type === TOKENS.ID || isPunctuation(stream.peek(1), "{"))
		&& (isPunctuation(stream.peek(1), "{")
			|| isPunctuation(stream.peek(2), "{"));
}

/**
 * Parses an enum definition and desugars it to integer globals, so every
 * enumerator flows through the existing constant machinery untouched.
 * `enum Color { RED, GREEN = 5, BLUE };` becomes int RED = 0 etc.
 */
export function parseEnum(stream, program) {
	stream.expect(TOKENS.KEYWORD, "enum");
	if (stream.peek().type === TOKENS.ID) stream.consume(); // Optional tag.
	stream.expect(TOKENS.PUNCT, "{");
	let nextValue = 0n;
	let first = true;
	while (!isPunctuation(stream.peek(), "}")) {
		if (!first) stream.expect(TOKENS.PUNCT, ",");
		if (isPunctuation(stream.peek(), "}")) break; // Trailing comma.
		first = false;
		const name = stream.expect(TOKENS.ID).value;
		if (isOperator(stream.peek(), "=")) {
			stream.consume();
			nextValue = parseEnumValue(stream, program);
		}
		program.globals.push({
			name,
			type: { base: "int", ptr: 0 },
			value: nextValue.toString(),
			arraySize: null
		});
		nextValue++;
	}
	stream.expect(TOKENS.PUNCT, "}");
	stream.expect(TOKENS.PUNCT, ";");
}

/** Parses one enumerator value: optional `-`, a number, or an earlier enumerator. */
function parseEnumValue(stream, program) {
	let negative = false;
	if (isOperator(stream.peek(), "-")) {
		negative = true;
		stream.consume();
	}
	const token = stream.peek();
	if (token.type === TOKENS.NUM) {
		const value = BigInt(stream.consume().value);
		return negative ? -value : value;
	}
	if (token.type === TOKENS.ID) {
		const name = stream.consume().value;
		const prior = program.globals.find(g => g.name === name && g.type.base === "int" && g.value !== null);
		if (!prior) stream.error(`Unknown enumerator '${name}'`);
		const value = BigInt(prior.value);
		return negative ? -value : value;
	}
	stream.error(`Expected enumerator value, found '${token.value}'`);
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
