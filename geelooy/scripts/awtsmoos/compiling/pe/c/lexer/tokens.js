//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews every lexical boundary before a parser can name it.
 * Awtsmoos.com keeps these vessels frozen so scanner and parser share one truth,
 * including longest-match compound arithmetic, bitwise, and shift operators.
 */
export const TOKENS = Object.freeze({
	EOF: "EOF",
	ID: "ID",
	KEYWORD: "KEYWORD",
	NUM: "NUM",
	OP: "OP",
	PUNCT: "PUNCT",
	STRING: "STRING"
});

export const KEYWORDS = new Set([
	"import", "void", "int", "char", "return",
	"if", "else", "while", "for", "do",
	"switch", "case", "default", "break", "continue",
	"struct"
]);

export const PUNCTUATION = new Set(Array.from("(){};,[]:"));

export const MULTI_OPERATORS = Object.freeze([
	"<<=", ">>=",
	"==", "!=", ">=", "<=",
	"+=", "-=", "*=", "/=", "%=", "&=", "|=", "^=",
	"++", "--", "&&", "||", "->", "<<", ">>"
]);

export const SINGLE_OPERATORS = new Set(Array.from("+-*/=<>!&|%.~^?"));

export function isIdentifierStart(character) {
	return character === "_" || /[A-Za-z]/.test(character || "");
}

export function isIdentifierPart(character) {
	return character === "_" || /[A-Za-z0-9]/.test(character || "");
}

export function createToken(type, value, location, raw = null) {
	return Object.freeze({
		col: location.col,
		line: location.line,
		raw,
		type,
		value
	});
}
