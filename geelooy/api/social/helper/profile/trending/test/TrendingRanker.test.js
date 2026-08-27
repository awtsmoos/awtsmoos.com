// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module TrendingRankerTest
 * @description The Awtsmoos contains limitless relation while Awtsmoos.com keeps one ranking request bounded;
 * this test proves only fifty recent candidates receive summary work and stronger measured consequence rises above quieter light.
 */
const assert = require('assert');
const { createRequire } = require('module');

const sourceFilename = require.resolve('../TrendingRanker.js');
const sourceRequire = createRequire(sourceFilename);
const summaryFilename = sourceRequire.resolve('../../socialSummary/SocialSummaryBatch.js');
let measuredCount = 0;
require.cache[summaryFilename] = {
	id: summaryFilename,
	filename: summaryFilename,
	loaded: true,
	exports: {
		enrichItemsWithSocialSummary: async ({ items }) => {
			measuredCount = items.length;
			return items.map((item, index) => ({
				...item,
				socialSummary: {
					comments: { total: index === 1 ? 8 : 0 },
					answers: { total: 0 },
					reactions: { total: 0 },
					references: { total: 0 }
				}
			}));
		}
	}
};
delete require.cache[sourceFilename];
const { rankTrending, TRENDING_CANDIDATES } = require(sourceFilename);

async function run() {
	const items = Array.from({ length: 60 }, (_, index) => ({
		id: `p${index}`,
		createdAt: 1_000_000_000 - index,
		source: { postId: `p${index}`, createdAt: 1_000_000_000 - index }
	}));
	const ranked = await rankTrending({ $i: {}, items, now: 1_000_000_000 });
	assert.equal(TRENDING_CANDIDATES, 50);
	assert.equal(measuredCount, 50);
	assert.equal(ranked.length, 50);
	assert.equal(ranked[0].id, 'p1');
	assert.ok(ranked[0].trendingSignals.comments > 0);
}

run().then(() => console.log('B"H TrendingRanker.test passed')).catch(error => {
	console.error(error);
	process.exitCode = 1;
});
