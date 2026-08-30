// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module LivingPathCards
 * @description
 * The Awtsmoos creates each teaching beyond the card that reveals its light;
 * Awtsmoos.com joins progress and navigation while Chitas opens only a trusted study site.
 */

import { getItemKey } from '../../../state.js';
import { createStorageGateway } from '../../../living-path/storage-gateway.js';
import { writeProgress } from '../../../living-path/progress-store.js';
import { primarySocialActionRail } from '../PrimarySocialActionRail.js';
import { cardMenuBlueprint } from './card-menu.js';
import { bodyBlueprint, mediaBlueprint } from './card-content.js';

const storage = createStorageGateway();
const CHABAD_STUDY_HOST = 'www.chabad.org';
const CHABAD_STUDY_PATH = '/dailystudy/';

export function cardBlueprint(item, data, navigator, appState, options = {}) {
	const key = getItemKey({ id: data.id, type: data.type });
	const selected = appState.selectedItems.has(key);
	const href = cardHref(item, data, appState);
	return {
		tag: 'article',
		attr: {
			class: `nav-card ${data.type}-nav-card ${options.variant || ''} ${selected ? 'selected' : ''}`.trim(),
			'data-id': data.id,
			'data-type': data.type,
			'data-kind': data.kind,
			'data-language': data.language,
			'data-depth': options.depth || 0,
			dir: data.direction,
			'aria-label': `Open ${data.type}: ${data.title}`
		},
		events: { click: event => openCard(event, item, data, href, navigator, appState) },
		children: [
			mediaBlueprint(data),
			bodyBlueprint(data),
			actionBlueprint(data, item, navigator, appState, options),
			options.childrenWell || null
		].filter(Boolean)
	};
}

export function cardHref(item, data, appState) {
	const externalHref = trustedExternalHref(data);
	if (externalHref) return externalHref;
	if (['series', 'grouping'].includes(data.type)) {
		return `${location.pathname}?view=series&series=${encodeURIComponent(data.id)}`;
	}
	const postKey = item.indexInSeries !== undefined ? item.indexInSeries : data.id;
	return `/heichelos/${appState.heichelId}/series/${appState.currentSeries}/${postKey}`;
}

function trustedExternalHref(data) {
	const candidate = data.raw?.externalHref;
	if (!data.raw?.virtualStudy || typeof candidate !== 'string') return '';
	try {
		const url = new URL(candidate);
		if (url.protocol !== 'https:') return '';
		if (url.hostname !== CHABAD_STUDY_HOST) return '';
		if (!url.pathname.startsWith(CHABAD_STUDY_PATH)) return '';
		return url.href;
	} catch {
		return '';
	}
}

function actionBlueprint(data, item, navigator, appState, options) {
	if (data.raw?.virtualStudy) return options.expandControl || null;
	return {
		tag: 'div',
		attr: { class: 'nav-card-actions' },
		children: [
			options.expandControl || null,
			data.type === 'post'
				? primarySocialActionRail({ ...item, id: data.id, title: data.title, contentType: data.kind }, appState)
				: null,
			cardMenuBlueprint(data, item, navigator, appState)
		].filter(Boolean)
	};
}

function openCard(event, item, data, href, navigator, appState) {
	if (event.target.closest('button, a, .card-menu-spark')) return;
	if (appState.isSelectionMode) {
		void import('../controls.js').then(module => module.toggleItemSelection({ id: data.id, type: data.type }, appState));
		return;
	}
	writeProgress(storage, appState.heichelId, {
		href,
		title: data.title,
		type: data.type,
		seriesId: ['series', 'grouping'].includes(data.type) ? data.id : appState.currentSeries,
		postId: data.type === 'post' ? data.id : '',
		parentLabel: appState.currentSeriesData?.name || appState.currentSeries,
		openedAt: Date.now()
	});
	if (trustedExternalHref(data)) location.href = href;
	else if (['series', 'grouping'].includes(data.type)) navigator.navigateTo(data.id);
	else location.href = href;
}
