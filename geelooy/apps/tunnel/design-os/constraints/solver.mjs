//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Solver for the Awtsmoos Design OS constraint language.
 * @description Takes a validated constraint program and finds concrete values for every
 * target. Strategy: topological resolution of '=' assignments in dependency order,
 * then verification of inequality/range constraints against the resolved values.
 *
 * Values:
 *   number    {kind:'number', value}
 *   dimension {kind:'dimension', value, unit}
 *   color     {kind:'color', hex, rgb:{r,g,b}}
 *   string    {kind:'string', value}
 *   keyword   {kind:'keyword', value}
 *   position  {kind:'position', value}  (result of below()/above()/beside())
 *
 * Built-in functions: contrast, below, above, beside, darken, lighten, mix,
 * min, max, clamp, abs, round, luminance.
 */

import { astToString } from "./parser.mjs";

/** Parses #rgb or #rrggbb into {r,g,b} 0-255. */
export function hexToRgb(hex) {
	let h = hex.replace("#", "");
	if (h.length === 3) h = h.split("").map((c) => c + c).join("");
	const n = parseInt(h, 16);
	return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

/** Formats {r,g,b} as #rrggbb. */
export function rgbToHex({ r, g, b }) {
	const c = (v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0");
	return `#${c(r)}${c(g)}${c(b)}`;
}

/** WCAG relative luminance of an sRGB color. */
export function luminanceOf({ r, g, b }) {
	const f = (v) => {
		const s = v / 255;
		return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
	};
	return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

/** WCAG contrast ratio between two sRGB colors (1 to 21). */
export function contrastRatio(rgb1, rgb2) {
	const l1 = luminanceOf(rgb1);
	const l2 = luminanceOf(rgb2);
	const hi = Math.max(l1, l2);
	const lo = Math.min(l1, l2);
	return (hi + 0.05) / (lo + 0.05);
}

function makeColor(hex) {
	const h = hex.toLowerCase();
	return { kind: "color", hex: h, rgb: hexToRgb(h) };
}

function num(v) { return { kind: "number", value: v }; }

/** Built-in function implementations. Args are already-evaluated values. */
const BUILTINS = {
	contrast([a, b]) {
		requireKind(a, "color", "contrast");
		requireKind(b, "color", "contrast");
		return num(contrastRatio(a.rgb, b.rgb));
	},
	luminance([a]) {
		requireKind(a, "color", "luminance");
		return num(luminanceOf(a.rgb));
	},
	darken([color, amount]) {
		requireKind(color, "color", "darken");
		const f = 1 - numVal(amount, "darken") / 100;
		return makeColor(rgbToHex({
			r: color.rgb.r * f, g: color.rgb.g * f, b: color.rgb.b * f,
		}));
	},
	lighten([color, amount]) {
		requireKind(color, "color", "lighten");
		const f = numVal(amount, "lighten") / 100;
		return makeColor(rgbToHex({
			r: color.rgb.r + (255 - color.rgb.r) * f,
			g: color.rgb.g + (255 - color.rgb.g) * f,
			b: color.rgb.b + (255 - color.rgb.b) * f,
		}));
	},
	mix([a, b, t]) {
		requireKind(a, "color", "mix");
		requireKind(b, "color", "mix");
		const w = numVal(t, "mix") / 100;
		return makeColor(rgbToHex({
			r: a.rgb.r * (1 - w) + b.rgb.r * w,
			g: a.rgb.g * (1 - w) + b.rgb.g * w,
			b: a.rgb.b * (1 - w) + b.rgb.b * w,
		}));
	},
	min([a, b]) { return num(Math.min(numVal(a, "min"), numVal(b, "min"))); },
	max([a, b]) { return num(Math.max(numVal(a, "max"), numVal(b, "max"))); },
	clamp([v, lo, hi]) {
		return num(Math.min(Math.max(numVal(v, "clamp"), numVal(lo, "clamp")), numVal(hi, "clamp")));
	},
	abs([a]) { return num(Math.abs(numVal(a, "abs"))); },
	round([a]) { return num(Math.round(numVal(a, "round"))); },
	below([target]) {
		return { kind: "position", value: `below(${valueToString(target)})` };
	},
	above([target]) {
		return { kind: "position", value: `above(${valueToString(target)})` };
	},
	beside([target]) {
		return { kind: "position", value: `beside(${valueToString(target)})` };
	},
};

function requireKind(v, kind, fn) {
	if (!v || v.kind !== kind) {
		throw new Error(`${fn}() expects ${kind}, got ${v ? v.kind : "nothing"}`);
	}
}

function numVal(v, fn) {
	if (!v) throw new Error(`${fn}() got nothing, expected number`);
	if (v.kind === "number") return v.value;
	if (v.kind === "dimension") return v.value;
	throw new Error(`${fn}() expects number, got ${v.kind}`);
}

function valueToString(v) {
	switch (v.kind) {
		case "number": return String(round2(v.value));
		case "dimension": return `${round2(v.value)}${v.unit}`;
		case "color": return v.hex;
		case "string": return JSON.stringify(v.value);
		case "keyword": return v.value;
		case "position": return v.value;
		default: return "?";
	}
}

function round2(n) {
	return Math.round(n * 100) / 100;
}

/**
 * Solves a validated program.
 * @param {{type:"program",statements:Array}} program Validated AST.
 * @returns {{ok:boolean, values:Map<string,object>, errors:Array<string>}}
 *   values maps dotted target path -> solved value object.
 */
export function solve(program) {
	const s = new Solver();
	return s.run(program);
}

class Solver {
	constructor() {
		this.values = new Map(); // dotted path -> value
		this.errors = [];
	}

	run(program) {
		// 1. Collect '=' definitions and check constraints
		const definitions = new Map(); // key -> value AST (first '=' wins; validator caught conflicts)
		const checks = [];
		for (const stmt of program.statements) {
			if (stmt.subject && stmt.subject.type === "call") {
				checks.push(stmt);
				continue;
			}
			const target = stmt.target || stmt.subject;
			const key = target.parts.join(".");
			if (stmt.op === "=" || stmt.op === "==") {
				if (!definitions.has(key)) definitions.set(key, { node: stmt.value, line: stmt.line });
			} else {
				checks.push(stmt);
			}
		}

		// 2. Resolve definitions in dependency order
		const order = this.topoOrder(definitions);
		if (order === null) {
			this.errors.push("Circular dependency between definitions");
			return this.result(false);
		}
		for (const key of order) {
			const def = definitions.get(key);
			try {
				const val = this.evalExpr(def.node);
				this.values.set(key, val);
			} catch (e) {
				this.errors.push(`Cannot resolve '${key}': ${e.message} (line ${def.line})`);
			}
		}

		// 3. Verify inequality/range checks
		for (const stmt of checks) {
			this.verifyCheck(stmt);
		}

		return this.result(this.errors.length === 0);
	}

	result(ok) {
		return { ok, values: this.values, errors: this.errors };
	}

	/** Topological order of definition keys by path dependency. Null on cycle. */
	topoOrder(definitions) {
		const deps = new Map(); // key -> Set of keys it depends on
		for (const [key, def] of definitions) {
			const refs = new Set();
			collectPathRefs(def.node, refs);
			refs.delete(key);
			// Only depend on keys that are actually defined (others are external inputs)
			const relevant = new Set([...refs].filter((r) => definitions.has(r)));
			deps.set(key, relevant);
		}
		// Kahn's algorithm
		const order = [];
		const noDeps = [...deps.keys()].filter((k) => deps.get(k).size === 0);
		const queue = [...noDeps];
		const remaining = new Map(deps);
		while (queue.length) {
			const k = queue.shift();
			order.push(k);
			remaining.delete(k);
			for (const [other, d] of remaining) {
				if (d.has(k)) {
					d.delete(k);
					if (d.size === 0) queue.push(other);
				}
			}
		}
		return remaining.size === 0 ? order : null;
	}

	verifyCheck(stmt) {
		// Call subject: evaluate the call, compare against RHS.
		if (stmt.subject && stmt.subject.type === "call") {
			const label = astToString(stmt.subject);
			try {
				const lhs = this.evalExpr(stmt.subject);
				const rhs = this.evalExpr(stmt.value);
				this.assertComparison(label, lhs, stmt.op, rhs, stmt.line);
			} catch (e) {
				this.errors.push(`Check on '${label}' failed: ${e.message} (line ${stmt.line})`);
			}
			return;
		}
		const target = stmt.target || stmt.subject;
		const key = target.parts.join(".");
		const current = this.values.get(key);
		try {
			if (stmt.op === "in") {
				const mn = this.evalExpr(stmt.value.min);
				const mx = this.evalExpr(stmt.value.max);
				const lo = numVal(mn, "in");
				const hi = numVal(mx, "in");
				if (current === undefined) {
					// Unconstrained target: record the range as its domain (informational)
					return;
				}
				const v = numVal(current, "in");
				if (v < lo || v > hi) {
					this.errors.push(
						`'${key}' = ${valueToString(current)} violates in [${lo}, ${hi}] (line ${stmt.line})`
					);
				}
				return;
			}
			const rhs = this.evalExpr(stmt.value);
			if (current === undefined) return; // nothing to check against
			this.assertComparison(key, current, stmt.op, rhs, stmt.line);
		} catch (e) {
			this.errors.push(`Check on '${key}' failed: ${e.message} (line ${stmt.line})`);
		}
	}

	/** Asserts lhs op rhs; records an error when the comparison fails. */
	assertComparison(label, lhs, op, rhs, line) {
		const cmp = compareValues(lhs, rhs);
		if (cmp === null) {
			this.errors.push(`Cannot compare ${lhs.kind} with ${rhs.kind} for '${label}' (line ${line})`);
			return;
		}
		const ok = {
			">=": cmp >= 0, "<=": cmp <= 0, ">": cmp > 0, "<": cmp < 0,
			"==": cmp === 0, "!=": cmp !== 0,
		}[op];
		if (!ok) {
			this.errors.push(
				`'${label}' = ${valueToString(lhs)} violates ${op} ${valueToString(rhs)} (line ${line})`
			);
		}
	}

	evalExpr(node) {
		switch (node.type) {
			case "number": return num(node.value);
			case "dimension": return { kind: "dimension", value: node.value, unit: node.unit };
			case "color": return makeColor(node.hex);
			case "string": return { kind: "string", value: node.value };
			case "keyword": return { kind: "keyword", value: node.value };
			case "path": {
				const key = node.parts.join(".");
				const v = this.values.get(key);
				if (v === undefined) {
					throw new Error(`unresolved reference '${key}'`);
				}
				return v;
			}
			case "binary": {
				const l = this.evalExpr(node.left);
				const r = this.evalExpr(node.right);
				return evalBinary(node.op, l, r);
			}
			case "unary": {
				const v = this.evalExpr(node.operand);
				if (node.op === "-") {
					if (v.kind === "number") return num(-v.value);
					if (v.kind === "dimension") return { ...v, value: -v.value };
					throw new Error(`cannot negate ${v.kind}`);
				}
				throw new Error(`unknown unary ${node.op}`);
			}
			case "call": {
				const fn = BUILTINS[node.name];
				if (!fn) throw new Error(`unknown function '${node.name}'`);
				// Position functions accept symbolic block references:
				// below(hebrew) works even when 'hebrew' has no single value.
				if (["below", "above", "beside"].includes(node.name) && node.args.length === 1) {
					const a = node.args[0];
					if (a.type === "path") {
						return fn([{ kind: "keyword", value: a.parts.join(".") }]);
					}
				}
				const args = node.args.map((a) => this.evalExpr(a));
				return fn(args);
			}
			case "range":
				throw new Error("range cannot appear in an expression position");
			default:
				throw new Error(`unknown node ${node.type}`);
		}
	}
}

function evalBinary(op, l, r) {
	// dimension op dimension with same unit, or dimension op number
	const lv = numVal(l, op);
	const rv = numVal(r, op);
	let result;
	switch (op) {
		case "+": result = lv + rv; break;
		case "-": result = lv - rv; break;
		case "*": result = lv * rv; break;
		case "/":
			if (rv === 0) throw new Error("division by zero");
			result = lv / rv;
			break;
		default: throw new Error(`unknown operator ${op}`);
	}
	// Preserve dimension unit when one side is a dimension and op is +/-
	if ((l.kind === "dimension" || r.kind === "dimension") && (op === "+" || op === "-")) {
		const unit = l.kind === "dimension" ? l.unit : r.unit;
		if (l.kind === "dimension" && r.kind === "dimension" && l.unit !== r.unit) {
			throw new Error(`unit mismatch: ${l.unit} vs ${r.unit}`);
		}
		return { kind: "dimension", value: result, unit };
	}
	if (l.kind === "dimension" && op === "*") {
		return { kind: "dimension", value: result, unit: l.unit };
	}
	if (r.kind === "dimension" && op === "*") {
		return { kind: "dimension", value: result, unit: r.unit };
	}
	if (l.kind === "dimension" && op === "/" && r.kind === "number") {
		return { kind: "dimension", value: result, unit: l.unit };
	}
	return num(result);
}

/**
 * Compares two values. Returns negative/0/positive, or null if incomparable.
 * Numbers and dimensions (same unit) compare numerically; colors/keywords/strings
 * compare by canonical string for ==/!= only.
 */
function compareValues(a, b) {
	if ((a.kind === "number" || a.kind === "dimension") &&
		(b.kind === "number" || b.kind === "dimension")) {
		if (a.kind === "dimension" && b.kind === "dimension" && a.unit !== b.unit) return null;
		const av = a.kind === "dimension" ? a.value : a.value;
		const bv = b.kind === "dimension" ? b.value : b.value;
		return av - bv;
	}
	// Equality-only comparison for other kinds
	const sa = valueToString(a);
	const sb = valueToString(b);
	if (a.kind === b.kind) return sa === sb ? 0 : (sa < sb ? -1 : 1);
	return null;
}

/** Collects dotted-path references inside an expression into `out` (Set). */
function collectPathRefs(node, out) {
	if (!node) return;
	if (node.type === "path") {
		out.add(node.parts.join("."));
		return;
	}
	if (node.type === "binary") { collectPathRefs(node.left, out); collectPathRefs(node.right, out); }
	else if (node.type === "unary") collectPathRefs(node.operand, out);
	else if (node.type === "call") node.args.forEach((a) => collectPathRefs(a, out));
	else if (node.type === "range") { collectPathRefs(node.min, out); collectPathRefs(node.max, out); }
}

/** Formats a solved value for display. */
export function formatValue(v) {
	return valueToString(v);
}

/** Converts solved values map to a plain object of dotted-path -> string. */
export function valuesToObject(values) {
	const obj = {};
	for (const [k, v] of values) obj[k] = valueToString(v);
	return obj;
}
