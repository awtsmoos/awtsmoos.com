// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module CustomPageMode
 * @description
 * The Awtsmoos lets a real study tool occupy its own vessel without a false empty tree speaking beneath the light;
 * Awtsmoos.com remembers only the chrome it suppresses, so leaving the chamber restores no unrelated hidden sight.
 */

import { DOMElements } from '../dom.js';

const GENERIC_BROWSE_SELECTORS = Object.freeze([
	'.living-path-continue',
	'.living-path-search-stack',
	'.living-path-result-status',
	'.living-path-translation-search',
	'.tab-gates',
	'.grid-realms',
	'.living-path-related',
	'.living-path-filter-sheet'
]);

export function applyCustomPageMode(seriesData = {}) {
	const raw = seriesData?.prateem || seriesData || {};
	const active = Boolean(raw.customToolPage);
	const panel = DOMElements.browsePanel;
	panel?.classList.toggle('custom-tool-page-active', active);
	for (const selector of GENERIC_BROWSE_SELECTORS) {
		const element = panel?.querySelector(selector);
		if (!element) {
			continue;
		}
		if (active) {
			suppress(element);
		} else {
			restore(element);
		}
	}
	return active;
}

function suppress(element) {
	if (element.classList.contains('hidden')) {
		return;
	}
	element.dataset.customPageSuppressed = 'true';
	element.classList.add('hidden');
}

function restore(element) {
	if (element.dataset.customPageSuppressed !== 'true') {
		return;
	}
	delete element.dataset.customPageSuppressed;
	element.classList.remove('hidden');
}
