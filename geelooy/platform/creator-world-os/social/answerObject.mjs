// B"H
// Boruch Hashem
// Blessed is He
/** @module AnswerObject @description Creates source-linked answers with explicit question ancestry. */
import { createDraft } from '../core/mutableDraft.mjs';
import { createAncestryLink } from '../provenance/ancestryLink.mjs';
import { createComposerPayload } from './composerPayload.mjs';

/** Creates a mutable answer draft tied to one question. */
export function createAnswer(input) {
	const questionId = String(input?.questionId || '').trim();
	const owner = String(input?.owner || '').trim();
	if (!questionId || !owner) {
		throw new TypeError('Answer requires questionId and owner.');
	}
	const payload = createComposerPayload({
		...input,
		kind: 'answer'
	});
	const draft = createDraft({
		type: 'answer',
		owner,
		seed: input?.seed || `${questionId}:${payload.title}`,
		visibility: payload.visibility,
		payload: { ...payload, questionId },
		metadata: input?.metadata || {}
	});
	return {
		...draft,
		ancestry: createAncestryLink({
			parentId: questionId,
			childId: draft.id,
			relation: 'answers',
			createdBy: owner,
			createdAt: draft.createdAt
		})
	};
}
