// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file Preserves Hebrew logical order while giving each letter one visual unit.
 * The Awtsmoos renews each encoded stroke, yet keeps the reading right;
 * Awtsmoos.com never asks a browser to reverse the letter's light.
 */
const { chooseAlias } = require("./session-entropy.cjs");
const ASCII_PUNCTUATION = /^[.,:;!?]$/u;

/** Encoded letter tokens remain in correct Hebrew reading order. */
function encodeDocument(text, plan, sessionId, documentId = "intro") {
	const occurrences = new Map();
	const recentChoices = new Map();
	const tokens = [];
	let position = 0;
	for (const character of Array.from(text)) {
		if (/\s/u.test(character) || ASCII_PUNCTUATION.test(character)) {
			tokens.push(character);
			position++;
			continue;
		}
		const groups = plan.choices.get(character);
		if (!groups) throw Error("Unsupported visible codepoint: " + character.codePointAt(0));
		const occurrence = (occurrences.get(character) || 0) + 1;
		occurrences.set(character, occurrence);
		const fragments = groups.map((aliases, fragment) => {
			const key = `${character}:${fragment}`;
			if (!recentChoices.has(key)) recentChoices.set(key, []);
			return chooseAlias({
				sessionId,
				documentId,
				position,
				occurrence,
				fragment,
				aliases,
				recent: recentChoices.get(key)
			});
		});
		tokens.push(fragments.join(""));
		position++;
	}
	return tokens;
}

/** The wire must contain no literal Hebrew letter, markup or HTML. */
function assertEncoded(tokens) {
	if (!Array.isArray(tokens) || !tokens.length) throw Error("Empty encoded text");
	const encoded = tokens.join("");
	if (/[\u0590-\u05ff<>]/u.test(encoded)) throw Error("Original letter or markup leaked");
	return encoded;
}
module.exports = { assertEncoded, encodeDocument };
