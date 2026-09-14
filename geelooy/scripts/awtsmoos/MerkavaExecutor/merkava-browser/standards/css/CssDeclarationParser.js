//B"H
//Boruch Hashem
//Blessed be He

{
const { tokenizeCss } = (typeof module === "object" && module.exports ? require("./CssSyntaxTokenizer.js") : globalThis.Merkava);

/**
 * Parses CSS declarations without splitting strings/functions on semicolons.
 * Each result retains source order and the important flag for cascade ranking.
 */
function parseCssDeclarations(source) {
	const text = String(source || "");
	const tokens = tokenizeCss(text);
	const declarations = [];
	let start = 0;
	for (let index = 0, depth = 0; index <= tokens.length; index += 1) {
		const value = tokens[index]?.value;
		if (value === "(" || value === "[" || value === "{") depth += 1;
		if (value === ")" || value === "]" || value === "}") depth = Math.max(0, depth - 1);
		if (index === tokens.length || value === ";" && depth === 0) {
			const declaration = parseDeclaration(text, tokens, start, index);
			if (declaration) declarations.push(declaration);
			start = index + 1;
		}
	}
	return declarations;
}

/** Parses one declaration token range around its first top-level colon. */
function parseDeclaration(text, tokens, start, end) {
	start = trimStart(tokens, start, end);
	end = trimEnd(tokens, start, end);
	if (start >= end || tokens[start]?.type === "at-keyword") return null;
	const colon = findColon(tokens, start, end);
	if (colon < 0) return null;
	const name = tokenSlice(text, tokens, start, colon).trim().toLowerCase();
	if (!name) return null;
	let valueEnd = trimEnd(tokens, colon + 1, end);
	const important = findImportant(tokens, colon + 1, valueEnd);
	if (important >= 0) valueEnd = trimEnd(tokens, colon + 1, important);
	const value = tokenSlice(text, tokens, colon + 1, valueEnd).trim();
	return Object.freeze({ important: important >= 0, name, value });
}

function findColon(tokens, start, end) {
	let depth = 0;
	for (let index = start; index < end; index += 1) {
		const value = tokens[index].value;
		if (value === "(" || value === "[") depth += 1;
		if (value === ")" || value === "]") depth = Math.max(0, depth - 1);
		if (depth === 0 && value === ":") return index;
	}
	return -1;
}

function findImportant(tokens, start, end) {
	let last = trimEnd(tokens, start, end) - 1;
	if (String(tokens[last]?.value || "").toLowerCase() !== "important") return -1;
	last = trimEnd(tokens, start, last) - 1;
	return tokens[last]?.value === "!" ? last : -1;
}

function tokenSlice(text, tokens, start, end) {
	if (start >= end || !tokens[start]) return "";
	return text.slice(tokens[start].start, tokens[end - 1].end);
}

function trimStart(tokens, start, end) {
	let index = start;
	while (index < end && tokens[index]?.type === "whitespace") index += 1;
	return index;
}

function trimEnd(tokens, start, end) {
	let index = end;
	while (index > start && tokens[index - 1]?.type === "whitespace") index -= 1;
	return index;
}

const AwtsExports = { parseCssDeclarations };
if (typeof module === "object" && module.exports) {
	module.exports = AwtsExports;
} else {
	globalThis.Merkava = globalThis.Merkava || {};
	Object.assign(globalThis.Merkava, AwtsExports);
}
}
