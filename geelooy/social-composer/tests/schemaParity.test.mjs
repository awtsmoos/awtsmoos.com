//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module ComposerSchemaParityTest
 * @description
 * Client markup, media references, verses, questions, answers, and validation are
 * tested without a browser or database. Awtsmoos.com therefore knows the visible
 * composer speaks the same structured language as the native social route.
 */

import assert from 'node:assert/strict';
import { parseInline } from '../js/model/InlineMarkup.js';
import { buildPostPayload, payloadIssues } from '../js/model/PostPayload.js';
import { LocalDraftRepository } from '../js/state/LocalDraftRepository.js';

function snapshot(overrides = {}) {
	return {
		version: 1,
		identity: { aliasId: 'teacher', heichelId: 'study', seriesId: 'root' },
		postKind: 'question',
		questionId: '',
		title: 'What does this verse reveal?',
		summary: 'A structured question.',
		commentsEnabled: true,
		questionOptions: {
			answersEnabled: true,
			answerPolicy: 'onePerAlias',
			answerGuidance: 'Bring a source.'
		},
		rootBlocks: [{
			id: 'root-one',
			type: 'paragraph',
			text: '**Bold** and [safe](https://awtsmoos.com).'
		}],
		rootAttachments: [{
			id: 'image-one',
			type: 'image',
			mime: 'image/png',
			publicPath: '/media/image.png',
			status: 'uploaded',
			alt: 'A light'
		}],
		sections: [{
			id: 'verse-one',
			title: 'Verse One',
			commentsEnabled: true,
			blocks: [{ id: 'verse-block', type: 'quote', text: 'A quoted verse.' }],
			attachments: [],
			subsections: [{
				id: 'word-one',
				title: 'First word',
				blocks: [{ id: 'word-block', type: 'paragraph', text: '`detail`' }],
				attachments: []
			}]
		}],
		...overrides
	};
}

function testInlineMarks() {
	const segments = parseInline('**bold** _soft_ [link](javascript:alert(1))');
	assert.equal(segments[0].marks[0].type, 'bold');
	assert.equal(segments[2].marks[0].type, 'italic');
	assert.equal(segments.at(-1).marks.length, 0);
}

function testPostAndQuestionPayload() {
	const payload = buildPostPayload(snapshot());
	assert.equal(payload.postKind, 'question');
	assert.equal(payload.rootAssets[0].type, 'image');
	assert.equal(payload.sections[0].verseSection, 'verse-one');
	assert.equal(payload.sections[0].subsections[0].id, 'word-one');
	assert.equal(payload.rootDocument.blocks[0].segments[0].marks[0].type, 'bold');
	assert.deepEqual(payloadIssues(snapshot()), []);
}

function testAnswerAndPendingMedia() {
	const answer = snapshot({ postKind: 'answer', questionId: 'question-one' });
	const payload = buildPostPayload(answer);
	assert.equal(payload.postKind, 'answer');
	assert.equal(payload.parentQuestionId, 'question-one');
	const pending = snapshot({
		rootAttachments: [{ id: 'pending', type: 'audio', status: 'pending' }]
	});
	assert.match(payloadIssues(pending).join(' '), /still need upload/);
}

function testLocalDraftRoundTrip() {
	const values = new Map();
	const storage = {
		getItem: key => values.get(key) || null,
		setItem: (key, value) => values.set(key, value),
		removeItem: key => values.delete(key)
	};
	const repository = new LocalDraftRepository(storage);
	const value = snapshot();
	assert.equal(repository.save(value), true);
	assert.deepEqual(repository.load(value), value);
	assert.equal(repository.clear(value), true);
	assert.equal(repository.load(value), null);
}

testInlineMarks();
testPostAndQuestionPayload();
testAnswerAndPendingMedia();
testLocalDraftRoundTrip();
console.log('B"H schemaParity.test passed');
