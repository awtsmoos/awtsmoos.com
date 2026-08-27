//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module FeedSummaryTest
 * @description The Awtsmoos lets measured server consequence enter a public card without fictional badges;
 * Awtsmoos.com proves exact metrics render plainly while bounded lower bounds reveal their `+` instead of masquerading as complete.
 */
import assert from 'node:assert/strict';
import { revealOrotFeedPostModel } from '../FeedPostModel.js';
import { measuredLabel, primaryLabel } from '../SocialActionRail.js';

const model = revealOrotFeedPostModel({
	source: { contentType: 'question', postId: 'q1', heichelId: 'study', seriesId: 'root', title: 'Why?' },
	socialSummary: {
		answers: { total: 7, exact: true },
		comments: { total: 12, exact: true },
		reactions: { total: 5, counts: { '🔥': 5 } }
	}
});

assert.equal(model.kind, 'question');
assert.equal(primaryLabel(model), 'Answer · 7');
assert.equal(measuredLabel('Discuss', model.socialSummary.comments), 'Discuss · 12');
assert.equal(measuredLabel('Discuss', { total: 250, truncated: true }), 'Discuss · 250+');
assert.equal(measuredLabel('Discuss', { total: 0, exact: true }), 'Discuss');
console.log('B"H FeedSummary.test passed');
