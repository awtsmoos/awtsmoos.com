// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LivingPathDiscoveryRenderer
 * @description
 * The Awtsmoos renews recent study and nearby branches from stable identity rather than yesterday's rendered typography;
 * Awtsmoos.com keeps Continue Learning bilingual, readable, and backward-compatible while internal route keys remain concealed.
 */

import { DOMElements } from '../../../dom.js';
import { relatedRecordsForView } from '../../../living-path/discovery-policy.js?v=heichel-mobile-010';
import {
	progressParentPair,
	progressTitlePair
} from '../../../living-path/progress-identity.js?v=heichel-mobile-011';
import { ScribeOfManifestation } from '../../../engine/scribe-of-manifestation.js';
import { normalizeCardData } from '../cardData.js?v=heichel-mobile-011';

export function renderContinue(entry) {
	const card = DOMElements.continueCard;
	if (!card) {
		return;
	}
	const current = `${location.pathname}${location.search}`;
	const visible = Boolean(
		entry?.href
		&& (entry?.title || entry?.titleHe || entry?.titleEn)
		&& entry.href !== current
	);
	card.classList.toggle('hidden', !visible);
	if (!visible) {
		return;
	}
	DOMElements.continueTitle.textContent = progressTitlePair(entry).display;
	DOMElements.continueMeta.textContent = continueMeta(entry);
	DOMElements.continueLink.href = entry.href;
}

export function renderRelated(content, navigator, currentView) {
	const section = DOMElements.relatedSection;
	const list = DOMElements.relatedList;
	if (!section || !list) {
		return;
	}
	const records = relatedRecordsForView(content, currentView);
	section.classList.toggle('hidden', !records.length);
	list.replaceChildren();
	for (const item of records) {
		const data = normalizeCardData(item, 'series');
		list.appendChild(
			ScribeOfManifestation.manifest(
				relatedCard(data, navigator)
			)
		);
	}
}

function continueMeta(entry) {
	if (!entry.parentLabel && !entry.parentSeriesId) {
		return 'Opened recently';
	}
	return `${progressParentPair(entry).display} · opened recently`;
}

function relatedCard(data, navigator) {
	return {
		tag: 'button',
		attr: {
			type: 'button',
			class: 'living-related-card',
			dir: data.direction
		},
		children: [
			{ tag: 'span', attr: { class: 'living-related-mark', 'aria-hidden': 'true' }, children: ['⌁'] },
			{ tag: 'strong', children: [data.title] },
			{ tag: 'small', children: [`${data.subSeriesCount} sub-series · ${data.postCount} posts`] },
			{ tag: 'span', attr: { 'aria-hidden': 'true' }, children: ['›'] }
		],
		events: {
			click: () => navigator.navigateTo(data.id)
		}
	};
}

export function updateResultStatus(counts, appState) {
	const count = counts?.[appState.currentView] || 0;
	if (DOMElements.resultCount) {
		DOMElements.resultCount.textContent = `${count} ${count === 1 ? 'result' : 'results'}`;
	}
	if (DOMElements.searchScopeStatus) {
		DOMElements.searchScopeStatus.textContent = appState.livingPath.searchScope === 'currentView'
			? 'Current view'
			: 'This branch';
	}
}

export function updateProfileContext(appState) {
	if (!DOMElements.profileCompactContext) {
		return;
	}
	const posts = appState.currentContent?.posts?.length || 0;
	const series = appState.currentContent?.subSeries?.length || 0;
	DOMElements.profileCompactContext.textContent = `${posts} teachings · ${series} series`;
}
