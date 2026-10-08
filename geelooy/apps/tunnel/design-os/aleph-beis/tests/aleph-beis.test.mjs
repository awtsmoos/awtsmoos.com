//B"H
// Tests for the Aleph-Beis design principles. Run: node --test tests/aleph-beis.test.mjs
// (from geelooy/apps/tunnel/design-os/aleph-beis/)

import { test } from "node:test";
import assert from "node:assert/strict";
import { LETTERS, getLetter, listLetters } from "../letters.mjs";
import { CHECKS } from "../checks.mjs";
import {
	letterSource,
	applyLetters,
	applyAllLetters,
	checkDesign,
	designWithLetters,
} from "../index.mjs";
import { parse } from "../../constraints/parser.mjs";
import { validate } from "../../constraints/validator.mjs";

const EXPECTED_ORDER = [
	["aleph", "א"], ["beis", "ב"], ["gimmel", "ג"], ["daled", "ד"],
	["hei", "ה"], ["vav", "ו"], ["zayin", "ז"], ["ches", "ח"],
	["tes", "ט"], ["yud", "י"], ["kaf", "כ"], ["lamed", "ל"],
	["mem", "מ"], ["nun", "נ"], ["samech", "ס"], ["ayin", "ע"],
	["pei", "פ"], ["tzadi", "צ"], ["kuf", "ק"], ["reish", "ר"],
	["shin", "ש"], ["tav", "ת"],
];

test("all 22 letters present, in order, with unique keys", () => {
	assert.equal(LETTERS.length, 22);
	assert.deepEqual(
		LETTERS.map((l) => [l.key, l.hebrew]),
		EXPECTED_ORDER
	);
	assert.equal(new Set(LETTERS.map((l) => l.key)).size, 22);
	for (const l of LETTERS) {
		assert.ok(l.principle, `${l.key} missing principle`);
		assert.ok(l.meaning.length > 20, `${l.key} meaning too thin`);
		assert.ok(l.sources.length > 0, `${l.key} missing sources`);
		assert.ok(l.constraints.trim().length > 0, `${l.key} missing constraints`);
		assert.ok(typeof CHECKS[l.key] === "function", `${l.key} missing check`);
	}
});

test("every letter's DSL constraints parse and validate standalone", () => {
	for (const l of LETTERS) {
		const src = letterSource(l.key);
		let ast;
		try {
			ast = parse(src);
		} catch (e) {
			assert.fail(`${l.key}: parse error: ${e.message}`);
		}
		const v = validate(ast);
		assert.ok(v.ok, `${l.key}: validation errors: ${JSON.stringify(v.errors)}`);
	}
});

test("applyLetters / applyAllLetters produce valid programs", () => {
	for (const src of [applyLetters(["aleph", "hei", "tav"]), applyAllLetters()]) {
		const ast = parse(src);
		const v = validate(ast);
		assert.ok(v.ok, `errors: ${JSON.stringify(v.errors)}`);
	}
});

test("unknown letter key throws", () => {
	assert.throws(() => letterSource("nope"), /Unknown letter/);
	assert.throws(() => applyLetters(["aleph", "nope"]), /Unknown letters/);
	assert.equal(getLetter("nope"), null);
	assert.deepEqual(listLetters().length, 22);
});

const GOOD_DESIGN = `
body.fontSize = 16px
body.lineHeight = 28px
title.fontSize = 64px
section.fontSize = 32px
body.color = #2b2118
body.background = #fff8ee
title.color = #1a120b
title.background = #fff8ee
container.maxWidth = 1100px
container.padding = 32px
container.paddingLeft = 32px
container.paddingRight = 32px
section.spacing = 48px
space.unit = 16px
focus.visible = "on"
interactive.minTouch = 44px
footnote.fontSize = 13px
layout.minWidth = 320px
layout.fluid = "on"
footer.present = "on"
body.fontFamily = "Frank Ruhl Libre, serif"
motion.reduced = "respect"
title.count = 1
accent.color = #b3541e
accent.warmth = "fire"
layout.shift = "none"
sacred.spacing = 64px
`;

test("checkDesign: exemplary design passes all 22 letters", () => {
	const r = checkDesign(GOOD_DESIGN);
	assert.ok(r.ok, `solve errors: ${JSON.stringify(r.errors)}`);
	assert.equal(r.letters.length, 22);
	const failed = r.letters.filter((l) => l.applicable && !l.pass);
	assert.deepEqual(
		failed.map((l) => l.key),
		[],
		`unexpected failures: ${JSON.stringify(failed.map((l) => l.detail))}`
	);
	assert.equal(r.score.applicable, 22);
	assert.equal(r.score.passed, 22);
	assert.equal(r.score.ratio, 1);
});

const BAD_DESIGN = `
body.fontSize = 14px
body.lineHeight = 16px
title.fontSize = 18px
section.fontSize = 28px
body.color = #999999
body.background = #ffffff
title.color = #aaaaaa
title.background = #ffffff
`;

test("checkDesign: broken design fails the right letters", () => {
	const r = checkDesign(BAD_DESIGN);
	assert.ok(r.ok, `solve errors: ${JSON.stringify(r.errors)}`);
	const byKey = Object.fromEntries(r.letters.map((l) => [l.key, l]));
	for (const k of ["aleph", "gimmel", "hei", "pei", "lamed", "ayin"]) {
		assert.equal(byKey[k].applicable, true, `${k} should be applicable`);
		assert.equal(byKey[k].pass, false, `${k} should fail: ${byKey[k].detail}`);
	}
	// zayin: whole pixels, should still pass
	assert.equal(byKey.zayin.pass, true);
	// untouched letters are not applicable, never failures
	for (const l of r.letters) {
		if (!l.applicable) assert.equal(l.pass, true);
	}
	assert.ok(r.score.ratio < 1);
});

test("checkDesign: silence is not a violation", () => {
	const r = checkDesign(`body.fontSize = 16px`);
	assert.ok(r.ok);
	for (const l of r.letters) {
		if (!l.applicable) assert.equal(l.pass, true, `${l.key} must not fail when silent`);
	}
});

test("designWithLetters: design wins, letters fill and verify", () => {
	const src = `
body.fontSize = 16px
body.lineHeight = 30px
title.fontSize = 64px
section.fontSize = 32px
`;
	const r = designWithLetters(src, ["aleph", "gimmel", "lamed"]);
	assert.ok(r.ok, `errors: ${JSON.stringify(r.errors)}`);
	// letter declarations are present in solved values
	assert.equal(r.values["aleph.unity"], '"on"');
	assert.equal(r.values["gimmel.generosity"], '"on"');
	// designer values untouched
	assert.equal(r.values["body.fontSize"], "16px");
});

test("designWithLetters: letter inequality catches a violating design", () => {
	const src = `
body.fontSize = 16px
body.lineHeight = 18px
`;
	const r = designWithLetters(src, ["gimmel"]);
	assert.ok(!r.ok, "expected gimmel to reject cramped line-height");
	assert.ok(r.errors.some((e) => e.includes("body.lineHeight")), `errors: ${JSON.stringify(r.errors)}`);
});
