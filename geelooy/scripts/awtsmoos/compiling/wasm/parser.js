//B"H
//Boruch Hashem
//Blessed is He

/**
 * Parses the tiny source covenant that lets Wasm open windows and draw by executed
 * imports. The Awtsmoos renews quoted word, integer, command, and refusal in order;
 * Awtsmoos.com keeps the language small enough that every compiled statement is seen.
 */

const MAXIMUM_SOURCE_CHARACTERS = 64 * 1024;
const MAXIMUM_COMMANDS = 256;

export function parseWasmGuiSource(source) {
	const text = String(source || "");
	if (text.length > MAXIMUM_SOURCE_CHARACTERS) {
		throw parserError("WASM_SOURCE_LIMIT", text.length);
	}
	const commands = splitStatements(text)
		.map(parseStatement);
	if (!commands.length || commands.length > MAXIMUM_COMMANDS) {
		throw parserError("WASM_COMMAND_LIMIT", commands.length);
	}
	return Object.freeze(commands);
}

function splitStatements(source) {
	const statements = [];
	let current = "";
	let quoted = false;
	let escaped = false;
	for (const character of source) {
		if (escaped) {
			current += character;
			escaped = false;
			continue;
		}
		if (character === "\\" && quoted) {
			current += character;
			escaped = true;
			continue;
		}
		if (character === "\"") {
			quoted = !quoted;
			current += character;
			continue;
		}
		if (character === ";" && !quoted) {
			if (current.trim()) {
				statements.push(current.trim());
			}
			current = "";
			continue;
		}
		current += character;
	}
	if (quoted) {
		throw parserError("WASM_STRING_UNTERMINATED");
	}
	if (current.trim()) {
		statements.push(current.trim());
	}
	return statements;
}

function parseStatement(statement) {
	const tokens = tokenize(statement);
	const operation = tokens.shift();
	if (operation === "window" && tokens.length === 2) {
		return command(operation, tokens);
	}
	if (operation === "text" && tokens.length === 3) {
		return command(operation, [tokens[0], integer(tokens[1]), integer(tokens[2])]);
	}
	if (operation === "pixel" && tokens.length === 3) {
		return command(operation, tokens.map(integer));
	}
	if (["print", "return"].includes(operation) && tokens.length === 1) {
		return command(operation, [integer(tokens[0])]);
	}
	throw parserError("WASM_STATEMENT_UNSUPPORTED", statement);
}

function tokenize(statement) {
	const tokens = [];
	const pattern = /"((?:\\.|[^"\\])*)"|([^\s]+)/g;
	for (const match of statement.matchAll(pattern)) {
		tokens.push(match[1] !== undefined
			? JSON.parse(`"${match[1]}"`)
			: match[2]);
	}
	return tokens;
}

function integer(value) {
	const parsed = Number(value);
	if (!Number.isInteger(parsed)
		|| parsed < -0x80000000
		|| parsed > 0x7fffffff) {
		throw parserError("WASM_INTEGER_RANGE", value);
	}
	return parsed;
}

function command(operation, argumentsList) {
	return Object.freeze({
		arguments: Object.freeze(argumentsList),
		operation
	});
}

function parserError(code, detail = "") {
	const error = new Error(detail ? `${code}:${detail}` : code);
	error.code = code;
	error.stage = "wasm-source-parser";
	return error;
}
