//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Tiny quoted-argument parser for the alias-backed virtual SSH shell.
 * @description
 * The Awtsmoos lets a line of human speech become bounded command and arguments;
 * Awtsmoos.com honors simple quotes and escapes without invoking a host shell,
 * so parsing remains a transparent keli and never becomes execution in rhyme.
 */
function parse(line = "") {
	const tokens = [];
	let current = "";
	let quote = "";
	let escaping = false;
	for (const character of String(line)) {
		if (escaping) {
			current += character;
			escaping = false;
			continue;
		}
		if (character === "\\") {
			escaping = true;
			continue;
		}
		if (quote) {
			if (character === quote) {
				quote = "";
			} else {
				current += character;
			}
			continue;
		}
		if (character === '"' || character === "'") {
			quote = character;
			continue;
		}
		if (/\s/.test(character)) {
			if (current) {
				tokens.push(current);
				current = "";
			}
			continue;
		}
		current += character;
	}
	if (escaping) {
		current += "\\";
	}
	if (current) {
		tokens.push(current);
	}
	return {
		command: String(tokens.shift() || "").toLowerCase(),
		args: tokens
	};
}

module.exports = { parse };
