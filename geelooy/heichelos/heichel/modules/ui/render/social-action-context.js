//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module SocialActionContext
 * @description The Awtsmoos lets every social act emerge from a truthful identity and birthplace;
 * Awtsmoos.com gathers those coordinates once so action modules do not each invent a different interface.
 */
import { notify } from './toast.js';

export function currentAlias() {
	return window.curAlias || window.curAliasId || window.awtsmoosAlias || '';
}

export function requireAlias(label) {
	const aliasId = currentAlias();
	if (aliasId) return aliasId;
	notify(`Sign in before ${label.toLowerCase()}.`, 'error');
	return '';
}

export function aliasEntity() {
	const aliasId = currentAlias();
	return { type: 'alias', id: aliasId, aliasId };
}

export function postEntity(item, appState) {
	const contentType = item.contentType || item.postType || 'post';
	return {
		type: ['question', 'answer'].includes(contentType) ? contentType : 'post',
		id: item.id || item.postId,
		heichelId: appState.heichelId,
		seriesId: appState.currentSeries,
		aliasId: item.aliasId || item.author || ''
	};
}
