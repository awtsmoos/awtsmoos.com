//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Design DNA test suite. Run: node --test tests/run.mjs
 * @description Real verification with hand-computed expectations — no mocks.
 * Every profile must parse, validate, and solve through the genuine
 * constraint pipeline; headline values are asserted exactly.
 */

import { test } from "node:test";
import assert from "node:assert/strict";

import { design } from "../../constraints/index.mjs";
import {
	DIMENSIONS, NUMERIC_DIMENSIONS, CATEGORICAL_DIMENSIONS,
	validateDNA, dnaDistance, describeDNA,
} from "../dna.mjs";
import { PROFILES, PROFILE_NAMES, getProfile, listProfiles } from "../profiles.mjs";
import { blendDNA, blendStyles, mixHex, dslFromDNA } from "../blender.mjs";
import { designInStyle, designInBlend, traditionDistances, demo } from "../index.mjs";

// ─── DNA dimensions ─────────────────────────────────────────────
test("DIMENSIONS lists all 8 axes", () => {
	assert.equal(DIMENSIONS.length, 8);
	assert.ok(DIMENSIONS.includes("typography.scale"));
	assert.ok(DIMENSIONS.includes("ornament.level"));
});

test("validateDNA accepts every profile's DNA", () => {
	for (const p of PROFILES) {
		const r = validateDNA(p.dna);
		assert.ok(r.ok, `${p.name}: ${r.errors.join("; ")}`);
	}
});

test("validateDNA rejects bad coordinates", () => {
	const bad = { ...PROFILES[0].dna, "spacing.density": 2 };
	assert.equal(validateDNA(bad).ok, false);
	const bad2 = { ...PROFILES[0].dna, "ornament.level": "extreme" };
	assert.equal(validateDNA(bad2).ok, false);
});

test("dnaDistance is zero for identical DNA and symmetric", () => {
	const a = PROFILES[0].dna;
	assert.equal(dnaDistance(a, a), 0);
	assert.equal(dnaDistance(a, PROFILES[1].dna), dnaDistance(PROFILES[1].dna, a));
});

test("describeDNA mentions scale and ornament", () => {
	const s = describeDNA(PROFILES[0].dna);
	assert.ok(s.includes("4x"));
	assert.ok(s.includes("minimal"));
});

// ─── Profiles ───────────────────────────────────────────────────
test("five profiles exist with sources", () => {
	assert.deepEqual([...PROFILE_NAMES].sort(), ["chabad", "chassidic", "litvish", "modern", "sephardic"]);
	for (const p of PROFILES) {
		assert.ok(p.tradition.length > 0);
		assert.ok(p.sources.length >= 2, `${p.name} must cite real exemplars`);
		assert.ok(p.source.length > 100);
		assert.ok(p.palette.background && p.palette.color && p.palette.accent);
	}
});

test("getProfile throws on unknown tradition", () => {
	assert.throws(() => getProfile("martian"), /Unknown design tradition/);
});

test("every profile source parses, validates, and solves standalone", () => {
	for (const p of PROFILES) {
		const r = design(p.source);
		assert.ok(r.ok, `${p.name} failed: ${r.errors.join("; ")}`);
	}
});

// ─── designInStyle headline values ──────────────────────────────
const EXPECTED = {
	chabad: { body: "16px", title: "64px", bg: "#fffdf6", ink: "#2b2118", accent: "#1e3a6e", ornament: "minimal" },
	litvish: { body: "14px", title: "28px", bg: "#ffffff", ink: "#111111", accent: "#111111", ornament: "none" },
	sephardic: { body: "16px", title: "48px", bg: "#fdf6e3", ink: "#3a2410", accent: "#8b1a1a", ornament: "rich" },
	chassidic: { body: "17px", title: "59.5px", bg: "#faf5ea", ink: "#3a2c1c", accent: "#a05e1a", ornament: "moderate" },
	modern: { body: "18px", title: "45px", bg: "#ffffff", ink: "#1a1a1a", accent: "#2563eb", ornament: "none" },
};

for (const [name, exp] of Object.entries(EXPECTED)) {
	test(`designInStyle('${name}') solves with expected headline values`, () => {
		const r = designInStyle(name);
		assert.ok(r.ok, `${name} errors: ${r.errors.join("; ")}`);
		assert.equal(r.values["body.fontSize"], exp.body);
		assert.equal(r.values["title.fontSize"], exp.title);
		assert.equal(r.values["paper.background"], exp.bg);
		assert.equal(r.values["paper.color"], exp.ink);
		assert.equal(r.values["accent.color"], exp.accent);
		assert.equal(r.values["link.color"], exp.accent);
		assert.equal(r.values["ornament.level"], exp.ornament);
		assert.equal(r.profile, getProfile(name).tradition);
		assert.ok(r.dna.length > 10);
	});
}

test("designInStyle carries Hebrew-first structural bundles", () => {
	const r = designInStyle("chabad");
	assert.ok(r.ok);
	assert.equal(r.values["hebrew.direction"], "rtl");
	assert.equal(r.values["root.direction"], "rtl");
	assert.equal(r.values["hebrew.nikkud.clear"], "true");
});

test("designInStyle composes caller extras", () => {
	const r = designInStyle("modern", "sidebar.width = 20em");
	assert.ok(r.ok, r.errors.join("; "));
	assert.equal(r.values["sidebar.width"], "20em");
	assert.equal(r.values["body.fontSize"], "18px");
});

test("designInStyle contrast floors are genuinely satisfied", () => {
	// The solver verifies contrast() >= floor as a real inequality.
	for (const name of PROFILE_NAMES) {
		const p = getProfile(name);
		const r = design(p.source + `\ncontrast(paper.color, paper.background) >= ${p.dna["color.contrastFloor"]}`);
		assert.ok(r.ok, `${name}: palette fails its own contrast floor`);
	}
});

// ─── Blender ────────────────────────────────────────────────────
test("mixHex mixes channels (black+white at 50% = #808080)", () => {
	assert.equal(mixHex("#000000", "#ffffff", 0.5), "#808080");
	assert.equal(mixHex("#ff0000", "#ff0000", 0.3), "#ff0000");
});

test("blendDNA interpolates numerics and votes categoricals", () => {
	const d = blendDNA(PROFILES[0].dna, PROFILES[4].dna, 0.7); // chabad×modern 70/30
	assert.ok(Math.abs(d["typography.bodySize"] - 16.6) < 0.01);
	assert.ok(Math.abs(d["typography.scale"] - 3.55) < 0.01);
	assert.equal(d["ornament.level"], "minimal"); // 0.7 >= 0.5 → A's
	assert.equal(d["formality.level"], "balanced");
	const r = validateDNA(d);
	assert.ok(r.ok, r.errors.join("; "));
});

test("blendStyles endpoints recover the parents", () => {
	const fullA = blendStyles("chabad", "modern", 1);
	assert.equal(fullA.dna["typography.bodySize"], 16);
	assert.equal(fullA.palette.background, "#fffdf6");
	const fullB = blendStyles("chabad", "modern", 0);
	assert.equal(fullB.dna["typography.bodySize"], 18);
	assert.equal(fullB.palette.background, "#ffffff");
});

test("blendStyles throws on bad weight", () => {
	assert.throws(() => blendStyles("chabad", "modern", 1.5), /weightA must be in/);
});

test("dslFromDNA generates solvable DSL", () => {
	const b = blendStyles("sephardic", "litvish", 0.5);
	const r = design(b.source);
	assert.ok(r.ok, `blend DSL failed: ${r.errors.join("; ")}`);
});

test("designInBlend('chabad','modern',0.7) solves with interpolated values", () => {
	const r = designInBlend("chabad", "modern", 0.7);
	assert.ok(r.ok, r.errors.join("; "));
	assert.equal(r.values["body.fontSize"], "17px"); // round(16.6)
	assert.equal(r.values["ornament.level"], "minimal");
	assert.ok(r.profile.includes("Chabad"));
});

// ─── Tradition distances ────────────────────────────────────────
test("traditionDistances returns 10 sorted pairs", () => {
	const ds = traditionDistances();
	assert.equal(ds.length, 10);
	for (let i = 1; i < ds.length; i++) {
		assert.ok(ds[i].distance >= ds[i - 1].distance, "not sorted");
	}
	assert.ok(ds[0].distance > 0, "all traditions distinct");
});

// ─── Demo ───────────────────────────────────────────────────────
test("demo() runs and mentions all traditions", () => {
	const out = demo();
	for (const name of PROFILE_NAMES) assert.ok(out.includes(name), `demo missing ${name}`);
	assert.ok(out.includes("ok=true"));
});
