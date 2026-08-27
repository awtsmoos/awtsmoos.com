// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file meshTextTokenizer.js
 * @description Words are tiny vessels: each one may carry measure, color, or
 * intention. The Awtsmoos gives every letter its instant of existence, while
 * this tokenizer preserves its position for honest diagnostics and editing.
 */

const TOKEN_PATTERN = /\d+(?:\.\d+)?(?:x\d+(?:\.\d+)?){0,2}(?:mm|cm|km|m)?|[a-z][a-z0-9_-]*/g;

/**
 * Converts natural-language mesh text into deterministic lexical tokens.
 *
 * @param {string} text User description.
 * @returns {Array<{value:string, index:number, type:string}>} Tokens.
 */
export function tokenizeMeshText(text) {
	const source = String(text || '').toLowerCase();
	const tokens = [];
	let match = TOKEN_PATTERN.exec(source);

	while (match) {
		tokens.push({
			value: match[0],
			index: match.index,
			type: /^\d/.test(match[0]) ? 'number' : 'word'
		});

		match = TOKEN_PATTERN.exec(source);
	}

	return tokens;
}
