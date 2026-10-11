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
	return evaluateSupports(String(source || "").trim(), environment);
}

// B"H 2026-10-09: full @supports condition grammar — `not`, `and`, `or`
// with parenthesized groups, plus `selector(...)` (true when the inner
// selector parses as valid). Previously only a single (prop: value) was
// handled, so every compound condition was skipped.
function evaluateSupports(text, environment) {
	text = text.trim();
	if (/^not[\s(]/i.test(text)) {
		const inner = text.replace(/^not\s*/i, "").trim();
		return !evaluateSupports(stripOuterParens(inner) === inner ? inner : stripOuterParens(inner), environment);
	}
	const orParts = splitTopLevelBool(text, "or");
	if (orParts.length > 1) return orParts.some(p => evaluateSupports(p, environment));
	const andParts = splitTopLevelBool(text, "and");
	if (andParts.length > 1) return andParts.every(p => evaluateSupports(p, environment));
	const unwrapped = stripOuterParens(text);
	if (unwrapped !== text) return evaluateSupports(unwrapped, environment);
	const selMatch = text.match(/^selector\s*\(([\s\S]*)\)$/i);
	if (selMatch) return isValidSelector(selMatch[1].trim());
	const colon = findTopLevelColon(text);
	if (colon < 0) return false;
	return Boolean(environment.supports(text.slice(0, colon).trim(), text.slice(colon + 1).trim()));
}

// Remove one layer of wrapping parens when they enclose the whole string.
function stripOuterParens(text) {
	text = text.trim();
	if (!text.startsWith("(") || !text.endsWith(")")) return text;
	let depth = 0;
	for (let i = 0; i < text.length; i++) {
		if (text[i] === "(") depth++;
		else if (text[i] === ")") {
			depth--;
			if (depth === 0 && i < text.length - 1) return text; // closes early
		}
	}
	return depth === 0 ? text.slice(1, -1).trim() : text;
}

// Split on a top-level boolean operator (not inside parens).
function splitTopLevelBool(text, op) {
	const out = [];
	let depth = 0, start = 0;
	const lower = text.toLowerCase();
	const needle = ` ${op} `;
	for (let i = 0; i < text.length; i++) {
		if (text[i] === "(") depth++;
		else if (text[i] === ")") depth = Math.max(0, depth - 1);
		else if (depth === 0 && lower.startsWith(needle, i)) {
			out.push(text.slice(start, i).trim());
			start = i + needle.length;
			i += needle.length - 1;
		}
	}
	out.push(text.slice(start).trim());
	return out.filter(Boolean);
}

// A selector() argument is valid if it is non-empty and the engine's own
// selector parser accepts it without throwing.
function isValidSelector(sel) {
	if (!sel) return false;
	try {
		const { splitSelectorList } = (typeof module === "object" && module.exports ? require("./CssSelectorList.js") : globalThis.Merkava);
		const parts = splitSelectorList(sel);
		return Array.isArray(parts) && parts.length > 0 && parts.every(p => String(p).trim().length > 0);
	} catch {
		return false;
	}
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
	const name = (colon < 0 ? source : source.slice(0, colon)).trim();
	const value = colon < 0 ? "" : source.slice(colon + 1).trim();
	if (name === "orientation") {
		const width = Number(environment.width || 0);
		const height = Number(environment.height || 0);
		return value === (width >= height ? "landscape" : "portrait");
	}
	// Discrete (value-less or keyword) features.
	if (colon < 0) {
		if (name === "color" || name === "hover" || name === "pointer") return true;
		return false;
	}
	if (name === "prefers-color-scheme") {
		return value === String(environment.colorScheme || "light").toLowerCase();
	}
	if (name === "prefers-reduced-motion") {
		return value === (environment.reducedMotion ? "reduce" : "no-preference");
	}
	// B"H 2026-10-09: forced-colors — `active` only when the embedder
	// signals forced-colors mode; `none` is true otherwise (spec: the
	// engine has no forced-colors mode, so `none` matches).
	if (name === "forced-colors") {
		const fc = !!environment.forcedColors;
		return value === (fc ? "active" : "none");
	}
	if (name === "hover" || name === "any-hover" || name === "pointer" || name === "any-pointer") {
		const cap = String(environment[name.replace(/^any-/, "")] || "hover").toLowerCase();
		return value === cap || (value === "none" && cap === "none");
	}
	if (name === "aspect-ratio" || name === "min-aspect-ratio" || name === "max-aspect-ratio") {
		const ratio = parseAspectRatio(value);
		if (ratio == null) return false;
		const actual = Number(environment.width || 0) / Math.max(1, Number(environment.height || 0));
		if (name === "aspect-ratio") return Math.abs(actual - ratio) < 1e-6;
		if (name === "min-aspect-ratio") return actual >= ratio;
		return actual <= ratio;
	}
	if (name === "resolution" || name === "min-resolution" || name === "max-resolution") {
		const dpi = parseResolution(value);
		if (dpi == null) return false;
		const actual = Number(environment.resolutionDpi || 96);
		if (name === "resolution") return actual === dpi;
		if (name === "min-resolution") return actual >= dpi;
		return actual <= dpi;
	}
	const numeric = parseLength(value, environment);
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
	return parseLength(source, {});
}

/** Parses px/em/rem lengths; em/rem resolve against environment.fontSize (default 16). */
function parseLength(source, environment = {}) {
	const text = String(source || "").trim().toLowerCase();
	const fontSize = Number(environment.fontSize) || 16;
	if (text.endsWith("px")) {
		const value = Number(text.slice(0, -2));
		return Number.isFinite(value) ? value : null;
	}
	if (text.endsWith("rem")) {
		const value = Number(text.slice(0, -3));
		return Number.isFinite(value) ? value * fontSize : null;
	}
	if (text.endsWith("em")) {
		const value = Number(text.slice(0, -2));
		return Number.isFinite(value) ? value * fontSize : null;
	}
	return null;
}

function parseAspectRatio(source) {
	const text = String(source || "").trim();
	const m = text.match(/^(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)$/);
	if (!m) return null;
	const denom = parseFloat(m[2]);
	if (!denom) return null;
	return parseFloat(m[1]) / denom;
}

function parseResolution(source) {
	const text = String(source || "").trim().toLowerCase();
	let m = text.match(/^([\d.]+)\s*dpi$/);
	if (m) return parseFloat(m[1]) || null;
	m = text.match(/^([\d.]+)\s*dppx$/);
	if (m) return (parseFloat(m[1]) || 0) * 96 || null;
	m = text.match(/^([\d.]+)\s*dpcm$/);
	if (m) return (parseFloat(m[1]) || 0) * 2.54 || null;
	return null;
}

const AwtsExports = { matchesMediaQuery, matchesSupportsCondition };
if (typeof module === "object" && module.exports) {
	module.exports = AwtsExports;
} else {
	globalThis.Merkava = globalThis.Merkava || {};
	Object.assign(globalThis.Merkava, AwtsExports);
}
}
