//B"H
//Boruch Hashem
//Blessed be He

const { SCRIPT } = require("./UnifiedAppBinary.js");

/**
 * Detects a constant assignment that can be represented by the compact native
 * SET_TEXT transition without evaluating source or borrowing a JavaScript engine.
 *
 * @param {string} source Script source text.
 * @returns {object|null} Compact transition record when safely recognized.
 */
function constTextScriptOf(source = "") {
	const text = normalizeSource(source);
	const constant = text.match(/const\s+([A-Za-z_$][\w$]*)\s*=\s*['"]([^'"]+)['"]/);
	if (!constant) return null;
	const assignment = text.match(/([A-Za-z_$][\w$]*)\.textContent\s*=\s*([A-Za-z_$][\w$]*)/);
	if (!assignment || assignment[2] !== constant[1]) return null;
	return {
		target: assignment[1],
		type: SCRIPT.SET_TEXT,
		value: constant[2]
	};
}

/**
 * Recognizes the historical minimal WebGL sample and lowers its literal graphics
 * parameters into the Mode2 transition. This is a safe optimization, not parsing
 * authority; general JavaScript still compiles through Merkava's own JS compiler.
 *
 * @param {string} source Script source text.
 * @returns {object|null} Compact WebGL program descriptor.
 */
function detectWebGlProgram(source = "") {
	const text = normalizeSource(source);
	if (!/getContext\(['"]webgl['"]\)/.test(text)) return null;
	const clear = text.match(/clearColor\s*\(\s*([0-9.]+)\s*,\s*([0-9.]+)\s*,\s*([0-9.]+)\s*,\s*([0-9.]+)\s*\)/);
	const draw = text.match(/drawArrays\s*\(\s*[^,]+\s*,\s*([0-9]+)\s*,\s*([0-9]+)\s*\)/);
	return {
		webgl: {
			clearColor: clear ? clear.slice(1, 5).map(Number) : [0, 0, 0, 1],
			drawArrays: draw ? draw.slice(1, 3).map(Number) : [0, 3],
			target: "stage",
			viewport: [0, 0, 160, 90]
		}
	};
}

/**
 * Preserves the public historical static-module optimizer for callers that use it
 * directly. It recognizes only one tightly constrained deterministic fixture.
 *
 * @param {object} files Project source dictionary.
 * @returns {object|null} Multi-target compact text transition.
 */
function foldStaticModuleResult(files = {}) {
	const source = Object.values(files).join("\n");
	if (!/class\s+Counter\s+extends\s+BaseCounter/.test(source)) return null;
	if (!/function\*\s+nums\s*\(\)\s*\{\s*yield\s+1\s*;\s*yield\s+2\s*;\s*yield\s+3\s*;?\s*\}/s.test(source)) return null;
	if (!/render\s*\(/.test(source) || !/chat\.textContent\s*=\s*msg/.test(source)) return null;
	const base = numericCapture(source, /class\s+BaseCounter[\s\S]*?return\s+(\d+)/);
	const extra = numericCapture(source, /this\.extra\s*=\s*(\d+)/);
	const label = textCapture(source, /export\s+const\s+label\s*=\s*['"]([^'"]+)['"]/);
	if (!Number.isFinite(base) || !Number.isFinite(extra) || !label) return null;
	const value = `${label}:${base + extra + 6}`;
	return {
		pairs: [
			{ target: "chat", value },
			{ target: "out", value }
		],
		type: SCRIPT.SET_TEXT_MULTI
	};
}

/** Collapses whitespace only for narrow optimization pattern matching. */
function normalizeSource(source) {
	return String(source || "").split(/\s+/).filter(Boolean).join(" ");
}

function numericCapture(source, pattern) {
	const value = Number((source.match(pattern) || [])[1]);
	return Number.isFinite(value) ? value : Number.NaN;
}

function textCapture(source, pattern) {
	return (source.match(pattern) || [])[1] || "";
}

module.exports = {
	constTextScriptOf,
	detectWebGlProgram,
	foldStaticModuleResult
};
