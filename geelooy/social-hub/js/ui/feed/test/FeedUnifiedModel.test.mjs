//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module FeedUnifiedModelTest
 * @description Proves legacy and kernel-fed cards obey one canonical capability language after presentation-only kind filtering was retired.
 * The Awtsmoos renews relevance and permission before either can masquerade as the other;
 * Awtsmoos.com lets Gevurah hide what does not belong while Tiferes preserves a disabled truth when a real capability must wait for another.
 */

import assert from 'node:assert/strict';
import { modeOptions } from '../../PublicDiscoveryLoader.js';
import { legacyActions, revealOrotFeedPostModel } from '../FeedPostModel.js';
import { readFeedDensity, writeFeedDensity } from '../FeedPreferences.js';
import { prioritizedActions } from '../FeedUniversalActions.js';

/** Returns one canonical action descriptor by stable id. */
function revealAction(actions, id) {
	return actions.find((action) => action.id === id);
}

const unknownQuestion = legacyActions(
	'question',
	true,
	true,
	{ answers: { open: null } }
);
const openQuestion = legacyActions(
	'question',
	true,
	true,
	{ answers: { open: true } }
);
const ordinaryPost = legacyActions('post', true, true, null);

assert.equal(revealAction(unknownQuestion, 'answer').available, true);
assert.equal(revealAction(unknownQuestion, 'answer').enabled, false);
assert.match(
	revealAction(unknownQuestion, 'answer').reasonDisabled,
	/closed|unavailable/i
);
assert.equal(revealAction(openQuestion, 'answer').available, true);
assert.equal(revealAction(openQuestion, 'answer').enabled, true);
assert.equal(revealAction(ordinaryPost, 'answer').available, false);

assert.deepEqual(
	prioritizedActions(unknownQuestion).map((action) => action.id),
	['answer', 'reply', 'open', 'addToHeichel', 'share', 'copy']
);
assert.deepEqual(
	prioritizedActions(ordinaryPost).map((action) => action.id),
	['reply', 'open', 'addToHeichel', 'share', 'copy']
);

assert.deepEqual(modeOptions('questions'), { contentKind: 'question' });
assert.deepEqual(modeOptions('answers'), { contentKind: 'answer' });
assert.deepEqual(modeOptions('latest'), {});

const storage = new Map();
const fakeStorage = {
	getItem: (key) => storage.get(key) || null,
	setItem: (key, value) => storage.set(key, value)
};
assert.equal(writeFeedDensity('immersive', fakeStorage), 'immersive');
assert.equal(readFeedDensity(fakeStorage), 'immersive');
assert.equal(writeFeedDensity('impossible', fakeStorage), 'comfortable');

const kernelItem = {
	source: {
		contentType: 'question',
		postId: 'q1',
		heichelId: 'study',
		seriesId: 'root',
		title: 'Why?'
	},
	socialKernel: {
		entity: {
			type: 'question',
			id: 'q1',
			heichelId: 'study',
			seriesId: 'root',
			raw: { title: 'Why?', aliasId: 'teacher' }
		},
		summary: { answers: { total: 2, open: true } },
		actions: openQuestion,
		deepLink: '/heichelos/study/series/root/post/q1',
		viewerState: { aliasId: 'student' }
	}
};
const model = revealOrotFeedPostModel(kernelItem);
assert.equal(model.shared.viewerState.aliasId, 'student');
assert.equal(model.referenceContext.sourceId, 'q1');
assert.equal(model.referenceContext.viewerAliasId, 'student');

console.log('B"H FeedUnifiedModel.test passed');
