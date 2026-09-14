//B"H
//Boruch Hashem
//Blessed be He

{
/** Reads one CSS selector identifier beginning at the supplied offset. */
function readSelectorIdentifier(source, at) {
	let index = at;
	let value = "";
	while (index < source.length && isNameCharacter(source[index])) {
		value += source[index];
		index += 1;
	}
	return Object.freeze({ end: index, value });
}

/** Reads a balanced selector function or attribute body including nested pairs. */
function readBalancedSelector(source, at, open, close) {
	let depth = 0;
	let quote = "";
	for (let index = at; index < source.length; index += 1) {
		const character = source[index];
		if (quote) {
			if (character === "\\") index += 1;
			else if (character === quote) quote = "";
			continue;
		}
		if (character === '"' || character === "'") {
			quote = character;
			continue;
		}
		if (character === open) depth += 1;
		if (character === close) depth -= 1;
		if (depth === 0) {
			return Object.freeze({
				body: source.slice(at + 1, index),
				end: index + 1
			});
		}
	}
	return Object.freeze({ body: source.slice(at + 1), end: source.length });
}

/** Finds a top-level word token inside a pseudo-class argument. */
function findTopLevelWord(source, word) {
	let depth = 0;
	let quote = "";
	for (let index = 0; index <= source.length - word.length; index += 1) {
		const character = source[index];
		if (quote) {
			if (character === "\\") index += 1;
			else if (character === quote) quote = "";
			continue;
		}
		if (character === '"' || character === "'") {
			quote = character;
			continue;
		}
		if (character === "(" || character === "[") depth += 1;
		if (character === ")" || character === "]") depth = Math.max(0, depth - 1);
		if (depth !== 0) continue;
		if (source.slice(index, index + word.length).toLowerCase() !== word) continue;
		const before = source[index - 1] || " ";
		const after = source[index + word.length] || " ";
		if (isSpace(before) && isSpace(after)) return index;
	}
	return -1;
}

function isNameCharacter(character) {
	if (!character) return false;
	const code = character.codePointAt(0);
	return character === "-" || character === "_" || code >= 0x80 || code >= 48 && code <= 57 || code >= 65 && code <= 90 || code >= 97 && code <= 122;
}

function isSpace(character) {
	return character === " " || character === "\n" || character === "\r" || character === "\t" || character === "\f";
}

const AwtsExports = { findTopLevelWord, readBalancedSelector, readSelectorIdentifier };
if (typeof module === "object" && module.exports) {
	module.exports = AwtsExports;
} else {
	globalThis.Merkava = globalThis.Merkava || {};
	Object.assign(globalThis.Merkava, AwtsExports);
}
}
