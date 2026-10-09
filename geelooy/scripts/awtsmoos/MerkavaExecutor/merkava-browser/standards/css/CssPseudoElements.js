//B"H
//Boruch Hashem
//Blessed be He

{
const { matchesCssSelector } = (typeof module === "object" && module.exports ? require("./CssSelectorMatcher.js") : globalThis.Merkava);

/**
 * CssPseudoElements — generated-content model for ::before, ::after,
 * ::first-line, ::first-letter, ::placeholder, ::selection, ::marker.
 *
 * The selector matcher parses pseudo-elements but never matches them
 * against real elements (they need generated boxes). This module:
 *  - resolves the `content` property (strings, attr(), counter(), url()),
 *  - collects author rules whose selector targets ::pseudo of an element,
 *  - builds generated box descriptors the layout engine can materialize.
 *
 * State contract: counters live on ownerDocument.__merkavaCounters = { name: value }.
 */

const SUPPORTED = new Set(["before", "after", "first-line", "first-letter", "placeholder", "selection", "marker"]);
const BOX_GENERATING = new Set(["before", "after", "marker"]);

function isPseudoElementName(name) {
	return SUPPORTED.has(String(name || "").toLowerCase());
}

/** Splits a selector into { base, pseudo } when it ends with ::name. */
function splitPseudoSelector(selector) {
	const text = String(selector || "").trim();
	const m = text.match(/::([a-zA-Z-]+)\s*$/);
	if (!m) return { base: text, pseudo: "" };
	const name = m[1].toLowerCase();
	if (!isPseudoElementName(name)) return { base: text, pseudo: "" };
	return { base: text.slice(0, m.index).trim() || "*", pseudo: name };
}

function unquoteString(text) {
	const t = String(text || "").trim();
	if (t.length >= 2 && ((t[0] === '"' && t[t.length - 1] === '"') || (t[0] === "'" && t[t.length - 1] === "'"))) {
		return t.slice(1, -1).replace(/\\(.)/g, "$1");
	}
	return null;
}

/**
 * Resolves a `content` value for an element.
 * Returns the generated text, or null when no box is generated
 * (content: none | normal).
 */
function resolveContent(value, element) {
	const text = String(value == null ? "normal" : value).trim();
	if (!text || text.toLowerCase() === "none" || text.toLowerCase() === "normal") return null;
	const parts = [];
	let start = 0;
	let depth = 0;
	let inStr = null;
	for (let at = 0; at <= text.length; at += 1) {
		const ch = text[at];
		if (inStr) {
			if (ch === "\\") { at += 1; continue; }
			if (ch === inStr) inStr = null;
			continue;
		}
		if (ch === '"' || ch === "'") { inStr = ch; continue; }
		if (ch === "(") depth += 1;
		if (ch === ")") depth = Math.max(0, depth - 1);
		if ((at === text.length || (/\s/.test(ch) && depth === 0)) && !inStr) {
			const part = text.slice(start, at).trim();
			if (part) parts.push(part);
			start = at + 1;
		}
	}
	let out = "";
	for (const part of parts) {
		const str = unquoteString(part);
		if (str != null) { out += str; continue; }
		let m = part.match(/^attr\(\s*([a-zA-Z_:][a-zA-Z0-9_:.-]*)\s*\)$/i);
		if (m) { out += String(element?.getAttribute?.(m[1]) ?? ""); continue; }
		m = part.match(/^counter\(\s*([a-zA-Z_-][a-zA-Z0-9_-]*)\s*(?:,\s*[a-zA-Z-]+)?\s*\)$/i);
		if (m) { out += String(readCounter(element, m[1])); continue; }
		m = part.match(/^counters\(\s*([a-zA-Z_-][a-zA-Z0-9_-]*)\s*,\s*(["'])(.*?)\2\s*\)$/i);
		if (m) { out += String(readCounter(element, m[1])); continue; }
		if (/^url\(/i.test(part)) continue;
	}
	return out;
}

function readCounter(element, name) {
	const counters = element?.ownerDocument?.__merkavaCounters;
	if (counters && Object.prototype.hasOwnProperty.call(counters, name)) return counters[name];
	return 0;
}

/** Parses "name [value] ..." counter lists into [{ name, value|null }]. */
function parseCounterList(text) {
	const tokens = String(text || "").split(/\s+/).filter(Boolean);
	const out = [];
	for (let i = 0; i < tokens.length; i += 1) {
		const name = tokens[i];
		if (!/^[a-zA-Z_-][a-zA-Z0-9_-]*$/.test(name)) continue;
		let value = null;
		if (i + 1 < tokens.length && /^-?\d+$/.test(tokens[i + 1])) {
			value = parseInt(tokens[i + 1], 10);
			i += 1;
		}
		out.push({ name, value });
	}
	return out;
}

/** Applies counter-increment / counter-reset declarations for an element. */
function applyCounters(element, style = {}) {
	const doc = element?.ownerDocument;
	if (!doc) return;
	doc.__merkavaCounters = doc.__merkavaCounters || {};
	const counters = doc.__merkavaCounters;
	const reset = String(style["counter-reset"] || "").trim();
	if (reset && reset.toLowerCase() !== "none") {
		for (const { name, value } of parseCounterList(reset)) {
			counters[name] = value == null ? 0 : value;
		}
	}
	const increment = String(style["counter-increment"] || "").trim();
	if (increment && increment.toLowerCase() !== "none") {
		for (const { name, value } of parseCounterList(increment)) {
			counters[name] = (counters[name] || 0) + (value == null ? 1 : value);
		}
	}
}

/**
 * Collects author rules targeting ::pseudo of `element`.
 * Returns [{ declarations, specificity, order }] for the pseudo-element.
 */
function matchPseudoRules(element, pseudoName, rules) {
	const name = String(pseudoName || "").toLowerCase();
	if (!isPseudoElementName(name)) return [];
	const out = [];
	for (const rule of rules || []) {
		const split = splitPseudoSelector(rule.selector);
		if (split.pseudo !== name) continue;
		let matches = false;
		try {
			matches = split.base === "*" || matchesCssSelector(element, split.base);
		} catch (err) {
			matches = false;
		}
		if (matches) out.push(rule);
	}
	return out;
}

/**
 * Builds a generated box descriptor for ::before/::after/::marker.
 * `pseudoStyle` is the cascaded+resolved style object for the pseudo-element.
 * Returns null when no box should be generated.
 */
function generatedBoxSpec(element, pseudoName, pseudoStyle = {}) {
	const name = String(pseudoName || "").toLowerCase();
	if (!BOX_GENERATING.has(name)) return null;
	const content = resolveContent(pseudoStyle.content, element);
	if (content == null) return null;
	const display = String(pseudoStyle.display || "inline").trim().toLowerCase();
	return Object.freeze({
		content,
		display,
		pseudo: name,
		style: Object.freeze({ ...pseudoStyle })
	});
}

/**
 * Convenience: for an element + rule list + cascade helper, returns the
 * generated box specs for ::before, ::after, and ::marker.
 * `cascadeFor` is a function (element, rules) => cascaded declarations object.
 */
function generatedBoxesFor(element, rules, cascadeFor) {
	const out = [];
	for (const name of ["before", "after", "marker"]) {
		const matched = matchPseudoRules(element, name, rules);
		if (!matched.length) continue;
	 const cascaded = cascadeFor ? cascadeFor(element, matched) : {};
		const spec = generatedBoxSpec(element, name, cascaded);
		if (spec) out.push(spec);
	}
	return out;
}

const AwtsExports = {
	applyCounters,
	generatedBoxSpec,
	generatedBoxesFor,
	isPseudoElementName,
	matchPseudoRules,
	resolveContent,
	splitPseudoSelector
};
if (typeof module === "object" && module.exports) {
	module.exports = AwtsExports;
} else {
	globalThis.Merkava = globalThis.Merkava || {};
	Object.assign(globalThis.Merkava, AwtsExports);
}
}
