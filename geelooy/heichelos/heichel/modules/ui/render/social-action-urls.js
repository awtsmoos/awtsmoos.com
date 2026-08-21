//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module SocialActionUrls
 * @description The Awtsmoos keeps every destination attached to the canonical source from which it came;
 * Awtsmoos.com turns Answer, Discuss, and Add into deep links that preserve identity, Heichel, series, and name.
 */
import { buildPostReferenceUrl } from '../../../../../social-actions/PostReferenceUrl.js';
import { currentAlias } from './social-action-context.js';

export function answerUrl(item, appState) {
	return composerUrl({
		heichel: appState.heichelId,
		series: appState.currentSeries || 'root',
		question: item.id || item.postId,
		alias: currentAlias(),
		presentation: 'answer',
		return: location.pathname + location.search
	});
}

export function discussionUrl(item, appState) {
	const query = new URLSearchParams({
		heichel: appState.heichelId,
		post: item.id || item.postId,
		series: appState.currentSeries || 'root',
		title: item.title || 'Conversation',
		kind: item.contentType || item.postType || 'post'
	});
	const alias = currentAlias();
	if (alias) query.set('alias', alias);
	return `/comment-thread/?${query.toString()}`;
}

export function addReferenceUrl(item, appState) {
	return buildPostReferenceUrl({
		aliasId: currentAlias(),
		sourceType: item.contentType || item.postType || 'post',
		sourceId: item.id || item.postId,
		sourceHeichel: appState.heichelId,
		sourceSeries: appState.currentSeries || 'root',
		sourceAlias: item.aliasId || item.author || '',
		returnPath: location.pathname + location.search
	});
}

function composerUrl(values) {
	const query = new URLSearchParams();
	for (const [key, value] of Object.entries(values)) {
		if (value) query.set(key, value);
	}
	return `/social-composer/?${query.toString()}`;
}
