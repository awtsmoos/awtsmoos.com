//B"H
//Boruch Hashem
//Blessed is He

import { TOKENS } from "../lexer.js";
import { parseBlock } from "./statements.js";
import {
	isEnumDefinition,
	isKeyword,
	isOperator,
	isPunctuation,
	isStructureDefinition,
	parseConstantInitializer,
	parseEnum,
	parseImport,
	parseStructure
} from "./topLevelForms.js";
import { isDeclarationStart, parseType } from "./types.js";

/**
 * Parses one complete C-subset translation unit. The Awtsmoos creates import,
 * structure, global, function, and source order anew; Awtsmoos.com restores every
 * collection required by verified IR instead of accepting a partial program shell.
 */
export function parseProgram(stream) {
	const program = {
		functions: [],
		globals: [],
		imports: [],
		structs: []
	};
	while (stream.peek().type !== TOKENS.EOF) {
		const token = stream.peek();
		if (isKeyword(token, "import")) {
			parseImport(stream, program);
		} else if (isStructureDefinition(stream)) {
			program.structs.push(parseStructure(stream));
		} else if (isEnumDefinition(stream)) {
			parseEnum(stream, program);
		} else if (isKeyword(token, "typedef")) {
			parseTypedef(stream);
		} else {
			parseFunctionOrGlobal(stream, program);
		}
	}
	return program;
}

function parseFunctionOrGlobal(stream, program) {
	// Stars bind to each declarator (`int *p, q`), so the base type is
	// parsed star-free and every declarator consumes its own stars.
	const type = parseType(stream, { stars: false });
	let declaratorType = { ...type };
	while (stream.peek().type === TOKENS.OP && stream.peek().value === "*") {
		stream.consume();
		declaratorType.ptr++;
	}
	const name = stream.expect(TOKENS.ID).value;
	if (isPunctuation(stream.peek(), "(")) {
		program.functions.push(parseFunction(stream, declaratorType, name));
		return;
	}
	// A comma-separated global list desugars into sibling globals.
	let first = true;
	for (;;) {
		let currentType = declaratorType;
		let currentName = name;
		if (!first) {
			currentType = { ...type };
			while (stream.peek().type === TOKENS.OP && stream.peek().value === "*") {
				stream.consume();
				currentType.ptr++;
			}
			currentName = stream.expect(TOKENS.ID).value;
		}
		first = false;
		let arraySize = null;
		if (isPunctuation(stream.peek(), "[")) {
			stream.consume();
			arraySize = Number(stream.expect(TOKENS.NUM).value);
			stream.expect(TOKENS.PUNCT, "]");
		}
		let value = null;
		if (isOperator(stream.peek(), "=")) {
			stream.consume();
			value = parseConstantInitializer(stream);
		}
		program.globals.push({ name: currentName, type: currentType, value, arraySize });
		if (!isPunctuation(stream.peek(), ",")) break;
		stream.consume();
	}
	stream.expect(TOKENS.PUNCT, ";");
}

/**
 * Registers type aliases (`typedef int myint;`) for later parseType
 * resolution. Aliases never reach IR: every use is already the real type.
 */
function parseTypedef(stream) {
	stream.expect(TOKENS.KEYWORD, "typedef");
	const type = parseType(stream);
	for (;;) {
		const aliased = { ...type };
		while (stream.peek().type === TOKENS.OP && stream.peek().value === "*") {
			stream.consume();
			aliased.ptr++;
		}
		if (isPunctuation(stream.peek(), "[")) {
			stream.error("typedef of array type is not supported");
		}
		const name = stream.expect(TOKENS.ID).value;
		stream.typedefs.set(name, aliased);
		if (!isPunctuation(stream.peek(), ",")) break;
		stream.consume();
	}
	stream.expect(TOKENS.PUNCT, ";");
}

function parseFunction(stream, retType, name) {
	stream.expect(TOKENS.PUNCT, "(");
	const args = [];
	// `(void)` is the C idiom for an empty parameter list.
	if (stream.peek().type === TOKENS.KEYWORD
		&& stream.peek().value === "void"
		&& stream.peek(1).type === TOKENS.PUNCT
		&& stream.peek(1).value === ")") {
		stream.consume();
	} else {
		while (!isPunctuation(stream.peek(), ")")) {
			args.push(parseArgument(stream));
			if (!isPunctuation(stream.peek(), ",")) break;
			stream.consume();
		}
	}
	stream.expect(TOKENS.PUNCT, ")");
	return { args, body: parseBlock(stream), name, retType };
}

function parseArgument(stream) {
	const type = parseType(stream);
	const name = stream.expect(TOKENS.ID).value;
	return { name, type };
}
