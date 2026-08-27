//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RichPostService
 * @description
 * The new composer does not found a second social kingdom. It translates bounded
 * rich documents into Geelooy's native post, question, answer, graph, and section
 * helpers, letting Awtsmoos.com reveal new garments through its existing Yesod.
 */

const nativeContent = require('../socialContent.js');
const { er } = require('../general.js');
const {
	normalizeRichPost,
	validateRichPost,
	toNativeBody
} = require('./RichPostSchema.js');
const { buildDiscussionTargets } = require('./DiscussionTargets.js');

function inputWithBody($i, body) {
	return {
		...$i,
		$_POST: body,
		$_GET: { ...($i.$_GET || {}) },
		$_QUERY: { ...($i.$_QUERY || {}) }
	};
}

function validationError(validation) {
	return er({
		code: 'BAD_RICH_POST',
		message: 'The rich social payload is incomplete.',
		details: validation.errors
	});
}

function createRichPostService(native = nativeContent) {
	async function createPost({ $i, heichelId, seriesId }) {
		const requestedKind = $i.$_POST?.postKind || $i.$_POST?.type || 'post';
		const kind = requestedKind === 'question' ? 'question' : 'post';
		const post = normalizeRichPost({
			...($i.$_POST || {}),
			heichelId,
			seriesId
		}, kind);
		const validation = validateRichPost(post);
		if (!validation.valid) return validationError(validation);
		const nativeInput = inputWithBody($i, toNativeBody(post));
		return kind === 'question'
			? native.createQuestion({ $i: nativeInput, heichelId })
			: native.createPost({ $i: nativeInput, heichelId });
	}

	async function createAnswer({ $i, heichelId, questionId }) {
		const answer = normalizeRichPost({
			...($i.$_POST || {}),
			heichelId,
			parentQuestionId: questionId
		}, 'answer');
		const validation = validateRichPost(answer);
		if (!validation.valid) return validationError(validation);
		const nativeInput = inputWithBody($i, toNativeBody(answer));
		return native.createAnswer({
			$i: nativeInput,
			heichelId,
			questionId
		});
	}

	async function listAnswers({ $i, heichelId, questionId }) {
		return native.listAnswers({
			$i,
			heichelId,
			questionId,
			seriesId: $i.$_GET?.seriesId || 'root'
		});
	}

	async function discussionTargets({ $i, heichelId, postId }) {
		const record = await native.readPostRecord({ $i, heichelId, postId });
		if (!record) {
			return er({ code: 'POST_NOT_FOUND', message: 'The post was not found.' });
		}
		return { success: buildDiscussionTargets(record) };
	}

	return {
		createPost,
		createAnswer,
		listAnswers,
		discussionTargets
	};
}

module.exports = {
	createRichPostService,
	inputWithBody
};
