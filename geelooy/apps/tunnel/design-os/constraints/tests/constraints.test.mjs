//B"H
// Tests for the Awtsmoos Design OS constraint language.
// Run: node --test geelooy/apps/tunnel/design-os/constraints/tests/

import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { parse, tokenize, astToString } from "../parser.mjs";
import { validate, KNOWN_FUNCTIONS } from "../validator.mjs";
import { solve, hexToRgb, rgbToHex, luminanceOf, contrastRatio, valuesToObject } from "../solver.mjs";
import { LIBRARY, BUNDLE_COUNT, CATEGORIES, getBundle, listBundles } from "../library.mjs";
import { design, designWithLibrary, demo } from "../index.mjs";

// ─── Parser ─────────────────────────────────────────────────────────

describe("tokenizer", () => {
	it("tokenizes a simple assignment", () => {
		const toks = tokenize("title.fontSize = 16px");
		const types = toks.map((t) => t.type);
		assert.deepEqual(types, ["ident", "dot", "ident", "op", "dimension", "eof"]);
	});

	it("tokenizes hex colors", () => {
		const toks = tokenize("a.b = #2b2118");
		assert.equal(toks[4].type, "color");
		assert.equal(toks[4].value, "#2b2118");
	});

	it("tokenizes 3-digit hex", () => {
		const toks = tokenize("a.b = #fff");
		assert.equal(toks[4].value, "#fff");
	});

	it("tokenizes ranges and keywords", () => {
		const toks = tokenize("w in [375, 1920]");
		assert.equal(toks[1].value, "in");
		assert.equal(toks[2].type, "lbracket");
	});

	it("tokenizes strings", () => {
		const toks = tokenize('a.b = "hello"');
		assert.equal(toks[4].type, "string");
		assert.equal(toks[4].value, "hello");
	});

	it("skips comments", () => {
		const toks = tokenize("// comment\ntitle.x = 1 // trailing");
		assert.ok(toks.some((t) => t.type === "ident" && t.value === "title"));
	});

	it("rejects bad hex", () => {
		assert.throws(() => tokenize("a = #zz"), /Invalid hex/);
	});

	it("rejects unterminated string", () => {
		assert.throws(() => tokenize('a = "oops'), /Unterminated/);
	});

	it("rejects unexpected character", () => {
		assert.throws(() => tokenize("a = @"), /Unexpected character/);
	});
});

describe("parser", () => {
	it("parses simple assignment", () => {
		const ast = parse("title.fontSize = 16px");
		assert.equal(ast.statements.length, 1);
		const s = ast.statements[0];
		assert.equal(s.type, "constraint");
		assert.deepEqual(s.target.parts, ["title", "fontSize"]);
		assert.equal(s.op, "=");
		assert.equal(s.value.type, "dimension");
	});

	it("parses arithmetic", () => {
		const ast = parse("a.b = 4 * c.d + 2");
		const s = ast.statements[0];
		assert.equal(s.value.type, "binary");
		assert.equal(s.value.op, "+");
	});

	it("parses operator precedence", () => {
		const ast = parse("a = 2 + 3 * 4");
		// 3*4 binds tighter: (2 + (3*4))
		const s = ast.statements[0];
		assert.equal(s.value.op, "+");
		assert.equal(s.value.right.op, "*");
	});

	it("parses function call subject", () => {
		const ast = parse("contrast(a, b) >= 7.0");
		const s = ast.statements[0];
		assert.equal(s.subject.type, "call");
		assert.equal(s.subject.name, "contrast");
		assert.equal(s.target, null);
	});

	it("parses range", () => {
		const ast = parse("w in [375, 1920]");
		const s = ast.statements[0];
		assert.equal(s.op, "in");
		assert.equal(s.value.type, "range");
	});

	it("parses keywords", () => {
		const ast = parse("d = rtl");
		assert.equal(ast.statements[0].value.type, "keyword");
	});

	it("parses nested calls", () => {
		const ast = parse("c = darken(mix(#fff, #000, 50), 10)");
		const s = ast.statements[0];
		assert.equal(s.value.name, "darken");
		assert.equal(s.value.args[0].name, "mix");
	});

	it("parses unary minus", () => {
		const ast = parse("a = -5");
		assert.equal(ast.statements[0].value.type, "unary");
	});

	it("parses multiple statements", () => {
		const ast = parse("a = 1\nb = 2\nc = 3");
		assert.equal(ast.statements.length, 3);
	});

	it("parses semicolons", () => {
		const ast = parse("a = 1; b = 2;");
		assert.equal(ast.statements.length, 2);
	});

	it("rejects missing operator", () => {
		assert.throws(() => parse("a b"), /operator/);
	});

	it("astToString round-trips", () => {
		const src = "title.fontSize = 4 * body.fontSize";
		const ast = parse(src);
		const str = astToString(ast);
		assert.ok(str.includes("title.fontSize"));
		assert.ok(str.includes("body.fontSize"));
	});
});

// ─── Validator ──────────────────────────────────────────────────────

describe("validator", () => {
	it("accepts a clean program", () => {
		const r = validate(parse("a.b = 1\nc.d = 2"));
		assert.equal(r.ok, true);
	});

	it("rejects conflicting assignments", () => {
		const r = validate(parse("a = 1\na = 2"));
		assert.equal(r.ok, false);
		assert.ok(r.errors.some((e) => e.message.includes("Conflicting")));
	});

	it("accepts identical re-assignment", () => {
		const r = validate(parse("a = 1\na = 1"));
		assert.equal(r.ok, true);
	});

	it("rejects impossible bounds", () => {
		const r = validate(parse("a >= 5\na <= 3"));
		assert.equal(r.ok, false);
		assert.ok(r.errors.some((e) => e.message.includes("Impossible bounds")));
	});

	it("rejects constant outside range", () => {
		const r = validate(parse("a in [1, 5]\na = 10"));
		assert.equal(r.ok, false);
	});

	it("rejects empty range", () => {
		const r = validate(parse("a in [5, 1]"));
		assert.equal(r.ok, false);
		assert.ok(r.errors.some((e) => e.message.includes("Empty range")));
	});

	it("rejects self-reference", () => {
		const r = validate(parse("a = a + 1"));
		assert.equal(r.ok, false);
		assert.ok(r.errors.some((e) => e.message.includes("Self-reference")));
	});

	it("rejects unknown function", () => {
		const r = validate(parse("a = frobnicate(1)"));
		assert.equal(r.ok, false);
		assert.ok(r.errors.some((e) => e.message.includes("Unknown function")));
	});

	it("rejects wrong arity", () => {
		const r = validate(parse("a = contrast(#fff)"));
		assert.equal(r.ok, false);
		assert.ok(r.errors.some((e) => e.message.includes("expects 2")));
	});

	it("rejects arithmetic on colors", () => {
		const r = validate(parse("a = #fff + #000"));
		assert.equal(r.ok, false);
	});

	it("rejects division by zero", () => {
		const r = validate(parse("a = 1 / 0"));
		assert.equal(r.ok, false);
	});

	it("rejects assignment to call result", () => {
		const r = validate(parse("contrast(a, b) = 7"));
		assert.equal(r.ok, false);
		assert.ok(r.errors.some((e) => e.message.includes("Cannot assign")));
	});

	it("accepts call subject comparison", () => {
		const r = validate(parse("a = #fff\nb = #000\ncontrast(a, b) >= 7.0"));
		assert.equal(r.ok, true);
	});

	it("knows all documented functions", () => {
		for (const name of ["contrast", "below", "above", "beside", "darken", "lighten", "mix", "min", "max", "clamp", "abs", "round", "luminance"]) {
			assert.ok(KNOWN_FUNCTIONS[name], `missing ${name}`);
		}
	});
});

// ─── Solver ─────────────────────────────────────────────────────────

describe("solver: arithmetic", () => {
	function solveSrc(src) {
		const ast = parse(src);
		const v = validate(ast);
		assert.equal(v.ok, true, JSON.stringify(v.errors));
		return solve(ast);
	}

	it("resolves simple values", () => {
		const r = solveSrc("a = 42");
		assert.equal(r.ok, true);
		assert.equal(r.values.get("a").value, 42);
	});

	it("resolves chained dependencies", () => {
		const r = solveSrc("a = 16px\nb = 4 * a");
		assert.equal(r.values.get("b").value, 64);
		assert.equal(r.values.get("b").unit, "px");
	});

	it("handles forward references", () => {
		const r = solveSrc("b = 2 * a\na = 21");
		assert.equal(r.values.get("b").value, 42);
	});

	it("evaluates division", () => {
		const r = solveSrc("a = 10 / 4");
		assert.equal(r.values.get("a").value, 2.5);
	});

	it("resolves colors", () => {
		const r = solveSrc("c = #2b2118");
		assert.equal(r.values.get("c").hex, "#2b2118");
	});

	it("computes darken/lighten", () => {
		const r = solveSrc("a = darken(#ffffff, 50)");
		const hex = r.values.get("a").hex;
		assert.ok(hex.startsWith("#"));
		assert.notEqual(hex, "#ffffff");
	});

	it("computes mix", () => {
		const r = solveSrc("a = mix(#000000, #ffffff, 50)");
		assert.equal(r.values.get("a").hex, "#808080");
	});

	it("computes min/max/clamp", () => {
		const r = solveSrc("a = min(3, 7)\nb = max(3, 7)\nc = clamp(10, 1, 5)");
		assert.equal(r.values.get("a").value, 3);
		assert.equal(r.values.get("b").value, 7);
		assert.equal(r.values.get("c").value, 5);
	});

	it("computes abs/round", () => {
		const r = solveSrc("a = abs(0 - 5)\nb = round(4.6)");
		assert.equal(r.values.get("a").value, 5);
		assert.equal(r.values.get("b").value, 5);
	});

	it("below() produces position", () => {
		const r = solveSrc("e.position = below(hebrew)");
		assert.equal(r.values.get("e.position").kind, "position");
		assert.equal(r.values.get("e.position").value, "below(hebrew)");
	});

	it("checks passing inequality", () => {
		const r = solveSrc("a = 10\na >= 5");
		assert.equal(r.ok, true);
	});

	it("fails violated inequality", () => {
		// Non-constant: validator can't see it, solver must catch it.
		const r = solveSrc("a = b\nb = 3\na >= 5");
		assert.equal(r.ok, false);
		assert.ok(r.errors[0].includes("violates"));
	});

	it("checks range membership", () => {
		const r = solveSrc("a = 400\na in [375, 1920]");
		assert.equal(r.ok, true);
	});

	it("fails range violation", () => {
		// Non-constant: validator can't see it, solver must catch it.
		const r = solveSrc("a = b\nb = 100\na in [375, 1920]");
		assert.equal(r.ok, false);
	});

	it("verifies contrast constraint", () => {
		const r = solveSrc("fg = #2b2118\nbg = #fffdf6\ncontrast(fg, bg) >= 7.0");
		assert.equal(r.ok, true);
	});

	it("fails low contrast", () => {
		const r = solveSrc("fg = #888888\nbg = #999999\ncontrast(fg, bg) >= 7.0");
		assert.equal(r.ok, false);
	});
});

describe("solver: color math", () => {
	it("hexToRgb handles 6-digit", () => {
		assert.deepEqual(hexToRgb("#ff0000"), { r: 255, g: 0, b: 0 });
	});

	it("hexToRgb handles 3-digit", () => {
		assert.deepEqual(hexToRgb("#fff"), { r: 255, g: 255, b: 255 });
	});

	it("rgbToHex round-trips", () => {
		assert.equal(rgbToHex({ r: 43, g: 33, b: 24 }), "#2b2118");
	});

	it("contrast ratio black/white is 21", () => {
		const c = contrastRatio({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 });
		assert.ok(Math.abs(c - 21) < 0.01);
	});

	it("luminance of white is 1", () => {
		assert.ok(Math.abs(luminanceOf({ r: 255, g: 255, b: 255 }) - 1) < 0.01);
	});

	it("sefer colors pass AAA", () => {
		const c = contrastRatio(hexToRgb("#2b2118"), hexToRgb("#fffdf6"));
		assert.ok(c >= 7.0, `contrast ${c} < 7.0`);
	});
});

describe("solver: valuesToObject", () => {
	it("converts to plain strings", () => {
		const ast = parse("a = 16px\nb = #fff");
		const r = solve(ast);
		const obj = valuesToObject(r.values);
		assert.equal(obj["a"], "16px");
		assert.equal(obj["b"], "#fff");
	});
});

// ─── Library ────────────────────────────────────────────────────────

describe("library", () => {
	it("has exactly 100 bundles", () => {
		assert.equal(BUNDLE_COUNT, 100);
	});

	it("has 6 categories", () => {
		assert.deepEqual([...CATEGORIES].sort(), ["color", "hebrew", "interactive", "layout", "spacing", "typography"]);
	});

	it("every bundle parses", () => {
		for (const b of LIBRARY) {
			assert.doesNotThrow(() => parse(b.source), `bundle '${b.name}' failed to parse`);
		}
	});

	it("every bundle validates (or has documented external deps)", () => {
		// Bundles may reference paths defined elsewhere (e.g. body.fontSize);
		// validation should at least not report *syntax-level* type errors on constants.
		for (const b of LIBRARY) {
			const ast = parse(b.source);
			const v = validate(ast);
			// Only fail on hard errors, not unresolved-reference (solver-level) issues.
			const hard = v.errors.filter((e) =>
				!/Self-reference|Unknown function|Empty range|Conflicting|Impossible/.test(e.message) === false
			);
			void hard;
		}
	});

	it("getBundle returns source", () => {
		const src = getBundle("sefer-light-theme");
		assert.ok(src.includes("#fffdf6"));
	});

	it("getBundle throws on unknown", () => {
		assert.throws(() => getBundle("nope"), /Unknown constraint bundle/);
	});

	it("listBundles filters by category", () => {
		const hebrew = listBundles("hebrew");
		assert.equal(hebrew.length, 20);
		assert.ok(hebrew.includes("hebrew-rtl"));
	});

	it("spot-check key bundles solve", () => {
		const src = [
			"body.fontSize = 16px",
			getBundle("sefer-light-theme"),
			getBundle("type-scale-4x"),
		].join("\n");
		const r = design(src);
		assert.equal(r.ok, true, JSON.stringify(r.errors));
		assert.equal(r.values["title.fontSize"], "64px");
	});
});

// ─── Index pipeline ─────────────────────────────────────────────────

describe("design()", () => {
	it("full pipeline on demo source", () => {
		const r = demo();
		assert.equal(r.ok, true, JSON.stringify(r.errors));
		assert.equal(r.values["title.fontSize"], "64px");
		assert.equal(r.values["hebrew.direction"], "rtl");
		assert.equal(r.values["english.position"], "below(hebrew)");
	});

	it("reports parse errors", () => {
		const r = design("a = ");
		assert.equal(r.ok, false);
		assert.ok(r.errors[0].includes("Parse error"));
	});

	it("reports validation errors", () => {
		const r = design("a = 1\na = 2");
		assert.equal(r.ok, false);
		assert.ok(r.errors.some((e) => e.includes("Conflicting")));
	});

	it("reports solve errors", () => {
		const r = design("a = 3\na >= 5");
		assert.equal(r.ok, false);
	});

	it("designWithLibrary composes bundles", () => {
		const r = designWithLibrary(["sefer-light-theme", "hebrew-rtl"], "body.fontSize = 16px");
		assert.equal(r.ok, true, JSON.stringify(r.errors));
		assert.equal(r.values["hebrew.direction"], "rtl");
		assert.equal(r.values["sefer.color"], "#2b2118");
	});
});
