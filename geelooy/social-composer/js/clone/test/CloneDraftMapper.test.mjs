//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module CloneDraftMapperTest
 * @description The Awtsmoos lets editable matter enter a fresh vessel while source social history stays home;
 * Awtsmoos.com proves answers detach into posts, questions keep their law, and copied blocks receive identities of their own.
 */
import assert from 'node:assert/strict';
import { mapCloneRecord } from '../CloneDraftMapper.js';
import { buildOwnedCloneUrl } from '../../../../social-actions/PostCloneUrl.js';

function source(type = 'answer') {
	return {
		type,
		id: 'source-1',
		heichelId: 'study',
		seriesId: 'root',
		aliasId: 'teacher'
	};
}

function record(type = 'answer') {
	return {
		id: 'source-1',
		contentType: type,
		aliasId: 'teacher',
		heichelId: 'study',
		seriesId: 'root',
		title: 'Original',
		options: {
			summary: 'Summary',
			rootDocument: {
				version: 1,
				blocks: [{ id: 'source-block', type: 'paragraph', text: 'Living text' }]
			},
			creator: { attribution: { displayName: 'Teacher' } },
			question: { answersEnabled: true, answerPolicy: 'moderated' }
		},
		rootAssets: [{ id: 'old-asset', publicPath: '/media/a.webm', type: 'audio' }],
		sections: []
	};
}

function testAnswerBecomesOwnedPost() {
	const mapped = mapCloneRecord(record('answer'), source('answer'));
	assert.equal(mapped.postKind, 'post');
	assert.equal(mapped.creatorMetadata.attribution, undefined);
	assert.equal(mapped.rootBlocks[0].text, 'Living text');
	assert.notEqual(mapped.rootBlocks[0].id, 'source-block');
	assert.equal(mapped.cloneSource.aliasId, 'teacher');
	assert.equal(mapped.canonicalSource, null);
}

function testQuestionKeepsQuestionLaw() {
	const mapped = mapCloneRecord(record('question'), source('question'));
	assert.equal(mapped.postKind, 'question');
	assert.equal(mapped.questionOptions.answerPolicy, 'moderated');
}

function testUrlKeepsSourceSeparateFromDestination() {
	const url = buildOwnedCloneUrl({
		sourceId: 'source-1',
		sourceType: 'post',
		sourceHeichel: 'study',
		sourceSeries: 'root',
		sourceAlias: 'teacher',
		viewerAliasId: 'student'
	});
	assert.match(url, /clone=source-1/);
	assert.match(url, /cloneHeichel=study/);
	assert.match(url, /alias=student/);
	assert.doesNotMatch(url, /(?:^|[?&])heichel=study(?:&|$)/);
}

testAnswerBecomesOwnedPost();
testQuestionKeepsQuestionLaw();
testUrlKeepsSourceSeparateFromDestination();
console.log('B"H CloneDraftMapper.test passed');
