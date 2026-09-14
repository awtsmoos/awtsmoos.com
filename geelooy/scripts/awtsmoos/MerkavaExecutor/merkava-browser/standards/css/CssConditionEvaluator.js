//B"H
//Boruch Hashem
//Blessed be He

{
const { splitTopLevel } = (typeof module === "object" && module.exports ? require("./CssSelectorList.js") : globalThis.Merkava);

/** Evaluates supported media-query syntax against an explicit virtual viewport. */
function matchesMediaQuery(source, environment = {}) {
	return splitTopLevel(String(source || ""), ",").some(query => matchesOneQuery(query, environment));
}

/** Evaluates @supports through a capability callback owned by the Merkava engine. */
function matchesSupportsCondition(source, environment = {}) {
	if (typeof environment.supports !== "function") return false;
	const text = stripParens(String(source || "").trim());
	const colon = findTopLevelColon(text);
	if (colon < 0) return false;
	return Boolean(environment.supports(text.slice(0, colon).trim(), text.slice(colon + 1).trim()));
}

function matchesOneQuery(source, environment) {
	let text = String(source || "").trim().toLowerCase();
	let negate = false;
	if (text.startsWith("not ")) {
		negate = true;
		text = text.slice(4).trim();
	}
	if (text.startsWith("only ")) text = text.slice(5).trim();
	const parts = splitAnd(text);
	let matches = true;
	for (const part of parts) {
		if (!part.startsWith("(")) matches = matches && matchesMediaType(part, environment);
		else matches = matches && matchesFeature(stripParens(part), environment);
	}
	return negate ? !matches : matches;
}

function matchesMediaType(type, environment) {
	const wanted = type.trim();
	if (!wanted || wanted === "all") return true;
	return wanted === String(environment.type || "screen").toLowerCase();
}

function matchesFeature(source, environment) {
	const colon = findTopLevelColon(source);
	if (colon < 0) return false;
	const name = source.slice(0, colon).trim();
	const value = source.slice(colon + 1).trim();
	if (name === "orientation") {
		const width = Number(environment.width || 0);
		const height = Number(environment.height || 0);
		return value === (width >= height ? "landscape" : "portrait");
	}
	const numeric = parsePx(value);
	if (numeric == null) return false;
	if (name === "width") return Number(environment.width) === numeric;
	if (name === "min-width") return Number(environment.width) >= numeric;
	if (name === "max-width") return Number(environment.width) <= numeric;
	if (name === "height") return Number(environment.height) === numeric;
	if (name === "min-height") return Number(environment.height) >= numeric;
	if (name === "max-height") return Number(environment.height) <= numeric;
	return false;
}

function splitAnd(source) {
	const result = [];
	let start = 0;
	let depth = 0;
	for (let at = 0; at < source.length; at += 1) {
		if (source[at] === "(") depth += 1;
		if (source[at] === ")") depth = Math.max(0, depth - 1);
		if (depth === 0 && source.slice(at, at + 5) === " and ") {
			result.push(source.slice(start, at).trim());
			start = at + 5;
			at += 4;
		}
	}
	result.push(source.slice(start).trim());
	return result.filter(Boolean);
}

function stripParens(source) {
	return source.startsWith("(") && source.endsWith(")") ? source.slice(1, -1).trim() : source;
}

function findTopLevelColon(source) {
	let depth = 0;
	for (let at = 0; at < source.length; at += 1) {
		if (source[at] === "(") depth += 1;
		if (source[at] === ")") depth = Math.max(0, depth - 1);
		if (depth === 0 && source[at] === ":") return at;
	}
	return -1;
}

function parsePx(source) {
	const text = String(source || "").trim().toLowerCase();
	if (!text.endsWith("px")) return null;
	const value = Number(text.slice(0, -2));
	return Number.isFinite(value) ? value : null;
}

const AwtsExports = { matchesMediaQuery, matchesSupportsCondition };
if (typeof module === "object" && module.exports) {
	module.exports = AwtsExports;
} else {
	globalThis.Merkava = globalThis.Merkava || {};
	Object.assign(globalThis.Merkava, AwtsExports);
}
}
