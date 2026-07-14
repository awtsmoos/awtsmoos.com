// B"H
// Boruch Hashem
// Blessed is He
/** @module QuestionObject @description Creates first-class questions inside the common object graph. */
import { createDraft } from '../core/mutableDraft.mjs';
import { createComposerPayload } from './composerPayload.mjs';

/** Creates a mutable question draft. */
export function createQuestion(input) {
	const payload = createComposerPayload({
		...input,
		kind: 'question'
	});
	return createDraft({
		type: 'question',
		owner: input?.owner,
		seed: input?.seed || payload.title,
		visibility: payload.visibility,
		payload: {
			...payload,
			acceptedAnswerId: null,
			answerIds: []
		},
		metadata: input?.metadata || {}
	});
}

/** Returns a new question revision with an accepted answer history entry. */
export function acceptQuestionAnswer(question, answerId, acceptedBy, acceptedAt = new Date().toISOString()) {
	if (question?.type !== 'question') {
		throw new TypeError('Accepted answers require a question object.');
	}
	return {
		...question,
		payload: {
			...question.payload,
			acceptedAnswerId: String(answerId),
			acceptedAnswerHistory: [
				...(question.payload.acceptedAnswerHistory || []),
				{ answerId: String(answerId), acceptedBy: String(acceptedBy), acceptedAt }
			]
		}
	};
}
