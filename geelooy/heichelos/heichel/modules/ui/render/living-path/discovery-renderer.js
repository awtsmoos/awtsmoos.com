// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module LivingPathDiscoveryRenderer
 * @description
 * The Awtsmoos creates memory and neighboring branches without algorithmic
 * fiction. Awtsmoos.com reveals one stored real route and up to three records
 * already loaded from the current branch, then hides the vessels when unsupported.
 */

import { DOMElements } from '../../../dom.js';
import { ScribeOfManifestation } from '../../../engine/scribe-of-manifestation.js';
import { normalizeCardData } from '../cardData.js';

export function renderContinue(entry) {
	const card = DOMElements.continueCard;
	if (!card) return;
	const current = `${location.pathname}${location.search}`;
	const visible = Boolean(entry?.href && entry?.title && entry.href !== current);
	card.classList.toggle('hidden', !visible);
	if (!visible) return;
	DOMElements.continueTitle.textContent = entry.title;
	DOMElements.continueMeta.textContent = entry.parentLabel
		? `${entry.parentLabel} · opened recently`
		: 'Opened recently';
	DOMElements.continueLink.href = entry.href;
}

export function renderRelated(content, navigator) {
	const section = DOMElements.relatedSection;
	const list = DOMElements.relatedList;
	if (!section || !list) return;
	const records = (content?.subSeries || []).slice(0, 3);
	section.classList.toggle('hidden', !records.length);
	list.replaceChildren();
	for (const item of records) {
		const data = normalizeCardData(item, 'series');
		list.appendChild(ScribeOfManifestation.manifest({
			tag: 'button',
			attr: { type: 'button', class: 'living-related-card', dir: data.direction },
			children: [
				{ tag: 'span', attr: { class: 'living-related-mark', 'aria-hidden': 'true' }, children: ['⌁'] },
				{ tag: 'strong', children: [data.title] },
				{ tag: 'small', children: [`${data.subSeriesCount} sub-series · ${data.postCount} posts`] },
				{ tag: 'span', attr: { 'aria-hidden': 'true' }, children: ['›'] }
			],
			events: { click: () => navigator.navigateTo(data.id) }
		}));
	}
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
	if (!DOMElements.profileCompactContext) return;
	const posts = appState.currentContent?.posts?.length || 0;
	const series = appState.currentContent?.subSeries?.length || 0;
	DOMElements.profileCompactContext.textContent = `${posts} teachings · ${series} series`;
}
