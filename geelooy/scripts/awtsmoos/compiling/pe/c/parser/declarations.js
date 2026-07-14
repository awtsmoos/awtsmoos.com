//B"H
//Boruch Hashem
//Blessed is He

import { TOKENS } from "../lexer.js";
import { parseBlock } from "./statements.js";
import {
	isKeyword,
	isOperator,
	isPunctuation,
	isStructureDefinition,
	parseConstantInitializer,
	parseImport,
	parseStructure
} from "./topLevelForms.js";
import { parseType } from "./types.js";

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
		} else {
			parseFunctionOrGlobal(stream, program);
		}
	}
	return program;
}

function parseFunctionOrGlobal(stream, program) {
	const type = parseType(stream);
	const name = stream.expect(TOKENS.ID).value;
	if (isPunctuation(stream.peek(), "(")) {
		program.functions.push(parseFunction(stream, type, name));
		return;
	}
	let value = null;
	if (isOperator(stream.peek(), "=")) {
		stream.consume();
		value = parseConstantInitializer(stream);
	}
	stream.expect(TOKENS.PUNCT, ";");
	program.globals.push({ name, type, value });
}

function parseFunction(stream, retType, name) {
	stream.expect(TOKENS.PUNCT, "(");
	const args = [];
	while (!isPunctuation(stream.peek(), ")")) {
		args.push(parseArgument(stream));
		if (!isPunctuation(stream.peek(), ",")) break;
		stream.consume();
	}
	stream.expect(TOKENS.PUNCT, ")");
	return { args, body: parseBlock(stream), name, retType };
}

function parseArgument(stream) {
	const type = parseType(stream);
	const name = stream.expect(TOKENS.ID).value;
	return { name, type };
}
