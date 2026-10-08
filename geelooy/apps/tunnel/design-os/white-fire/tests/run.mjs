//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file White Fire test suite. Run: node --test tests/run.mjs
 * @description Real verification with hand-computed expectations — no mocks.
 */

import { test } from "node:test";
import assert from "node:assert/strict";

import { normalizeLayout, unionArea, elementById } from "../layout.mjs";
import { measure } from "../measure.mjs";
import { classify } from "../detector.mjs";
import { restFor, restSize, restRank, rhythmScore, recommendedRest, recommendRests } from "../rhythm.mjs";
import { checkConstraints, WHITEFIRE_PRESETS } from "../constraints.mjs";
import { score } from "../report.mjs";
import { analyze, analyzeSefer, demo } from "../index.mjs";

// ─── Fixture: hand-computed layout ───────────────────────────────
// viewport 1000×800, baseUnit 10
// title    {100,40,800,80}   margin.bottom 40  (whole-rest, declared)
// body     {100,160,800,400}                      (no declared spacing below)
// footnote {100,600,800,60}
// covered = 64000+320000+48000 = 432000; viewport 800000 → ratio 0.46
// gaps: title→body 40px (declared 40, accounted); body→footnote 40px (declared 0)
// trailing: 800−660 = 140px, declared 0
function fixture() {
	return {
		viewport: { width: 1000, height: 800 },
		baseUnit: 10,
		elements: [
			{ id: "title", role: "title", box: { x: 100, y: 40, w: 800, h: 80 }, margin: { bottom: 40 } },
			{ id: "body", role: "body", box: { x: 100, y: 160, w: 800, h: 400 } },
			{ id: "footnote", role: "footnote", box: { x: 100, y: 600, w: 800, h: 60 } },
		],
	};
}

function analyzed() {
	const layout = normalizeLayout(fixture());
	const measurements = measure(layout);
	const classification = classify(layout, measurements);
	const rhythm = rhythmScore(measurements.gaps, layout.baseUnit);
	const rests = recommendRests(layout, measurements.gaps);
	return { layout, measurements, classification, rhythm, rests };
}

// ─── layout.mjs ──────────────────────────────────────────────────

test("normalizeLayout accepts a valid layout and fills defaults", () => {
	const l = normalizeLayout(fixture());
	assert.equal(l.baseUnit, 10);
	assert.equal(l.elements[1].margin.bottom, 0);
	assert.equal(l.elements[1].gapAfter, 0);
	assert.equal(l.elements[0].role, "title");
});

test("normalizeLayout defaults baseUnit to 8", () => {
	const f = fixture();
	delete f.baseUnit;
	assert.equal(normalizeLayout(f).baseUnit, 8);
});

test("normalizeLayout rejects duplicate ids", () => {
	const f = fixture();
	f.elements[1].id = "title";
	assert.throws(() => normalizeLayout(f), /duplicate element id/);
});

test("normalizeLayout rejects negative coordinates", () => {
	const f = fixture();
	f.elements[0].box.y = -5;
	assert.throws(() => normalizeLayout(f), /non-negative/);
});

test("normalizeLayout rejects missing elements array", () => {
	assert.throws(() => normalizeLayout({ viewport: { width: 10, height: 10 } }), /'elements' must be an array/);
});

test("unionArea subtracts overlaps exactly", () => {
	// 10×10 at (0,0) and 10×10 at (5,5): union = 100+100−25 = 175
	assert.equal(unionArea([{ x: 0, y: 0, w: 10, h: 10 }, { x: 5, y: 5, w: 10, h: 10 }]), 175);
});

test("unionArea of disjoint boxes is the sum", () => {
	assert.equal(unionArea([{ x: 0, y: 0, w: 10, h: 10 }, { x: 20, y: 20, w: 10, h: 10 }]), 200);
});

test("elementById throws on unknown id", () => {
	const l = normalizeLayout(fixture());
	assert.throws(() => elementById(l, "nope"), /unknown element id/);
});

// ─── measure.mjs ─────────────────────────────────────────────────

test("measure computes the hand-computed whitespace ratio 0.46", () => {
	const { measurements } = analyzed();
	assert.equal(measurements.coveredArea, 432000);
	assert.equal(measurements.viewportArea, 800000);
	assert.ok(Math.abs(measurements.ratio - 0.46) < 1e-9, `ratio was ${measurements.ratio}`);
});

test("measure finds both gaps with declared accounting", () => {
	const { measurements } = analyzed();
	assert.equal(measurements.gaps.length, 2);
	const [g1, g2] = measurements.gaps;
	assert.deepEqual(g1.between, ["title", "body"]);
	assert.equal(g1.size, 40);
	assert.equal(g1.declared, 40);
	assert.equal(g1.accounted, true);
	assert.deepEqual(g2.between, ["body", "footnote"]);
	assert.equal(g2.size, 40);
	assert.equal(g2.declared, 0);
	assert.equal(g2.accounted, false);
});

test("measure finds 140px trailing dead space", () => {
	const { measurements } = analyzed();
	assert.equal(measurements.trailing.size, 140);
	assert.equal(measurements.trailing.declared, 0);
});

test("measure reports horizontal balance", () => {
	const { measurements } = analyzed();
	assert.equal(measurements.horizontal.balanced, true);
	assert.equal(measurements.horizontal.avgLeft, 100);
	assert.equal(measurements.horizontal.avgRight, 100);
});

// ─── detector.mjs ────────────────────────────────────────────────

test("detector: declared gap is intentional, mystery gap is accidental", () => {
	const { classification } = analyzed();
	const [g1, g2] = classification.gaps;
	assert.equal(g1.verdict, "intentional");
	assert.equal(g2.verdict, "accidental");
	assert.ok(g2.reasons.some((r) => r.includes("mystery gap")), g2.reasons.join("; "));
});

test("detector: trailing dead space is accidental", () => {
	const { classification } = analyzed();
	assert.equal(classification.trailing.verdict, "accidental");
});

test("detector: intentionalShare is 40/220", () => {
	const { classification } = analyzed();
	assert.equal(classification.intentionalPx, 40);
	assert.equal(classification.accidentalPx, 180);
	assert.ok(Math.abs(classification.intentionalShare - 40 / 220) < 1e-9);
});

test("detector flags declaration mismatch as accidental", () => {
	const f = fixture();
	f.elements[0].margin.bottom = 40; // declares 40…
	f.elements[1].box.y = 220; // …but renders 100
	f.elements[2].box.y = 660; // keep footnote gap consistent-ish
	const l = normalizeLayout(f);
	const c = classify(l, measure(l));
	const g1 = c.gaps[0];
	assert.equal(g1.verdict, "accidental");
	assert.ok(g1.reasons.some((r) => r.includes("does not match")), g1.reasons.join("; "));
});

test("detector flags orphan gap after a tiny element", () => {
	const l = normalizeLayout({
		viewport: { width: 500, height: 500 },
		baseUnit: 10,
		elements: [
			{ id: "chip", role: "block", box: { x: 10, y: 10, w: 100, h: 10 }, margin: { bottom: 40 } },
			{ id: "body", role: "body", box: { x: 10, y: 60, w: 100, h: 200 } },
		],
	});
	const c = classify(l, measure(l));
	assert.equal(c.gaps[0].verdict, "accidental");
	assert.ok(c.gaps[0].reasons.some((r) => r.includes("orphan gap")));
});

test("detector: a fully declared page has no findings", () => {
	const l = normalizeLayout({
		viewport: { width: 500, height: 400 },
		baseUnit: 10,
		elements: [
			{ id: "a", role: "section", box: { x: 50, y: 20, w: 400, h: 100 }, margin: { bottom: 20 } },
			{ id: "b", role: "section", box: { x: 50, y: 140, w: 400, h: 100 }, margin: { bottom: 20 } },
			{ id: "c", role: "section", box: { x: 50, y: 260, w: 400, h: 100 }, margin: { bottom: 20 } },
		],
	});
	const c = classify(l, measure(l));
	assert.equal(c.findings.length, 0);
	assert.equal(c.intentionalShare, 1);
});

// ─── rhythm.mjs ──────────────────────────────────────────────────

test("restFor classifies gaps into rests", () => {
	assert.equal(restFor(40, 10).rest, "whole-rest");
	assert.equal(restFor(20, 10).rest, "half-rest");
	assert.equal(restFor(10, 10).rest, "quarter-rest");
	assert.equal(restFor(5, 10).rest, "eighth-rest");
	assert.equal(restFor(80, 10).rest, "breve-rest");
});

test("restSize and restRank", () => {
	assert.equal(restSize("half-rest", 10), 20);
	assert.ok(restRank("eighth-rest") < restRank("quarter-rest"));
	assert.ok(restRank("quarter-rest") < restRank("half-rest"));
	assert.ok(restRank("half-rest") < restRank("whole-rest"));
	assert.ok(restRank("whole-rest") < restRank("breve-rest"));
	assert.throws(() => restRank("nap"), /unknown rest/);
});

test("rhythmScore: identical gaps are perfectly consistent", () => {
	const { rhythm } = analyzed();
	assert.equal(rhythm.cv, 0);
	assert.equal(rhythm.consistent, true);
	assert.equal(rhythm.alignedShare, 1);
});

test("rhythmScore: wandering gaps break the pulse", () => {
	const r = rhythmScore(
		[{ size: 10 }, { size: 47 }, { size: 13 }, { size: 89 }].map((g) => ({ ...g })),
		10
	);
	assert.equal(r.consistent, false);
	assert.ok(r.cv > 0.35);
});

test("recommendedRest follows role transitions", () => {
	assert.equal(recommendedRest("title", "body"), "whole-rest");
	assert.equal(recommendedRest("section", "section"), "half-rest");
	assert.equal(recommendedRest("body", "footnote"), "quarter-rest");
	assert.equal(recommendedRest("footnote", "footnote"), "eighth-rest");
	assert.equal(recommendedRest("mystery", "mystery"), "half-rest");
});

test("recommendRests matches the designed pause, flags the wrong one", () => {
	const { layout, measurements } = analyzed();
	const recs = recommendRests(layout, measurements.gaps);
	assert.equal(recs[0].recommendedRest, "whole-rest");
	assert.equal(recs[0].matches, true);
	assert.equal(recs[1].recommendedRest, "quarter-rest");
	assert.equal(recs[1].matches, false);
});

// ─── constraints.mjs ─────────────────────────────────────────────

test("checkConstraints: ratio and rhythm pass, intentionality fails on fixture", () => {
	const a = analyzed();
	const res = checkConstraints(a.layout, a, `
whitespace.ratio >= 0.4
whitespace.ratio <= 0.65
whitespace.intentionalShare >= 0.8
rhythm.consistent = true
emptiness.intentional = true
`.trim());
	assert.equal(res.ok, false);
	const by = Object.fromEntries(res.results.map((r) => [r.source, r.ok]));
	assert.equal(by["whitespace.ratio >= 0.4"], true);
	assert.equal(by["whitespace.ratio <= 0.65"], true);
	assert.equal(by["whitespace.intentionalShare >= 0.8"], false);
	assert.equal(by["rhythm.consistent = true"], true);
	assert.equal(by["emptiness.intentional = true"], false);
});

test("checkConstraints: pause() comparisons order rests correctly", () => {
	const a = analyzed();
	const res = checkConstraints(a.layout, a, `
pause(title, body) >= half-rest
pause(title, body) = whole-rest
pause(body, footnote) = quarter-rest
pause(body, footnote) >= half-rest
`.trim());
	assert.equal(res.results.length, 4);
	const oks = res.results.map((r) => r.ok);
	assert.deepEqual(oks, [true, true, false, true],
		JSON.stringify(res.results.map((r) => [r.source, r.ok, r.message])));
	// whole >= half ✓; whole = whole ✓; whole = quarter ✗; whole >= half ✓
});

test("checkConstraints: parse error is reported, not thrown", () => {
	const a = analyzed();
	const res = checkConstraints(a.layout, a, "whitespace.ratio >>=> 0.4");
	assert.equal(res.ok, false);
	assert.ok(res.error && res.error.startsWith("Parse error"), res.error);
});

test("checkConstraints: unknown property and unknown element are errors", () => {
	const a = analyzed();
	const r1 = checkConstraints(a.layout, a, "whitespace.nonsense >= 0.4");
	assert.equal(r1.results[0].ok, false);
	assert.ok(r1.results[0].message.includes("unknown white-fire property"));
	const r2 = checkConstraints(a.layout, a, "pause(title, ghost) >= half-rest");
	assert.equal(r2.results[0].ok, false);
	assert.ok(r2.results[0].message.includes("unknown element id"));
});

test("checkConstraints: sefer preset passes on a designed page", () => {
	const l = normalizeLayout({
		viewport: { width: 1000, height: 700 },
		baseUnit: 10,
		elements: [
			{ id: "t", role: "title", box: { x: 150, y: 60, w: 700, h: 90 }, margin: { bottom: 40 } },
			{ id: "b", role: "body", box: { x: 150, y: 190, w: 700, h: 380 }, margin: { bottom: 20 } },
			{ id: "s", role: "section", box: { x: 150, y: 590, w: 700, h: 60 }, margin: { bottom: 20 } },
		],
	});
	const m = measure(l);
	const a = { layout: l, measurements: m, classification: classify(l, m), rhythm: rhythmScore(m.gaps, 10), rests: [] };
	const res = checkConstraints(l, a, WHITEFIRE_PRESETS.sefer);
	assert.equal(res.ok, true, JSON.stringify(res.results.map((r) => [r.source, r.ok, r.message])));
});

// ─── report.mjs + index.mjs ──────────────────────────────────────

test("score: fixture scores ~63 and grades 'crowded'", () => {
	const a = analyzed();
	const s = score(a);
	// ratio 0.46 → 30; intent 0.18 → 0; rhythm consistent → 25; rests 1/2 → 7.5 → 8
	assert.equal(s.breakdown.whitespaceRatio, 30);
	assert.equal(s.breakdown.intentionality, 0);
	assert.equal(s.breakdown.rhythm, 25);
	assert.equal(s.breakdown.rests, 8);
	assert.equal(s.total, 63);
	assert.equal(s.grade, "crowded");
});

test("analyze runs the full pipeline and attaches a report", () => {
	const a = analyze(fixture(), "whitespace.ratio >= 0.4");
	assert.equal(a.score.total, 63);
	assert.equal(a.constraints.ok, true);
	assert.ok(a.report.includes("White Fire Audit"));
	assert.ok(a.report.includes("mystery gap"));
});

test("analyzeSefer applies the sefer preset", () => {
	const a = analyzeSefer(fixture());
	assert.ok(a.constraints.results.length >= 4);
	assert.equal(a.constraints.ok, false); // intentionalShare fails on the fixture
});

test("demo runs end to end", () => {
	const a = demo();
	assert.ok(a.score.total >= 0 && a.score.total <= 100);
	assert.ok(typeof a.report === "string" && a.report.length > 100);
});
