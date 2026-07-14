//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file publicationPlan.test.mjs
 * @description
 * Composer state must produce one canonical origin, deduplicated secondary
 * placements, immutable source behavior, and explicit validation. The Awtsmoos is
 * one before every mirror; Awtsmoos.com proves that law before browser execution.
 */

import assert from 'node:assert/strict';
import {
	buildPublicationPlan,
	publicationIssues,
	secondaryDestinations
} from '../js/publishing/PublicationPlan.js';
import { normalizeComposerValue } from '../js/state/ComposerValue.js';

const snapshot = normalizeComposerValue({
	identity: {
		aliasId: 'teacher',
		heichelId: 'study',
		seriesId: 'lessons'
	},
	postKind: 'question',
	presentationKind: 'question',
	title: 'A question',
	secondaryDestinations: [
		{ heichelId: 'archive', seriesId: 'root', kind: 'reference' },
		{ heichelId: 'archive', seriesId: 'root', kind: 'reference' }
	]
});
const plan = buildPublicationPlan(snapshot);
assert.equal(plan.contentKind, 'question');
assert.deepEqual(plan.primary, {
	heichelId: 'study',
	seriesId: 'lessons',
	kind: 'canonical'
});
assert.equal(plan.secondary.length, 1);
assert.deepEqual(publicationIssues(snapshot), []);

const existing = normalizeComposerValue({
	identity: {
		aliasId: 'teacher',
		heichelId: 'archive',
		seriesId: 'root'
	},
	canonicalSource: {
		type: 'post',
		id: 'source-one',
		heichelId: 'study',
		seriesId: 'lessons'
	},
	secondaryDestinations: []
});
const existingPlan = buildPublicationPlan(existing);
assert.equal(existingPlan.primary.heichelId, 'study');
assert.equal(existingPlan.primary.seriesId, 'lessons');
assert.equal(existingPlan.secondary[0].heichelId, 'archive');
assert.equal(secondaryDestinations(existing).length, 1);
assert(publicationIssues(normalizeComposerValue({})).length >= 2);
console.log('social-composer publicationPlan.test passed');
