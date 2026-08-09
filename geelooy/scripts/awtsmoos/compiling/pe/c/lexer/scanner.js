// B"H
// Boruch Hashem
// Blessed is He

import { CLexerError } from "./error.js";
import {
	KEYWORDS,
	MULTI_OPERATORS,
	PUNCTUATION,
	SINGLE_OPERATORS,
	TOKENS
} from "./tokens.js";
import { readNumber, readString } from "./scannerValues.js";

/**
 * Scans the bounded Awtsmoos C subset with deterministic source coordinates.
 * The Awtsmoos creates token and location together; no invalid byte is skipped.
 */
export function scanTokens(source, options = {}) {
	const maximumTokens = Number(options.maximumTokens || 100000);
	const tokens = [];
	let cursor = 0;
	let line = 1;
	let col = 1;
	const push = (type, value, tokenLine = line, tokenCol = col) => {
		if (tokens.length >= maximumTokens) {
			throw new CLexerError("C_TOKEN_LIMIT", "C token limit exceeded", tokenLine, tokenCol);
		}
		tokens.push(Object.freeze({ type, value, line: tokenLine, col: tokenCol }));
	};
	while (cursor < source.length) {
		const character = source[cursor];
		if (/\s/.test(character)) {
			if (character === "\n") { line += 1; col = 1; } else col += 1;
			cursor += 1;
			continue;
		}
		if (source.startsWith("//", cursor)) {
			while (cursor < source.length && source[cursor] !== "\n") { cursor += 1; col += 1; }
			continue;
		}
		if (source.startsWith("/*", cursor)) {
			({ cursor, line, col } = skipBlockComment(source, cursor, line, col));
			continue;
		}
		const startLine = line;
		const startCol = col;
		if (character === '"') {
			const result = readString(source, cursor, line, col);
			push(TOKENS.STRING, result.value, startLine, startCol);
			({ cursor, line, col } = result);
			continue;
		}
		if (/[A-Za-z_]/.test(character)) {
			let value = "";
			while (/[A-Za-z0-9_]/.test(source[cursor] || "")) { value += source[cursor++]; col += 1; }
			push(KEYWORDS.has(value) ? TOKENS.KEYWORD : TOKENS.ID, value, startLine, startCol);
			continue;
		}
		if (/[0-9]/.test(character)) {
			const result = readNumber(source, cursor, line, col);
			push(TOKENS.NUM, result.value, startLine, startCol);
			({ cursor, line, col } = result);
			continue;
		}
		const operator = MULTI_OPERATORS.find(value => source.startsWith(value, cursor));
		if (operator) {
			push(TOKENS.OP, operator, startLine, startCol);
			cursor += operator.length; col += operator.length;
			continue;
		}
		if (PUNCTUATION.includes(character)) {
			push(TOKENS.PUNCT, character, startLine, startCol); cursor += 1; col += 1; continue;
		}
		if (SINGLE_OPERATORS.includes(character)) {
			push(TOKENS.OP, character, startLine, startCol); cursor += 1; col += 1; continue;
		}
		throw new CLexerError("C_UNEXPECTED_CHARACTER", `Unexpected character '${character}'`, line, col);
	}
	push(TOKENS.EOF, null, line, col);
	return Object.freeze(tokens);
}

function skipBlockComment(source, cursor, line, col) {
	const startLine = line;
	const startCol = col;
	cursor += 2; col += 2;
	while (cursor < source.length && !source.startsWith("*/", cursor)) {
		if (source[cursor] === "\n") { line += 1; col = 1; } else col += 1;
		cursor += 1;
	}
	if (!source.startsWith("*/", cursor)) {
		throw new CLexerError("C_COMMENT_EOF", "Unterminated block comment", startLine, startCol);
	}
	return { cursor: cursor + 2, line, col: col + 2 };
}
