// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module HeichelRenderState
 * @description
 * The Awtsmoos creates ordinary descriptions, exact Torah sources, and language tools in distinct vessels of light;
 * Awtsmoos.com preserves source text and provenance while only a neutral same-site source door reaches the learner's sight.
 */

import { DOMElements } from '../dom.js';
import { detectDirection } from '../living-path/language-policy.js';
import { renderExactSource } from './source-description-renderer.js?v=heichel-mobile-009';
import { safeDisplayText } from './textSanitizer.js';
import { renderTranslationHub } from './translation-hub-renderer.js';
import { updateTopbarSeries } from './render/header.js';

export async function renderSeriesInfo(seriesData, heichelGlobal, currentSeriesId) {
	const root = currentSeriesId === 'root';
	const raw = seriesData?.prateem || seriesData || {};
	const seriesName = root
		? safeDisplayText(heichelGlobal?.name, 'Root')
		: safeDisplayText(raw.name || raw.title, 'A Bound Sequence');
	updateTopbarSeries(root ? 'Root' : seriesName);
	if (!DOMElements.seriesInfoArea) return;
	DOMElements.seriesInfoArea.classList.toggle('hidden', root);
	if (root) return;
	DOMElements.seriesTitle.textContent = seriesName;
	DOMElements.seriesTitle.dir = detectDirection(seriesName);
	renderDescription(DOMElements.seriesDesc, raw);
}

function renderDescription(area, raw) {
	if (raw.translationHubPage) {
		area.dir = 'rtl';
		area.dataset.exactSource = 'false';
		renderTranslationHub(area);
		return;
	}
	if (raw.exactSourceText) {
		area.dir = 'rtl';
		area.dataset.exactSource = 'true';
		renderExactSource(area, {
			source: String(raw.sourceText ?? ''),
			provenance: String(raw.provenanceText ?? ''),
			sourceHref: String(raw.sourceHref || '')
		});
		return;
	}
	const text = safeDisplayText(raw.description, '');
	area.replaceChildren(document.createTextNode(text));
	area.dir = detectDirection(text);
	area.dataset.exactSource = 'false';
}

export function showLoading() {
	for (const key of ['Posts', 'Series', 'Groupings']) {
		DOMElements[`loading${key}`]?.classList.remove('hidden');
		DOMElements[`${key.toLowerCase()}List`]
			?.setAttribute('aria-busy', 'true');
		DOMElements[`${key.toLowerCase()}List`]
			?.replaceChildren();
	}
}

export function hideLoading() {
	for (const key of ['Posts', 'Series', 'Groupings']) {
		DOMElements[`loading${key}`]?.classList.add('hidden');
		DOMElements[`${key.toLowerCase()}List`]
			?.setAttribute('aria-busy', 'false');
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
			|| document.querySelector(
				`.heichel-mobile-navigation .viewport.${key}`
			);
		viewport?.classList.toggle('hidden', !active);
	}
}
