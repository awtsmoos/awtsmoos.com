// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module LivingPathCards
 * @description
 * The Awtsmoos lets every teaching open inside its own Awtsmoos vessel, including date-born Chitas windows;
 * Awtsmoos.com preserves progress and social action while refusing to exile native Torah through an external door.
 */

import { getItemKey } from '../../../state.js';
import { createStorageGateway } from '../../../living-path/storage-gateway.js';
import { writeProgress } from '../../../living-path/progress-store.js';
import { primarySocialActionRail } from '../PrimarySocialActionRail.js';
import { cardMenuBlueprint } from './card-menu.js';
import { bodyBlueprint, mediaBlueprint } from './card-content.js';

const storage = createStorageGateway();

export function cardBlueprint(item, data, navigator, appState, options = {}) {
	const key = getItemKey({ id: data.id, type: data.type });
	const selected = appState.selectedItems.has(key);
	const href = cardHref(item, data, appState);
	return {
		tag: 'article',
		attr: {
			class: `nav-card ${data.type}-nav-card ${data.raw?.chitasStudy ? 'chitas-study-card' : ''} ${options.variant || ''} ${selected ? 'selected' : ''}`.trim(),
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
	if (['series', 'grouping'].includes(data.type)) {
		return `${location.pathname}?view=series&series=${encodeURIComponent(data.id)}`;
	}
	if (data.raw?.chitasStudy) {
		const params = new URLSearchParams(location.search);
		params.set('chitasDate', data.raw.date);
		if (!params.has('chitasLang')) params.set('chitasLang', 'en');
		return `/heichelos/${encodeURIComponent(appState.heichelId)}/series/daily-chitas/post/${encodeURIComponent(data.id)}?${params}`;
	}
	const postKey = item.indexInSeries !== undefined ? item.indexInSeries : data.id;
	return `/heichelos/${appState.heichelId}/series/${appState.currentSeries}/${postKey}`;
}

function actionBlueprint(data, item, navigator, appState, options) {
	return {
		tag: 'div',
		attr: { class: 'nav-card-actions' },
		children: [
			options.expandControl || null,
			data.type === 'post'
				? primarySocialActionRail({ ...item, id: data.id, title: data.title, contentType: data.kind }, appState)
				: null,
			data.raw?.chitasStudy ? null : cardMenuBlueprint(data, item, navigator, appState)
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
	if (['series', 'grouping'].includes(data.type)) navigator.navigateTo(data.id);
	else location.href = href;
}
