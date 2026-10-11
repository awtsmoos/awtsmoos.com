//B"H
//Boruch Hashem
//Blessed be He

{
const characters = (typeof module === "object" && module.exports ? require("./CssSyntaxCharacters.js") : globalThis.Merkava);

/**
 * Tokenizes CSS syntax without third-party code or regex stylesheet parsing.
 * Source offsets are retained so parse failures can map back to original CSS.
 */
function tokenizeCss(source) {
	const text = String(source || "");
	const tokens = [];
	let at = 0;
	while (at < text.length) {
		const start = at;
		const character = text[at];
		if (characters.isCssWhitespace(character)) {
			while (characters.isCssWhitespace(text[at])) at += 1;
			tokens.push(makeToken("whitespace", text.slice(start, at), start, at));
			continue;
		}
		if (character === "/" && text[at + 1] === "*") {
			at = consumeComment(text, at + 2);
			continue;
		}
		if (character === '"' || character === "'") {
			const result = consumeString(text, at, character);
			at = result.end;
			tokens.push(makeToken("string", result.value, start, at));
			continue;
		}
		if (character === "#" && characters.startsCssName(text, at + 1)) {
			const result = consumeName(text, at + 1);
			at = result.end;
			tokens.push(makeToken("hash", result.value, start, at));
			continue;
		}
		if (character === "@" && characters.startsCssName(text, at + 1)) {
			const result = consumeName(text, at + 1);
			at = result.end;
			tokens.push(makeToken("at-keyword", result.value, start, at));
			continue;
		}
		if (characters.startsCssNumber(text, at)) {
			const result = characters.consumeCssNumber(text, at);
			at = result.end;
			if (text[at] === "%") {
				at += 1;
				tokens.push(makeToken("percentage", result.value, start, at));
				continue;
			}
			if (characters.startsCssName(text, at)) {
				const unit = consumeName(text, at);
				at = unit.end;
				tokens.push(makeToken("dimension", result.value, start, at, unit.value));
				continue;
			}
			tokens.push(makeToken("number", result.value, start, at));
			continue;
		}
		if (characters.startsCssName(text, at)) {
			const result = consumeName(text, at);
			at = result.end;
			const type = text[at] === "(" ? "function" : "ident";
			if (type === "function") at += 1;
			tokens.push(makeToken(type, result.value, start, at));
			continue;
		}
		at += 1;
		tokens.push(makeToken("delim", character, start, at));
	}
	return tokens;
}

/** Creates one immutable CSS token record. */
function makeToken(type, value, start, end, unit = "") {
	return Object.freeze({ end, start, type, unit, value });
}

function consumeComment(text, at) {
	const end = text.indexOf("*/", at);
	return end < 0 ? text.length : end + 2;
}

function consumeString(text, at, quote) {
	let value = "";
	for (let index = at + 1; index < text.length; index += 1) {
		if (text[index] === quote) return { end: index + 1, value };
		if (text[index] === "\\" && index + 1 < text.length) index += 1;
		value += text[index];
	}
	return { end: text.length, value };
}

function consumeName(text, at) {
	let value = "";
	let index = at;
	while (characters.isCssNameCharacter(text[index])) {
		value += text[index];
		index += 1;
	}
	return { end: index, value };
}

const AwtsExports = { tokenizeCss };
if (typeof module === "object" && module.exports) {
	module.exports = AwtsExports;
} else {
	globalThis.Merkava = globalThis.Merkava || {};
	Object.assign(globalThis.Merkava, AwtsExports);
}
}
