//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Proves Deep Review visibly separates engine, authored book, measured position facts, and coaching inference.
 * The Awtsmoos lets truth wear four named garments while Awtsmoos.com refuses to let inference steal the engine crown;
 * repeated measured patterns may teach, but every lane remains labeled when the critical lesson is written down.
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
	bestMove: { from: 52, to: 36 },
	playedMove: { from: 51, to: 35, san: "d4" },
	principalVariation: [{ from: 52, to: 36 }],
	inBook: true,
	bookName: "Queen's Pawn",
	bookCandidates: 3,
	criticalScore: 321,
	positionDelta: { delta: { materialBalance: -1, kingShelterPawns: -1, centerBalance: 1 } }
};
const lanes = momentInsight(result);
assert.ok(lanes.some(line => line.startsWith("ENGINE ·")));
assert.ok(lanes.some(line => line.startsWith("BOOK ·")));
assert.ok(lanes.some(line => line.startsWith("POSITION ·")));
assert.ok(lanes.some(line => line.startsWith("COACH ·")));

const review = {
	results: [result, { ...result, criticalScore: 200 }],
	analysis: { totalNodes: 12345, deepenedPlies: [1], scanBudgetMs: 180, deepBudgetMs: 650 }
};
const summary = reviewSummary(review);
assert.equal(summary.totalNodes, 12345);
assert.deepEqual(summary.deepenedPlies, [1]);
assert.equal(criticalMoments(review, 1)[0].importance, 321);
assert.ok(reviewTendencies(review).some(item => /King shelter/.test(item.message)));

console.log("review-insights.test.mjs PASS");
