//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file White-fire constraint language.
 * @description Design the emptiness as constraints, checked against an analyzed
 * layout. Reuses the shared Design OS parser (../constraints/parser.mjs) for
 * syntax; evaluation is white-fire-specific.
 *
 *   whitespace.ratio >= 0.4            — the void must breathe (40%+ empty)
 *   whitespace.ratio <= 0.65           — but not barren
 *   whitespace.intentionalShare >= 0.8 — almost all space must be designed
 *   emptiness.intentional = true       — shorthand for intentionalShare >= 0.8
 *   rhythm.consistent = true           — gaps share a pulse
 *   rhythm.cv <= 0.35                 — tight rhythm
 *   pause(title, body) >= half-rest   — the pause between two elements
 *   pause(s1, s2) = half-rest         — exact rest
 *
 * Rests order: eighth-rest < quarter-rest < half-rest < whole-rest < breve-rest.
 */

import { parse, astToString } from "../constraints/parser.mjs";
import { restFor, restRank, RESTS } from "./rhythm.mjs";
import { elementById } from "./layout.mjs";

/** Preset bundles of white-fire constraints. */
export const WHITEFIRE_PRESETS = Object.freeze({
	sefer: `
whitespace.ratio >= 0.4
whitespace.ratio <= 0.65
whitespace.intentionalShare >= 0.8
rhythm.consistent = true
`.trim(),
	strict: `
whitespace.ratio >= 0.4
whitespace.ratio <= 0.6
whitespace.intentionalShare >= 0.9
emptiness.intentional = true
rhythm.consistent = true
rhythm.cv <= 0.35
`.trim(),
});

/**
 * Checks white-fire constraints against an analyzed layout.
 * @param {Object} layout Normalized layout.
 * @param {Object} analysis From analyze(): {measurements, classification, rhythm}.
 * @param {string} src Constraint DSL source.
 * @returns {{ok:boolean, results:Array<{source,ok,actual,expected,message}>, error?:string}}
 */
export function checkConstraints(layout, analysis, src) {
	let program;
	try {
		program = parse(src);
	} catch (e) {
		return { ok: false, results: [], error: `Parse error: ${e.message}` };
	}
	const values = seedValues(analysis);
	const results = program.statements.map((stmt) => checkStatement(layout, values, stmt));
	return { ok: results.every((r) => r.ok), results };
}

function seedValues(analysis) {
	const m = analysis.measurements;
	const c = analysis.classification;
	const r = analysis.rhythm;
	return {
		"whitespace.ratio": { kind: "number", value: m.ratio },
		"whitespace.intentionalShare": { kind: "number", value: c.intentionalShare },
		"whitespace.accidentalPx": { kind: "number", value: c.accidentalPx },
		"whitespace.intentionalPx": { kind: "number", value: c.intentionalPx },
		"emptiness.intentional": { kind: "boolean", value: c.intentionalShare >= 0.8 },
		"rhythm.consistent": { kind: "boolean", value: r.consistent },
		"rhythm.cv": { kind: "number", value: r.cv },
		"rhythm.alignedShare": { kind: "number", value: r.alignedShare },
	};
}

function checkStatement(layout, values, stmt) {
	const source = astToString(stmt);
	try {
		let actual;
		if (stmt.subject.type === "call") {
			actual = evalCall(layout, stmt.subject);
		} else if (stmt.subject.type === "path") {
			const key = stmt.subject.parts.join(".");
			if (!(key in values)) {
				throw new Error(`unknown white-fire property '${key}'`);
			}
			actual = values[key];
		} else {
			throw new Error("constraint subject must be a property or pause()");
		}
		const expected = evalValueNode(stmt.value);
		const ok = compareWF(actual, stmt.op, expected);
		return {
			source,
			ok,
			actual: wfToString(actual),
			expected: wfToString(expected),
			message: ok
				? "satisfied"
				: `violated: ${wfToString(actual)} ${stmt.op} ${wfToString(expected)}`,
		};
	} catch (e) {
		return { source, ok: false, actual: "?", expected: "?", message: `error: ${e.message}` };
	}
}

/** pause(a, b) → the rest between two elements. */
function evalCall(layout, node) {
	if (node.name !== "pause") {
		throw new Error(`unknown white-fire function '${node.name}' (only pause() is supported)`);
	}
	if (node.args.length !== 2) {
		throw new Error(`pause() needs exactly 2 element ids, got ${node.args.length}`);
	}
	const ids = node.args.map((a) => {
		if (a.type !== "path" || a.parts.length !== 1) {
			throw new Error("pause() arguments must be plain element ids");
		}
		return a.parts[0];
	});
	const a = elementById(layout, ids[0]);
	const b = elementById(layout, ids[1]);
	const gap = Math.max(0, b.box.y - (a.box.y + a.box.h));
	return { kind: "rest", name: restFor(gap, layout.baseUnit).rest, px: gap };
}

function evalValueNode(node) {
	// The shared parser reads hyphenated rest names (half-rest) as binary
	// subtraction of two identifiers: (half - rest). Reconstitute them here.
	if (
		node.type === "binary" && node.op === "-" &&
		node.left.type === "path" && node.left.parts.length === 1 &&
		node.right.type === "path" && node.right.parts.length === 1
	) {
		return evalKeyword(`${node.left.parts[0]}-${node.right.parts[0]}`);
	}
	switch (node.type) {
		case "number":
			return { kind: "number", value: node.value };
		case "dimension":
			return { kind: "dimension", value: node.value, unit: node.unit };
		case "keyword": {
			return evalKeyword(node.value);
		}
		default:
			throw new Error(`unsupported value in white-fire constraint (got ${node.type})`);
	}
}

/** Interprets a keyword literal: booleans and rest names. */
function evalKeyword(word) {
	if (word === "true" || word === "false") {
		return { kind: "boolean", value: word === "true" };
	}
	if (word in RESTS) return { kind: "rest", name: word };
	throw new Error(`unknown keyword '${word}' (expected true/false or a rest name)`);
}

function compareWF(actual, op, expected) {
	if (actual.kind === "number" && (expected.kind === "number" || expected.kind === "dimension")) {
		return cmpNum(actual.value, op, expected.value);
	}
	if (actual.kind === "boolean" && expected.kind === "boolean") {
		if (op !== "=" && op !== "==" && op !== "!=") {
			throw new Error(`operator '${op}' not supported for booleans`);
		}
		return op === "!=" ? actual.value !== expected.value : actual.value === expected.value;
	}
	if (actual.kind === "rest" && expected.kind === "rest") {
		return cmpNum(restRank(actual.name) - restRank(expected.name), op, 0);
	}
	throw new Error(`cannot compare ${actual.kind} with ${expected.kind}`);
}

function cmpNum(d, op, target) {
	switch (op) {
		case ">=": return d >= target;
		case "<=": return d <= target;
		case ">": return d > target;
		case "<": return d < target;
		case "=":
		case "==": return d === target;
		case "!=": return d !== target;
		default: throw new Error(`unknown operator '${op}'`);
	}
}

function wfToString(v) {
	switch (v.kind) {
		case "number": return `${Math.round(v.value * 1000) / 1000}`;
		case "dimension": return `${v.value}${v.unit}`;
		case "boolean": return v.value ? "true" : "false";
		case "rest": return v.px !== undefined ? `${v.name} (${v.px}px)` : v.name;
		default: return String(v.value ?? v.kind);
	}
}
