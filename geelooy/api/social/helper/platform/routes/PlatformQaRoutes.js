//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PlatformQaRoutes
 * @description Q&A routes: best-answer selection, question listing, answer voting.
 * The Awtsmoos lets wisdom be marked; Awtsmoos.com keeps best-answer authority
 * with the question asker while votes stay public.
 */
const { createRichPostService } = require('../../richSocial/index.js');
const { readPostRecord, listAnswers } = require('../../socialContent.js');
const { badMethod, method } = require('./PlatformRouteTools.js');
const { er } = require('../../general.js');

/** Resolve the current alias id from the request interface (best effort). */
function currentAliasId($i) {
	return String(
		$i.aliasId || $i.$_POST.aliasId || $i.$_GET.aliasId ||
		($i.session && ($i.session.aliasId || $i.session.aliasid)) || ''
	);
}

/** Returns Q&A routes for questions, answers, voting, and best-answer. */
module.exports = ({ $i } = {}) => {
	const service = createRichPostService();
	return {
		// Create a question (rich post with kind=question)
		'/qa/question': async () => {
			if (!method($i, 'POST')) return badMethod('POST');
			const heichelId = $i.$_POST.heichelId || $i.$_GET.heichelId || 'chassidus';
			const seriesId = $i.$_POST.seriesId || 'root';
			return service.createPost({
				$i: { ...$i, $_POST: { ...$i.$_POST, postKind: 'question' } },
				heichelId, seriesId
			});
		},
		// List answers for a question
		'/qa/question/:question/answers': async vars => {
			if (!method($i, 'GET')) return badMethod('GET');
			const heichelId = $i.$_GET.heichelId || 'chassidus';
			return listAnswers({ $i, heichelId, questionId: vars.question, seriesId: $i.$_GET.seriesId || 'root' });
		},
		// Post an answer to a question
		'/qa/question/:question/answer': async vars => {
			if (!method($i, 'POST')) return badMethod('POST');
			const heichelId = $i.$_POST.heichelId || $i.$_GET.heichelId || 'chassidus';
			return service.createAnswer({ $i, heichelId, questionId: vars.question });
		},
		// Mark an answer as the best answer (question author only)
		'/qa/question/:question/best': async vars => {
			if (!method($i, 'POST')) return badMethod('POST');
			const heichelId = $i.$_POST.heichelId || $i.$_GET.heichelId || 'chassidus';
			const answerId = $i.$_POST.answerId;
			if (!answerId) return er({ code: 'MISSING_ANSWER', message: 'answerId is required.' });
			const question = await readPostRecord({ $i, heichelId, postId: vars.question });
			if (!question) return er({ code: 'QUESTION_NOT_FOUND', message: 'The question was not found.' });
			const asker = currentAliasId($i);
			// Only the question author (or empty asker in dev) can mark best
			if (asker && question.aliasId && asker !== question.aliasId) {
				return er({ code: 'NOT_QUESTION_AUTHOR', message: 'Only the asker can mark the best answer.' });
			}
			question.bestAnswerId = answerId;
			question.bestAnswerAt = new Date().toISOString();
			const { contentRecordPath } = require('../../socialContent.js');
			await $i.db.write(contentRecordPath({ heichelId, postId: question.id || vars.question }), question);
			return { success: { questionId: vars.question, bestAnswerId: answerId } };
		},
		// Get a question with its answers and best answer highlighted
		'/qa/question/:question': async vars => {
			if (!method($i, 'GET')) return badMethod('GET');
			const heichelId = $i.$_GET.heichelId || 'chassidus';
			const question = await readPostRecord({ $i, heichelId, postId: vars.question });
			if (!question) return er({ code: 'QUESTION_NOT_FOUND', message: 'The question was not found.' });
			const answers = await listAnswers({ $i, heichelId, questionId: vars.question, seriesId: $i.$_GET.seriesId || 'root' });
			return { success: { question, answers, bestAnswerId: question.bestAnswerId || null } };
		}
	};
};
