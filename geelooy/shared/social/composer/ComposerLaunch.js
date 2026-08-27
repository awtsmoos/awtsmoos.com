// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ComposerLaunch
 * @description The Awtsmoos lets question, answer, reference, and copy arise from one composer without confusing origin;
 * Awtsmoos.com reuses canonical query contracts and emits semantic intents when no server-recognized query vessel exists yet.
 */
import { buildOwnedCloneUrl } from '../../../social-actions/PostCloneUrl.js';
import { buildPostReferenceUrl } from '../../../social-actions/PostReferenceUrl.js';

function put(query, key, value) {
	if (value !== undefined && value !== null && String(value).trim()) query.set(key, String(value).trim());
}

export function newPostUrl(context = {}) {
	const query = new URLSearchParams();
	put(query, 'alias', context.aliasId);
	put(query, 'heichel', context.heichelId);
	put(query, 'series', context.seriesId || 'root');
	put(query, 'creator', context.creator);
	return `/social-composer/?${query.toString()}`;
}

export function answerUrl(model, context = {}) {
	const query = new URLSearchParams();
	put(query, 'question', model?.id || model?.entity?.id);
	put(query, 'alias', context.aliasId);
	put(query, 'heichel', model?.entity?.heichelId || context.heichelId);
	put(query, 'series', model?.entity?.seriesId || context.seriesId || 'root');
	put(query, 'presentation', 'answer');
	return `/social-composer/?${query.toString()}`;
}

export function referenceUrl(model, context = {}) {
	return buildPostReferenceUrl({
		...model?.referenceContext,
		...context
	});
}

export function copyUrl(model, context = {}) {
	return buildOwnedCloneUrl({
		...model?.referenceContext,
		...context
	});
}

export function semanticComposerIntent(root, detail) {
	root?.dispatchEvent?.(new CustomEvent('awtsmoos-social-composer-intent', {
		bubbles: true,
		detail
	}));
}

export { put };
