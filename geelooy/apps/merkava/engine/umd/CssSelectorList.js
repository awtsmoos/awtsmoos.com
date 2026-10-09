//B"H
//Boruch Hashem
//Blessed be He

{
/** Splits a selector list only at top-level commas. */
function splitSelectorList(source) {
	return splitTopLevel(String(source || ""), ",").map(value => value.trim()).filter(Boolean);
}

/** Splits text on a delimiter while respecting strings and bracket nesting. */
function splitTopLevel(source, delimiter) {
	const parts = [];
	let start = 0;
	let depth = 0;
	let quote = "";
	for (let at = 0; at < source.length; at += 1) {
		const character = source[at];
		if (quote) {
			if (character === "\\") at += 1;
			else if (character === quote) quote = "";
			continue;
		}
		if (character === '"' || character === "'") {
			quote = character;
			continue;
		}
		if (character === "(" || character === "[") depth += 1;
		if (character === ")" || character === "]") depth = Math.max(0, depth - 1);
		if (depth === 0 && character === delimiter) {
			parts.push(source.slice(start, at));
			start = at + 1;
		}
	}
	parts.push(source.slice(start));
	return parts;
}

/** Tokenizes a complex selector into compounds and explicit combinators. */
function tokenizeSelectorSequence(source) {
	const selector = String(source || "").trim();
	const tokens = [];
	let start = 0;
	let depth = 0;
	let quote = "";
	let pendingSpace = false;
	for (let at = 0; at <= selector.length; at += 1) {
		const character = selector[at] || "";
		if (quote) {
			if (character === "\\") at += 1;
			else if (character === quote) quote = "";
			continue;
		}
		if (character === '"' || character === "'") {
			quote = character;
			continue;
		}
		if (character === "(" || character === "[") depth += 1;
		if (character === ")" || character === "]") depth = Math.max(0, depth - 1);
		if (depth > 0) continue;
		if (isSpace(character) || at === selector.length) {
			pushCompound(tokens, selector.slice(start, at));
			pendingSpace = tokens.length > 0;
			while (isSpace(selector[at + 1])) at += 1;
			start = at + 1;
			continue;
		}
		if (character === ">" || character === "+" || character === "~") {
			pushCompound(tokens, selector.slice(start, at));
			tokens.push(character);
			pendingSpace = false;
			while (isSpace(selector[at + 1])) at += 1;
			start = at + 1;
			continue;
		}
		if (pendingSpace && start === at) {
			tokens.push(" ");
			pendingSpace = false;
		}
	}
	return normalizeCombinators(tokens);
}

function pushCompound(tokens, value) {
	const clean = String(value || "").trim();
	if (clean) tokens.push(clean);
}

function normalizeCombinators(tokens) {
	return tokens.filter((value, index) => {
		if (value !== " ") return true;
		const before = tokens[index - 1];
		const after = tokens[index + 1];
		return Boolean(before && after && !isCombinator(before) && !isCombinator(after));
	});
}

function isCombinator(value) {
	return value === " " || value === ">" || value === "+" || value === "~";
}

function isSpace(character) {
	return character === " " || character === "\n" || character === "\r" || character === "\t" || character === "\f";
}

const AwtsExports = { isCombinator, splitSelectorList, splitTopLevel, tokenizeSelectorSequence };
if (typeof module === "object" && module.exports) {
	module.exports = AwtsExports;
} else {
	globalThis.Merkava = globalThis.Merkava || {};
	Object.assign(globalThis.Merkava, AwtsExports);
}
}
