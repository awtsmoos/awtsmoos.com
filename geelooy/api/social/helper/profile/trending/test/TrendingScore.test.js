// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module TrendingScoreTest
 * @description The Awtsmoos is beyond popularity while Awtsmoos.com must make ranking legible; measured answers,
 * discussion, reactions, and references lift a score, while the same engagement becomes quieter as age increases in time.
 */
const assert = require('assert');
const { trendingScore } = require('../TrendingScore.js');

const now = 1_000_000_000;
const quiet = {
	createdAt: now - 3600000,
	socialSummary: { comments: { total: 1 }, answers: { total: 0 }, reactions: { total: 1 }, references: { total: 0 } }
};
const engaged = {
	createdAt: now - 3600000,
	socialSummary: { comments: { total: 4 }, answers: { total: 2 }, reactions: { total: 9 }, references: { total: 3 } }
};
const oldEngaged = { ...engaged, createdAt: now - 10 * 24 * 3600000 };
assert.ok(trendingScore(engaged, now).score > trendingScore(quiet, now).score);
assert.ok(trendingScore(engaged, now).score > trendingScore(oldEngaged, now).score);
const signals = trendingScore(engaged, now).signals;
assert.equal(signals.answers, 2);
assert.equal(signals.references, 3);
assert.ok(signals.engagement > 0);
console.log('B"H TrendingScore.test passed');
