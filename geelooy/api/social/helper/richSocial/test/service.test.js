//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RichSocialServiceTest
 * @description
 * The service must enter native post, question, answer, graph, and read helpers
 * with exact structured payloads. These witnesses prevent Awtsmoos.com from
 * accidentally founding a duplicate social store outside the Awtsmoos-given river.
 */

const assert = require('assert');
const { createRichPostService } = require('../RichPostService.js');

function request(method, body = {}, query = {}) {
	return {
		request: { method },
		$_POST: body,
		$_GET: query,
		$_QUERY: query
	};
}

function richBody(overrides = {}) {
	return {
		aliasId: 'teacher',
		title: 'A structured thought',
		rootDocument: [{ type: 'paragraph', text: 'Root light.' }],
		rootAssets: [{ id: 'image-one', mime: 'image/png', publicPath: '/asset.png' }],
		sections: [{
			id: 'verse-one',
			title: 'Verse One',
			document: [{ type: 'quote', text: 'A verse.' }]
		}],
		...overrides
	};
}

async function testNativeDelegation() {
	const calls = [];
	const native = {
		createPost: async input => (calls.push(['post', input]), { success: 'post' }),
		createQuestion: async input => (calls.push(['question', input]), { success: 'question' }),
		createAnswer: async input => (calls.push(['answer', input]), { success: 'answer' }),
		listAnswers: async input => (calls.push(['list', input]), { success: [] }),
		readPostRecord: async () => ({
			id: 'entity-one',
			postId: 'entity-one',
			heichelId: 'study',
			title: 'Stored',
			sections: [{ id: 'verse-one', verseSection: 'verse-one', segments: [] }]
		})
	};
	const service = createRichPostService(native);
	await service.createPost({
		$i: request('POST', richBody()),
		heichelId: 'study',
		seriesId: 'root'
	});
	await service.createPost({
		$i: request('POST', richBody({ postKind: 'question' })),
		heichelId: 'study',
		seriesId: 'questions'
	});
	await service.createAnswer({
		$i: request('POST', richBody({ title: 'An answer' })),
		heichelId: 'study',
		questionId: 'question-one'
	});
	assert.deepEqual(calls.map(call => call[0]), ['post', 'question', 'answer']);
	assert.equal(calls[0][1].$i.$_POST.type, 'post');
	assert.equal(calls[1][1].$i.$_POST.type, 'question');
	assert.equal(calls[2][1].$i.$_POST.type, 'answer');
	assert.equal(calls[2][1].$i.$_POST.parentQuestionId, 'question-one');
	assert.equal(calls[0][1].$i.$_POST.sections[0].verseSection, 'verse-one');
}

async function testReadContracts() {
	const native = {
		listAnswers: async input => ({ success: [input.questionId] }),
		readPostRecord: async () => ({
			id: 'question-one',
			postId: 'question-one',
			heichelId: 'study',
			title: 'Question',
			sections: []
		})
	};
	const service = createRichPostService(native);
	const answers = await service.listAnswers({
		$i: request('GET'),
		heichelId: 'study',
		questionId: 'question-one'
	});
	const targets = await service.discussionTargets({
		$i: request('GET'),
		heichelId: 'study',
		postId: 'question-one'
	});
	assert.deepEqual(answers.success, ['question-one']);
	assert.equal(targets.success.targets[0].scope, 'post');
}

async function run() {
	await testNativeDelegation();
	await testReadContracts();
	console.log('B"H richSocial service.test passed');
}

run().catch(error => {
	console.error(error);
	process.exitCode = 1;
});
