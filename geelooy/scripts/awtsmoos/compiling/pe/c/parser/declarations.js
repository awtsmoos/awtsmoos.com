//B"H
//Boruch Hashem
//Blessed is He

import { TOKENS } from "../lexer.js";
import { parseBlock } from "./statements.js";
import {
	isEnumDefinition,
	isForwardStructDeclaration,
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
		} else if (isKeyword(token, "extern")) {
			parseExternDeclaration(stream, program);
		} else if (isStructureDefinition(stream)) {
			program.structs.push(parseStructure(stream));
		} else if (isForwardStructDeclaration(stream)) {
			// `struct Name;` — forward declaration; the struct is only used
			// through pointers, so no layout is needed. Just consume it.
			stream.consume(); // 'struct' or 'union'
			stream.expect(TOKENS.ID);
			stream.expect(TOKENS.PUNCT, ";");
		} else if (isEnumDefinition(stream)) {
			parseEnum(stream, program);
		} else if (isKeyword(token, "typedef")) {
			parseTypedef(stream);
		} else {
			parseFunctionOrGlobal(stream, program);
		}
	}
	// A definition in this translation unit satisfies its own extern
	// declaration (standard C): only truly external names stay imports.
	const definedNames = new Set(program.functions.map(fn => fn.name));
	program.imports = program.imports.filter(entry => !definedNames.has(entry.func));
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
		const parsed = parseFunction(stream, declaratorType, name);
		// A prototype `void foo(int);` declares without defining: it becomes
		// an import unless this unit defines it later (standard C — the
		// parseProgram filter drops satisfied imports).
		if (parsed.prototype) {
			program.imports.push({ dll: "prototype", func: name });
			return;
		}
		program.functions.push(parsed);
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
 * Parses `extern` function declarations into IR imports. The Awtsmoos keeps
 * cross-module and host-library calls explicit; Awtsmoos.com lowers each
 * extern name to an external symbol that the linker resolves statically
 * between objects or dynamically through PLT/GOT at load time.
 *
 * `extern int name(params);` declares an imported function (parameter names
 * are optional, as in C prototypes). `extern int name(params) { ... }` is a
 * redundant-extern definition and lowers as a plain function. Extern
 * variables are rejected: the scalar backend has no GOT-relative data model.
 */
function parseExternDeclaration(stream, program) {
	stream.expect(TOKENS.KEYWORD, "extern");
	const type = parseType(stream, { stars: false });
	let declaratorType = { ...type };
	while (stream.peek().type === TOKENS.OP && stream.peek().value === "*") {
		stream.consume();
		declaratorType.ptr++;
	}
	const name = stream.expect(TOKENS.ID).value;
	if (!isPunctuation(stream.peek(), "(")) {
		stream.error(
			`extern '${name}' must declare a function; extern variables are unsupported`
		);
	}
	const args = parsePrototypeArguments(stream);
	if (isPunctuation(stream.peek(), ";")) {
		stream.consume();
		program.imports.push({ dll: "extern", func: name });
		return;
	}
	if (isPunctuation(stream.peek(), "{")) {
		if (args.some(argument => !argument.name)) {
			stream.error(
				`extern definition of '${name}' requires a name for every parameter`
			);
		}
		program.functions.push({
			args,
			body: parseBlock(stream),
			name,
			retType: declaratorType
		});
		return;
	}
	stream.error(`Expected ';' or '{' after extern declaration of '${name}'`);
}

/**
 * Parses a prototype parameter list. Parameter names are optional in a
 * prototype (`extern int f(int, char *);`); definitions still require names
 * wherever the body references them.
 */
function parsePrototypeArguments(stream) {
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
			const type = parseType(stream);
			let argName = "";
			if (stream.peek().type === TOKENS.ID) {
				argName = stream.consume().value;
			}
			args.push({ name: argName, type });
			if (!isPunctuation(stream.peek(), ",")) break;
			stream.consume();
		}
	}
	stream.expect(TOKENS.PUNCT, ")");
	return args;
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
	// Prototype: `void foo(int);` — declaration without a body. The caller
	// routes it to imports; a later definition in this unit wins.
	if (isPunctuation(stream.peek(), ";")) {
		stream.consume();
		return { args, body: null, name, prototype: true, retType };
	}
	return { args, body: parseBlock(stream), name, retType };
}

function parseArgument(stream) {
	const type = parseType(stream);
	// Parameter names are optional in prototypes (`void foo(int);`).
	let name = "";
	if (stream.peek().type === TOKENS.ID) {
		name = stream.consume().value;
	}
	return { name, type };
}
