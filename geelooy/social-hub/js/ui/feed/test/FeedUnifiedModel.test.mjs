//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module FeedUnifiedModelTest
 * @description The Awtsmoos lets legacy and kernel-fed cards obey one conservative action language; Awtsmoos.com proves
 * unknown Answer policy stays disabled, post cards lose irrelevant Answer, and provenance plus density remain one truthful stream.
 */
import assert from 'node:assert/strict';
import { modeOptions } from '../../PublicDiscoveryLoader.js';
import { legacyActions, revealOrotFeedPostModel } from '../FeedPostModel.js';
import { readFeedDensity, writeFeedDensity } from '../FeedPreferences.js';
import { visibleFeedActions } from '../FeedUniversalActions.js';

const unknown = legacyActions('question', true, true, { answers: { open: null } });
assert.equal(unknown.find(action => action.id === 'answer').enabled, false);
const open = legacyActions('question', true, true, { answers: { open: true } });
assert.equal(open.find(action => action.id === 'answer').enabled, true);

const allActions = [
	{ id: 'quote' }, { id: 'open' }, { id: 'copy' }, { id: 'reply' },
	{ id: 'addToHeichel' }, { id: 'share' }, { id: 'answer' }, { id: 'repost' }
];
assert.deepEqual(visibleFeedActions(allActions, 'question').map(action => action.id), [
	'answer', 'reply', 'addToHeichel', 'copy', 'share', 'open'
]);
assert.deepEqual(visibleFeedActions(allActions, 'post').map(action => action.id), [
	'reply', 'addToHeichel', 'copy', 'share', 'open'
]);
assert.deepEqual(modeOptions('questions'), { contentKind: 'question' });
assert.deepEqual(modeOptions('answers'), { contentKind: 'answer' });
assert.deepEqual(modeOptions('latest'), {});

const storage = new Map();
const fakeStorage = {
	getItem: key => storage.get(key) || null,
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
		actions: open,
		deepLink: '/heichelos/study/series/root/post/q1',
		viewerState: { aliasId: 'student' }
	}
};
const model = revealOrotFeedPostModel(kernelItem);
assert.equal(model.shared.viewerState.aliasId, 'student');
assert.equal(model.referenceContext.sourceId, 'q1');
assert.equal(model.referenceContext.viewerAliasId, 'student');
console.log('B"H FeedUnifiedModel.test passed');
