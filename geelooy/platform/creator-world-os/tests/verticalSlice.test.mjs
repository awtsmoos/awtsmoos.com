// B"H
// Boruch Hashem
// Blessed is He
/** @module VerticalSliceTest @description Verifies compose, native social, Radiance, search, and evidence together. */
import assert from 'node:assert/strict';
import { runSocialVerticalSlice } from '../examples/socialVerticalSlice.mjs';

const result = runSocialVerticalSlice({
	aliasId: 'awtsmoos',
	heichelId: 'ikar',
	title: 'What is the source?',
	body: 'A structured question.',
	corpusPins: { Torah: 7 },
	head: 'abc'
}, {
	richSocial: {
		normalizeRichPost(body, kind) {
			return { ...body, type: kind, rootAssets: [], sections: body.sections || [] };
		},
		validateRichPost(post) {
			return { valid: Boolean(post.aliasId && post.heichelId && post.title), errors: [] };
		},
		toNativeBody: post => ({ ...post })
	},
	radiance: {
		rankByRadiance(candidates) {
			return candidates.map(candidate => ({
				...candidate,
				radianceScore: 92,
				reasons: [{ code: 'relevance', contribution: 0.9 }]
			}));
		}
	}
});
assert.equal(result.question.type, 'question');
assert.equal(result.native.valid, true);
assert.equal(result.ranked[0].explanation.reasons[0].signal, 'relevance');
assert.equal(result.queryPlan.corpusPins.Torah, 7);
assert.equal(result.evidence.trainId, 'social');
console.log('B"H social vertical slice passed.');
