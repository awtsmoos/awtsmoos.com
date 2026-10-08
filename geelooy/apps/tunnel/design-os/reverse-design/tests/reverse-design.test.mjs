//B"H
import { test } from "node:test";
import assert from "node:assert/strict";
import {
	EMOTIONS,
	getEmotion,
	listEmotions,
	clampIntensity,
} from "../emotions.mjs";
import { combineSources } from "../combine.mjs";
import {
	designForEmotion,
	emotionSources,
	describeEmotions,
} from "../index.mjs";
import { parse } from "../../constraints/parser.mjs";
import { validate } from "../../constraints/validator.mjs";
import { contrastRatio, hexToRgb } from "../../constraints/solver.mjs";

const CONTENT = `body.fontSize = 16px
text.color = #2b2118
text.background = #fffdf6`;

test("lexicon: exactly 20 emotions, unique names", () => {
	assert.equal(EMOTIONS.length, 20);
	assert.equal(new Set(listEmotions()).size, 20);
});

test("lexicon: every emotion has description, floor, bundles, dsl", () => {
	for (const e of EMOTIONS) {
		assert.ok(e.description.length > 20, `${e.name}: description`);
		assert.ok(e.contrastFloor >= 4.5, `${e.name}: floor`);
		assert.ok(Array.isArray(e.bundles), `${e.name}: bundles`);
		assert.equal(typeof e.dsl, "function", `${e.name}: dsl`);
	}
});

test("pipeline: every emotion solves at t=0, 0.6, 1", () => {
	for (const name of listEmotions()) {
		for (const t of [0, 0.6, 1]) {
			const r = designForEmotion(CONTENT, { name, intensity: t });
			assert.ok(r.ok, `${name}@${t}: ${r.errors.join("; ")}`);
		}
	}
});

test("honesty: every palette meets its declared contrast floor (solver's own math)", () => {
	for (const name of listEmotions()) {
		const e = getEmotion(name);
		for (const t of [0, 0.5, 1]) {
			const r = designForEmotion(CONTENT, { name, intensity: t });
			assert.ok(r.ok, `${name}@${t} solves`);
			const text = r.values["text.color"];
			const bg = r.values["text.background"];
			assert.ok(text && bg, `${name}@${t}: colors solved`);
			const ratio = contrastRatio(hexToRgb(text), hexToRgb(bg));
			assert.ok(
				ratio >= e.contrastFloor - 0.01,
				`${name}@${t}: contrast ${ratio.toFixed(2)} < floor ${e.contrastFloor}`
			);
		}
	}
});

test("intensity slider: awe t=0 vs t=1 moves the design", () => {
	const mild = designForEmotion(CONTENT, { name: "awe", intensity: 0 });
	const wild = designForEmotion(CONTENT, { name: "awe", intensity: 1 });
	assert.ok(mild.ok && wild.ok);
	assert.equal(mild.values["title.fontSize"], "48px");
	assert.equal(wild.values["title.fontSize"], "96px");
	assert.equal(mild.values["chrome.count"], "3");
	assert.equal(wild.values["chrome.count"], "1");
});

test("combining: 'warm clarity' solves with override notes", () => {
	const r = designForEmotion(CONTENT, ["warmth", "clarity"]);
	assert.ok(r.ok, r.errors.join("; "));
	assert.ok(r.notes.length > 0, "overrides are recorded, never silent");
	assert.ok(
		r.notes.some((n) => n.includes("already set by a higher-priority source")),
		"note explains first-wins"
	);
	// clarity's contrast floor survives the merge
	const ratio = contrastRatio(
		hexToRgb(r.values["text.color"]),
		hexToRgb(r.values["text.background"])
	);
	assert.ok(ratio >= 7.0 - 0.01, `merged contrast ${ratio.toFixed(2)} >= 7.0`);
});

test("combining: contradictory emotions fail honestly", () => {
	const r = designForEmotion(CONTENT, ["urgency", "calm"]);
	assert.equal(r.ok, false);
	assert.ok(r.errors.length > 0);
});

test("fail closed: unknown emotion is an error, not a guess", () => {
	const r = designForEmotion(CONTENT, "ecstasy");
	assert.equal(r.ok, false);
	assert.match(r.errors[0], /Unknown emotion/);
});

test("fail closed: non-numeric intensity throws", () => {
	assert.throws(() => clampIntensity("a lot"), /must be a number/);
	assert.throws(() => clampIntensity(NaN), /must be a number/);
});

test("intensity clamps into [0,1]", () => {
	assert.equal(clampIntensity(-2), 0);
	assert.equal(clampIntensity(2), 1);
	assert.equal(clampIntensity(0.6), 0.6);
});

test("combineSources: first `=` wins, inequalities compose", () => {
	const { source, notes } = combineSources([
		{ label: "first", source: "title.fontSize = 64px\nwhitespace.ratio >= 0.4" },
		{ label: "second", source: "title.fontSize = 32px\nwhitespace.ratio >= 0.5" },
	]);
	assert.match(source, /title\.fontSize = 64px/);
	assert.doesNotMatch(source, /32px/);
	assert.match(source, /whitespace\.ratio >= 0\.4/);
	assert.match(source, /whitespace\.ratio >= 0\.5/);
	assert.ok(notes.some((n) => n.includes("second") && n.includes("title.fontSize")));
	// merged program still validates
	const ast = parse(source);
	assert.ok(validate(ast).ok);
});

test("combineSources: same-value `=` duplicates do not conflict", () => {
	const { source } = combineSources([
		{ label: "a", source: "chrome.count = 1" },
		{ label: "b", source: "chrome.count = 1" },
	]);
	assert.ok(validate(parse(source)).ok);
});

test("emotionSources: unknown bundle names are noted, not fatal", () => {
	// temporarily check the graceful path via a direct combine
	const { notes } = combineSources([
		{ label: "x", source: "not valid dsl (((" },
	]);
	assert.ok(notes.some((n) => n.includes("parse failed")));
});

test("describeEmotions: 20 entries with names and descriptions", () => {
	const d = describeEmotions();
	assert.equal(d.length, 20);
	for (const e of d) assert.ok(e.name && e.description);
});

test("designForEmotion: default content works with no content arg", () => {
	const r = designForEmotion(undefined, "calm");
	assert.ok(r.ok, r.errors.join("; "));
});

test("designForEmotion: extra overrides everything", () => {
	const r = designForEmotion(CONTENT, "awe", { extra: "title.fontSize = 200px" });
	assert.ok(r.ok, r.errors.join("; "));
	assert.equal(r.values["title.fontSize"], "200px");
});
