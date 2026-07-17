// B"H
// Boruch Hashem
// Blessed is He

/** @file apiJourneyComments.js @description Proves comments and Q&A use real routes. */

const assert = require('node:assert/strict');
const { requireSuccess } = require('./apiJourneyHttp.js');

async function createComment(origin, apiKey, ids) {
	const response = await requireSuccess('comment create', origin, (
		`/api/social/heichelos/${ids.heichel}/post/${ids.post}/comments/`
	), {
		method: 'POST', apiKey, body: {
			aliasId: ids.alias,
			seriesId: ids.series,
			content: 'isolated comment body',
			dayuh: JSON.stringify({ verseSection: 'root', run: ids.run })
		}
	});
	const commentId = response.json?.details?.id
		|| response.json?.success?.id
		|| response.json?.id;
	assert.ok(commentId, `comment ID absent: ${response.text}`);
	const authors = await requireSuccess('comment authors read', origin, (
		`/api/social/heichelos/${ids.heichel}/post/${ids.post}/comments/aliases`
		+ `?seriesId=${ids.series}&verseSection=root`
	), { apiKey });
	assert.match(JSON.stringify(authors.json), new RegExp(ids.alias));
	const comments = await requireSuccess('comments by alias read', origin, (
		`/api/social/heichelos/${ids.heichel}/comments/inSeries/${ids.series}`
		+ `/atPost/${ids.post}/atAlias/${ids.alias}?verseSection=root`
	), { apiKey });
	assert.match(JSON.stringify(comments.json), /isolated comment body/);
	return commentId;
}

async function createQuestionAnswer(origin, apiKey, ids) {
	const question = await requireSuccess('question create', origin, (
		`/api/social/content/heichelos/${ids.heichel}/questions`
	), {
		method: 'POST', apiKey, body: {
			aliasId: ids.alias,
			postId: ids.question,
			title: 'Isolated question',
			content: 'Question body',
			seriesId: ids.series,
			sections: '[]'
		}
	});
	ids.question = question.json?.success?.postId;
	assert.ok(ids.question, `canonical question ID absent: ${question.text}`);
	const answer = await requireSuccess('answer create', origin, (
		`/api/social/content/heichelos/${ids.heichel}/questions/${ids.question}/answers`
	), {
		method: 'POST', apiKey, body: {
			aliasId: ids.alias,
			answerId: ids.answer,
			title: 'Isolated answer',
			content: 'Answer body',
			seriesId: ids.series
		}
	});
	ids.answer = answer.json?.success?.postId;
	assert.ok(ids.answer, `canonical answer ID absent: ${answer.text}`);
	const answers = await requireSuccess('answers read', origin, (
		`/api/social/content/heichelos/${ids.heichel}/questions/${ids.question}/answers`
		+ `?seriesId=${encodeURIComponent(ids.series)}`
	), { apiKey });
	assert.match(JSON.stringify(answers.json), new RegExp(ids.answer));
}

async function deleteWorld(origin, apiKey, ids, commentId) {
	await requireSuccess('comment delete', origin, (
		`/api/social/heichelos/${ids.heichel}/comment/${commentId}`
	), {
		method: 'DELETE', apiKey, body: {
			aliasId: ids.alias,
			parentType: 'post',
			parentId: ids.post,
			postId: ids.post,
			seriesId: ids.series,
			verseSection: 'root'
		}
	});
	for (const postId of [ids.answer, ids.question, ids.post]) {
		await requireSuccess(`post delete ${postId}`, origin, (
			`/api/social/heichelos/${ids.heichel}/series/${ids.series}/post/${postId}`
		), { method: 'DELETE', apiKey, body: { aliasId: ids.alias } });
	}
	await requireSuccess('series delete', origin, (
		`/api/social/heichelos/${ids.heichel}/series/root/deleteSubSeries/${ids.series}`
	), { method: 'DELETE', apiKey, body: { aliasId: ids.alias } });
	await requireSuccess('heichel delete', origin, (
		`/api/social/alias/${ids.alias}/heichelos/${ids.heichel}`
	), { method: 'DELETE', apiKey, body: { aliasId: ids.alias } });
}

module.exports = {
	createComment,
	createQuestionAnswer,
	deleteWorld
};
