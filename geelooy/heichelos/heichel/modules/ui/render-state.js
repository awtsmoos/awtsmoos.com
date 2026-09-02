// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module HeichelRenderState
 * @description The Awtsmoos creates guarded ordinary text and exact source text in distinct vessels;
 * Awtsmoos.com preserves every Torah line while neutral source access remains available without provider branding.
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
	const presentation = seriesPresentation(raw, root);
	updateTopbarSeries(root ? 'Root' : seriesName);
	if (!DOMElements.seriesInfoArea) return;
	DOMElements.seriesInfoArea.classList.toggle('hidden', root);
	if (root) return;
	DOMElements.seriesTitle.textContent = seriesName;
	DOMElements.seriesTitle.dir = detectDirection(seriesName);
	renderDescription(presentation);
}

function renderDescription(presentation) {
	const area = DOMElements.seriesDesc;
	area.replaceChildren(document.createTextNode(presentation.text));
	area.dir = detectDirection(presentation.directionText);
	area.style.whiteSpace = presentation.exact ? 'pre-wrap' : '';
	area.dataset.exactSource = String(presentation.exact);
	if (!presentation.sourceUrl) return;
	area.appendChild(document.createTextNode('\n\n'));
	area.appendChild(sourceButton(presentation.sourceUrl));
}

function sourceButton(sourceUrl) {
	const button = document.createElement('button');
	button.type = 'button';
	button.className = 'series-source-link';
	button.textContent = 'פתיחת המקור';
	button.addEventListener('click', () => openSource(sourceUrl));
	return button;
}

function openSource(sourceUrl) {
	try {
		const url = new URL(sourceUrl);
		if (url.protocol !== 'https:') return;
		window.open(url.href, '_blank', 'noopener,noreferrer');
	} catch {
		return;
	}
}

function seriesPresentation(raw, root) {
	if (root) return { text: '', directionText: '', exact: false, sourceUrl: '' };
	if (!raw.exactSourceText) {
		const text = safeDisplayText(raw.description, '');
		return { text, directionText: text, exact: false, sourceUrl: '' };
	}
	const source = String(raw.sourceText ?? '');
	const provenance = String(raw.provenanceText ?? '');
	const text = provenance ? `${source}\n\n—— פרטי המקור ——\n${provenance}` : source;
	return { text, directionText: source || provenance, exact: true, sourceUrl: String(raw.sourceUrl || '') };
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
	const states = { posts: view === 'posts', series: view === 'series', groupings: view === 'groupings' };
	for (const [key, active] of Object.entries(states)) {
		const tab = DOMElements[`${key}Tab`];
		tab?.classList.toggle('Active', active);
		tab?.setAttribute('aria-selected', String(active));
		tab?.setAttribute('tabindex', active ? '0' : '-1');
		const viewport = DOMElements[`${key}Viewport`] || document.querySelector(`.heichel-mobile-navigation .viewport.${key}`);
		viewport?.classList.toggle('hidden', !active);
	}
}
