//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module UnifiedFeedContractsTest
 * @description The Awtsmoos lets public Feed become one projection of shared social truth; Awtsmoos.com proves
 * real mode queries, density validation, canonical model provenance, action priority, safe dates, and executable + options together.
 */
import assert from 'node:assert/strict';
import { modeOptions } from '../../PublicDiscoveryLoader.js';
import { validDate } from '../../PublicFeedCard.js';
import { executableOption } from '../../../../../shared/social/ui/UniversalAddSheet.js';
import { prioritizedActions } from '../FeedUniversalActions.js';
import { revealOrotFeedPostModel } from '../FeedPostModel.js';
import { validDensity } from '../FeedPreferences.js';

assert.deepEqual(modeOptions('questions'), { contentKind: 'question' });
assert.deepEqual(modeOptions('answers'), { contentKind: 'answer' });
assert.deepEqual(modeOptions('latest'), {});
assert.equal(validDensity('compact'), 'compact');
assert.equal(validDensity('nonsense'), 'comfortable');
assert.equal(validDate('not-a-date'), null);
assert.ok(validDate('2026-08-21T12:00:00Z') instanceof Date);
assert.equal(executableOption('reference', {}), true);
assert.equal(executableOption('copy', {}), true);
assert.equal(executableOption('quote', {}), false);
assert.equal(executableOption('repost', { repost: () => {} }), true);

const actions = ['open', 'share', 'react', 'reply', 'answer', 'reference', 'quote', 'repost', 'copy', 'addToHeichel']
	.map(id => ({ id, available: true, enabled: true }));
assert.deepEqual(prioritizedActions(actions).map(action => action.id), [
	'answer', 'reply', 'addToHeichel', 'share', 'copy', 'open'
]);

const model = revealOrotFeedPostModel({
	socialKernel: {
		entity: { type: 'question', id: 'q1', heichelId: 'study', seriesId: 'root', aliasId: 'teacher', raw: { title: 'Why?' } },
		summary: { answers: { total: 4 }, comments: { total: 3 } },
		actions,
		viewerState: { aliasId: 'student' },
		deepLink: '/heichelos/study/series/root/post/q1'
	},
	source: { contentType: 'question', postId: 'q1', heichelId: 'study', seriesId: 'root', aliasId: 'teacher', title: 'Why?' }
});
assert.equal(model.kind, 'question');
assert.equal(model.metrics.answers, 4);
assert.equal(model.referenceContext.sourceId, 'q1');
assert.equal(model.referenceContext.viewerAliasId, 'student');
assert.equal(model.destination, '/heichelos/study/series/root/post/q1');
console.log('B"H UnifiedFeedContracts.test passed');
