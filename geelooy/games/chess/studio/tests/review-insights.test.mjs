//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Proves Deep Review separates truth lanes, formats production move coordinates, and labels punishment studies honestly.
 * The Awtsmoos lets engine arrays become human squares while Awtsmoos.com keeps warning and opening evidence apart;
 * repeated measured patterns may teach, but every lane remains labeled from the search line into the player's heart.
 */
import assert from "node:assert/strict";
import { criticalMoments } from "../review/criticalMoments.js";
import { momentInsight, reviewSummary } from "../review/insights.js";
import { reviewTendencies } from "../review/tendencies.js";

const result = {
	classification: "blunder",
	loss: 250,
	searchPass: "deep",
	budgetMs: 650,
	bestMove: { from: [6, 4], to: [4, 4] },
	playedMove: { from: [6, 3], to: [4, 3], san: "d4" },
	principalVariation: [{ from: [6, 4], to: [4, 4] }],
	inBook: false,
	bookName: null,
	bookCandidates: 1,
	openingCandidates: 0,
	punishmentCandidates: 1,
	criticalScore: 321,
	positionDelta: { delta: { materialBalance: -1, kingShelterPawns: -1, centerBalance: 1 } }
};
const lanes = momentInsight(result);
assert.ok(lanes.some(line => line.startsWith("ENGINE ·")));
assert.ok(lanes.some(line => line.includes("Best e2e4")));
assert.ok(lanes.some(line => line.includes("PV e2e4")));
assert.ok(lanes.some(line => line.includes("punishment/trap-study")));
assert.ok(lanes.some(line => line.includes("not opening approval")));
assert.ok(lanes.some(line => line.startsWith("POSITION ·")));
assert.ok(lanes.some(line => line.startsWith("COACH ·")));

const review = {
	results: [result, { ...result, criticalScore: 200 }],
	analysis: { totalNodes: 12345, deepenedPlies: [1], scanBudgetMs: 180, deepBudgetMs: 650 }
};
const summary = reviewSummary(review);
assert.equal(summary.totalNodes, 12345);
assert.deepEqual(summary.deepenedPlies, [1]);
assert.equal(summary.bookPlies, 0);
assert.equal(criticalMoments(review, 1)[0].importance, 321);
assert.ok(reviewTendencies(review).some(item => /King shelter/.test(item.message)));

console.log("review-insights.test.mjs PASS");
