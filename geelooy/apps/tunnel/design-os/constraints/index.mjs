//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Main entry for the Awtsmoos Design OS constraint language.
 * @description Pipeline: parse → validate → solve. Designers declare intent as
 * mathematical constraints; the system finds concrete values that satisfy them.
 *
 * Example:
 *   import { design } from "./index.mjs";
 *   const result = design(`
 *     body.fontSize = 16px
 *     title.fontSize = 4 * body.fontSize
 *     contrast(title.color, title.background) >= 7.0
 *   `);
 *   // result.ok === true, result.values has title.fontSize = 64px, etc.
 */

export { parse, tokenize, astToString } from "./parser.mjs";
export { validate, KNOWN_FUNCTIONS } from "./validator.mjs";
export { solve, formatValue, valuesToObject, hexToRgb, rgbToHex, luminanceOf, contrastRatio } from "./solver.mjs";
export { LIBRARY, CATEGORIES, BUNDLE_COUNT, getBundle, listBundles, describeBundles } from "./library.mjs";

import { parse } from "./parser.mjs";
import { validate } from "./validator.mjs";
import { solve, valuesToObject } from "./solver.mjs";
import { getBundle } from "./library.mjs";

/**
 * Full pipeline: parse, validate, solve.
 * @param {string} src Constraint DSL source.
 * @returns {{ok:boolean, values:Object, errors:Array<string>, ast:Object}}
 */
export function design(src) {
	let ast;
	try {
		ast = parse(src);
	} catch (e) {
		return { ok: false, values: {}, errors: [`Parse error: ${e.message}`], ast: null };
	}
	const validation = validate(ast);
	if (!validation.ok) {
		return {
			ok: false,
			values: {},
			errors: validation.errors.map((e) => `Line ${e.line ?? "?"}: ${e.message}`),
			ast,
		};
	}
	const solution = solve(ast);
	if (!solution.ok) {
		return { ok: false, values: {}, errors: solution.errors, ast };
	}
	return { ok: true, values: valuesToObject(solution.values), errors: [], ast };
}

/**
 * Builds a program from library bundles plus extra source, then designs it.
 * @param {Array<string>} bundleNames Library bundle names to include.
 * @param {string} extra Additional DSL source (may be empty).
 * @param {Object} inputs Optional pre-solved inputs: {dottedPath: valueObject}.
 *   Value objects use solver value shapes, e.g. {kind:'color',hex:'#2b2118',rgb:{r,g,b}}.
 * @returns Same as design().
 */
export function designWithLibrary(bundleNames, extra = "", inputs = {}) {
	const parts = bundleNames.map(getBundle);
	if (extra.trim()) parts.push(extra.trim());
	// Inputs are injected as a preamble of '=' assignments via a synthetic program.
	// We handle them by pre-seeding: parse combined source, then solve with seed.
	const src = parts.join("\n");
	let ast;
	try {
		ast = parse(src);
	} catch (e) {
		return { ok: false, values: {}, errors: [`Parse error: ${e.message}`], ast: null };
	}
	const validation = validate(ast);
	if (!validation.ok) {
		return {
			ok: false, values: {},
			errors: validation.errors.map((e) => `Line ${e.line ?? "?"}: ${e.message}`),
			ast,
		};
	}
	// Seed the solver by prepending synthetic '=' constraints for inputs.
	const { solve: rawSolve } = { solve: null }; // placeholder, replaced below
	void rawSolve;
	return solveWithSeed(ast, inputs);
}

// Internal: solve with pre-seeded values.
import { solve as _solve } from "./solver.mjs";

function solveWithSeed(ast, inputs) {
	// Clone AST and prepend seed assignments as constraints with literal values.
	const seedStmts = Object.entries(inputs).map(([path, v]) => ({
		type: "constraint",
		target: { type: "path", parts: path.split(".") },
		op: "=",
		value: valueToAst(v),
		line: 0,
	}));
	const seeded = { type: "program", statements: [...seedStmts, ...ast.statements] };
	const validation = validate(seeded);
	if (!validation.ok) {
		return {
			ok: false, values: {},
			errors: validation.errors.map((e) => `Line ${e.line ?? "?"}: ${e.message}`),
			ast: seeded,
		};
	}
	const solution = _solve(seeded);
	if (!solution.ok) {
		return { ok: false, values: {}, errors: solution.errors, ast: seeded };
	}
	return { ok: true, values: valuesToObject(solution.values), errors: [], ast: seeded };
}

/** Converts a solver value object back into an AST literal. */
function valueToAst(v) {
	switch (v.kind) {
		case "number": return { type: "number", value: v.value };
		case "dimension": return { type: "dimension", value: v.value, unit: v.unit };
		case "color": return { type: "color", hex: v.hex };
		case "string": return { type: "string", value: v.value };
		case "keyword": return { type: "keyword", value: v.value };
		case "position": return { type: "string", value: v.value };
		default: throw new Error(`Cannot convert value kind '${v.kind}' to AST`);
	}
}

/**
 * Demo: "title 4x body, dark on cream" → constraints → solved values.
 * @returns {{ok:boolean, values:Object, errors:Array<string>}}
 */
export function demo() {
	const src = `
// Yaakov's sefer spec: 4x text, dark brown ink on warm cream
body.fontSize = 16px
title.fontSize = 4 * body.fontSize
hebrew.fontSize = 4 * body.fontSize
sefer.background = #fffdf6
sefer.color = #2b2118
title.color = sefer.color
title.background = sefer.background
contrast(title.color, title.background) >= 7.0
english.fontSize = 0.9 * hebrew.fontSize
english.position = below(hebrew)
hebrew.direction = rtl
layout.width in [375, 1920]
`.trim();
	return design(src);
}
