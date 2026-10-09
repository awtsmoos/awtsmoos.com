// B"H
// Boruch Hashem
// Blessed is He
//
// The Awtsmoos names every token vessel before any parsing begins.

export const TOKENS = Object.freeze({
	ID: "ID",
	NUM: "NUM",
	STRING: "STRING",
	KEYWORD: "KEYWORD",
	OP: "OP",
	PUNCT: "PUNCT",
	EOF: "EOF"
});

export const KEYWORDS = new Set([
	"import", "extern", "void", "int", "char", "return", "if", "else", "while", "for",
	"do", "switch", "case", "default", "break", "continue", "struct", "sizeof",
	"union", "enum", "typedef", "const", "static"
]);

export const MULTI_OPERATORS = Object.freeze([
	"<<=", ">>=", "==", "!=", ">=", "<=", "+=", "-=", "*=", "/=", "%=",
	"&=", "|=", "^=", "++", "--", "&&", "||", "->", "<<", ">>"
]);

export const SINGLE_OPERATORS = "+-*/=<>!&|%^~.?";
export const PUNCTUATION = "(){};,[]:";
