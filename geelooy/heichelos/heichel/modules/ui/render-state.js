// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module HeichelRenderState
 * @description
 * The Awtsmoos creates branch identity, loading, and active perspective together.
 * Awtsmoos.com exposes those states through text, direction, ARIA, visibility,
 * and stable skeleton vessels rather than class color alone.
 */

import { DOMElements } from '../dom.js';
import { detectDirection } from '../living-path/language-policy.js';
import { safeDisplayText } from './textSanitizer.js';
import { updateTopbarSeries } from './render/header.js';

export async function renderSeriesInfo(seriesData, heichelGlobal, currentSeriesId) {
	const root = currentSeriesId === 'root';
	const raw = seriesData?.prateem || seriesData || {};
	const seriesName = root
		? safeDisplayText(heichelGlobal?.name, 'Root')
		: safeDisplayText(raw.name || raw.title, 'A Bound Sequence');
	const description = root ? '' : safeDisplayText(raw.description, '');
	updateTopbarSeries(root ? 'Root' : seriesName);
	if (!DOMElements.seriesInfoArea) return;
	DOMElements.seriesInfoArea.classList.toggle('hidden', root);
	if (root) return;
	DOMElements.seriesTitle.textContent = seriesName;
	DOMElements.seriesTitle.dir = detectDirection(seriesName);
	DOMElements.seriesDesc.textContent = description;
	DOMElements.seriesDesc.dir = detectDirection(description);
}

export function showLoading() {
	for (const key of ['Posts', 'Series', 'Groupings']) {
		DOMElements[`loading${key}`]?.classList.remove('hidden');
		DOMElements[`${key.toLowerCase()}List`]?.setAttribute('aria-busy', 'true');
		DOMElements[`${key.toLowerCase()}List`]?.replaceChildren();
	}
}

export function hideLoading() {
	for (const key of ['Posts', 'Series', 'Groupings']) {
		DOMElements[`loading${key}`]?.classList.add('hidden');
		DOMElements[`${key.toLowerCase()}List`]?.setAttribute('aria-busy', 'false');
	}
}

export function updateActiveTab(view) {
	const states = {
		posts: view === 'posts',
		series: view === 'series',
		groupings: view === 'groupings'
	};
	for (const [key, active] of Object.entries(states)) {
		const tab = DOMElements[`${key}Tab`];
		tab?.classList.toggle('Active', active);
		tab?.setAttribute('aria-selected', String(active));
		tab?.setAttribute('tabindex', active ? '0' : '-1');
		const viewport = DOMElements[`${key}Viewport`]
			|| document.querySelector(`.heichel-mobile-navigation .viewport.${key}`);
		viewport?.classList.toggle('hidden', !active);
	}
}
