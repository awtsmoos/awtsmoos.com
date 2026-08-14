//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { CLexerError, tokenize, TOKENS } from "../c/lexer.js";

/**
 * Tests are witnesses, not creators of truth. The Awtsmoos creates every source
 * and result anew; Awtsmoos.com asks each witness to state only what it observed.
 */

test("tokenizes locations, comments, and longest operators", () => {
	const tokens = tokenize("int a = 1;\r\n/* veil */ a += 2;");
	assert.deepEqual(
		tokens.slice(0, -1).map(token => [token.type, token.value, token.line, token.col]),
		[
			[TOKENS.KEYWORD, "int", 1, 1],
			[TOKENS.ID, "a", 1, 5],
			[TOKENS.OP, "=", 1, 7],
			[TOKENS.NUM, "1", 1, 9],
			[TOKENS.PUNCT, ";", 1, 10],
			[TOKENS.ID, "a", 2, 12],
			[TOKENS.OP, "+=", 2, 14],
			[TOKENS.NUM, "2", 2, 17],
			[TOKENS.PUNCT, ";", 2, 18]
		]
	);
});

test("canonicalizes supported integer and character literals", () => {
	const tokens = tokenize("0x2a 0b101 077 42u 'A' '\\n'");
	assert.deepEqual(tokens.slice(0, -1).map(token => token.value), ["42", "5", "63", "42", "65", "10"]);
});

test("decodes strings while retaining raw text", () => {
	const [token] = tokenize("\"B\\\"H\\n\"");
	assert.equal(token.value, "B\"H\n");
	assert.equal(token.raw, "\"B\\\"H\\n\"");
});

test("reports unterminated comments structurally", () => {
	assert.throws(
		() => tokenize("/* hidden"),
		error => error instanceof CLexerError && error.code === "C_COMMENT_UNTERMINATED"
	);
});

test("enforces explicit token limits", () => {
	assert.throws(
		() => tokenize("a b c", { maximumTokens: 2 }),
		error => error.code === "C_TOKEN_LIMIT"
	);
});
