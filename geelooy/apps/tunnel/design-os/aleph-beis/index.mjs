//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Public API for the Aleph-Beis design principles.
 * @description Two ways to work with the letters:
 *
 *   1. checkDesign(src) — verify an existing design. Parses, validates and
 *      solves the design's constraint source, then runs all 22 letter
 *      verifiers over the solved values. Returns per-letter results plus
 *      an overall score.
 *
 *   2. applyLetters(keys) / designWithLetters(src, keys) — build with the
 *      letters. Returns the letters' DSL source (namespaced declarations
 *      plus checkable inequalities) for inclusion in a design program, or
 *      solves the combined program directly.
 *
 * Composition rule: the designer's own source comes FIRST. The solver gives
 * the first '=' definition the word, so letter lines only fill what the
 * design leaves unsaid; their inequalities still verify what is said.
 */

export { LETTERS, getLetter, listLetters } from "./letters.mjs";
export { CHECKS } from "./checks.mjs";

import { parse } from "../constraints/parser.mjs";
import { validate } from "../constraints/validator.mjs";
import { solve, valuesToObject } from "../constraints/solver.mjs";
import { LETTERS, getLetter } from "./letters.mjs";
import { CHECKS } from "./checks.mjs";

/** DSL source of a single letter's principles. */
export function letterSource(key) {
	const letter = getLetter(key);
	if (!letter) throw new Error(`Unknown letter: ${key}`);
	return `// ${letter.hebrew} ${letter.name} — ${letter.principle}\n${letter.constraints}`;
}

/** Combined DSL source for several letters, in aleph-beis order. */
export function applyLetters(keys) {
	const ordered = LETTERS.filter((l) => keys.includes(l.key));
	if (ordered.length !== keys.length) {
		const bad = keys.filter((k) => !getLetter(k));
		throw new Error(`Unknown letters: ${bad.join(", ")}`);
	}
	return ordered.map((l) => letterSource(l.key)).join("\n\n");
}

/** DSL source of all 22 letters. */
export function applyAllLetters() {
	return applyLetters(LETTERS.map((l) => l.key));
}

/**
 * Solves a design program, then checks it against every letter.
 * @param {string} src Constraint DSL source of the design.
 * @returns {{ok, errors, values, letters, score}}
 *   letters: [{key, hebrew, name, principle, pass, applicable, detail}]
 *   score: {passed, applicable, ratio} over applicable letters only.
 */
export function checkDesign(src) {
	let ast;
	try {
		ast = parse(src);
	} catch (e) {
		return { ok: false, errors: [`Parse error: ${e.message}`], values: {}, letters: [], score: null };
	}
	const validation = validate(ast);
	if (!validation.ok) {
		return {
			ok: false,
			errors: validation.errors.map((e) => `Line ${e.line ?? "?"}: ${e.message}`),
			values: {},
			letters: [],
			score: null,
		};
	}
	const solution = solve(ast);
	const values = valuesToObject(solution.values);
	const letters = LETTERS.map((l) => {
		const r = CHECKS[l.key](values);
		return {
			key: l.key,
			hebrew: l.hebrew,
			name: l.name,
			principle: l.principle,
			pass: r.pass,
			applicable: r.applicable,
			detail: r.detail,
		};
	});
	const applicable = letters.filter((l) => l.applicable);
	const passed = applicable.filter((l) => l.pass);
	return {
		ok: solution.ok,
		errors: solution.errors,
		values,
		letters,
		score: {
			passed: passed.length,
			applicable: applicable.length,
			ratio: applicable.length ? passed.length / applicable.length : 1,
		},
	};
}

/**
 * Solves a design program with letter principles appended (design first,
 * so the designer's definitions win; letters fill gaps and verify).
 */
export function designWithLetters(src, keys) {
	const combined = `${src.trim()}\n\n${applyLetters(keys)}`;
	let ast;
	try {
		ast = parse(combined);
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
		return { ok: false, values: valuesToObject(solution.values), errors: solution.errors, ast };
	}
	return { ok: true, values: valuesToObject(solution.values), errors: [], ast };
}

/** One-line summary of every letter and its principle. */
export function describeLetters() {
	return LETTERS.map(
		(l) => `${l.hebrew} ${l.name} (${l.gematria}): ${l.principle} — ${l.principleDetail}`
	).join("\n");
}
