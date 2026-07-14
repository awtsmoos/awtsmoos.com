//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module ComposerValue
 * @description
 * The entire visible composer is normalized into one serializable covenant:
 * identity, destination, content, media, canonical source, references, and plan.
 * The Awtsmoos gives unity; Awtsmoos.com refuses hidden DOM state as a rival truth.
 */

import { createBlock } from '../model/Ids.js';
import { PRESENTATION_KINDS } from '../config.js';

function requestId() {
	return globalThis.crypto?.randomUUID?.()
		|| `BH_publish_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;
}

function identity(value = {}) {
	return {
		aliasId: String(value.aliasId || ''),
		aliasName: String(value.aliasName || ''),
		heichelId: String(value.heichelId || ''),
		heichelName: String(value.heichelName || ''),
		seriesId: String(value.seriesId || 'root'),
		seriesName: String(value.seriesName || (value.seriesId === 'root' ? 'Heichel Home' : '')),
		access: value.access && typeof value.access === 'object' ? value.access : null
	};
}

function source(value) {
	if (!value?.id) return null;
	return {
		type: String(value.type || 'post'),
		id: String(value.id),
		heichelId: String(value.heichelId || ''),
		seriesId: String(value.seriesId || 'root'),
		aliasId: String(value.aliasId || '')
	};
}

function secondary(values = []) {
	return Array.isArray(values)
		? values.slice(0, 24).map(item => ({
				heichelId: String(item.heichelId || ''),
				heichelName: String(item.heichelName || ''),
				seriesId: String(item.seriesId || 'root'),
				seriesName: String(item.seriesName || ''),
				kind: String(item.kind || 'reference'),
				note: String(item.note || ''),
				access: item.access && typeof item.access === 'object' ? item.access : null
			})).filter(item => item.heichelId)
		: [];
}

export function normalizeComposerValue(value = {}, context = {}) {
	const questionId = String(value.questionId || context.questionId || '');
	const postKind = questionId
		? 'answer'
		: ['post', 'question', 'answer'].includes(value.postKind)
			? value.postKind
			: context.postKind || 'post';
	const presentation = value.presentationKind || context.presentationKind || postKind;
	return {
		version: 2,
		identity: identity(value.identity || context),
		postKind,
		presentationKind: PRESENTATION_KINDS.includes(presentation) ? presentation : postKind,
		questionId,
		title: String(value.title || ''),
		summary: String(value.summary || ''),
		commentsEnabled: value.commentsEnabled !== false,
		questionOptions: {
			answersEnabled: value.questionOptions?.answersEnabled !== false,
			answerPolicy: value.questionOptions?.answerPolicy || 'open',
			answerGuidance: String(value.questionOptions?.answerGuidance || '')
		},
		rootBlocks: Array.isArray(value.rootBlocks) && value.rootBlocks.length
			? value.rootBlocks
			: [createBlock()],
		rootAttachments: Array.isArray(value.rootAttachments) ? value.rootAttachments : [],
		sections: Array.isArray(value.sections) ? value.sections : [],
		canonicalSource: source(value.canonicalSource || context.canonicalSource),
		secondaryDestinations: secondary(value.secondaryDestinations),
		publication: {
			idempotencyKey: String(value.publication?.idempotencyKey || requestId()),
			visibility: value.publication?.visibility || 'public',
			scheduledAt: Number(value.publication?.scheduledAt || 0),
			lastPreview: value.publication?.lastPreview || null
		},
		createdAt: Number(value.createdAt) || Date.now(),
		updatedAt: Number(value.updatedAt) || Date.now(),
		draftId: String(value.draftId || '')
	};
}

export {
	requestId,
	identity,
	source,
	secondary
};
