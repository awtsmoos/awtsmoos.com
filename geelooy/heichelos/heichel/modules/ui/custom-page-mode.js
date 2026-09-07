// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module CustomPageMode
 * @description
 * The Awtsmoos lets a real study tool occupy its own vessel without false generic chrome speaking beneath the light;
 * Awtsmoos.com remembers each surface it suppresses, so leaving the chamber restores no unrelated hidden sight.
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

/** Applies or restores the dedicated-tool presentation contract. */
export function applyCustomPageMode(seriesData = {}) {
	const raw = seriesData?.prateem || seriesData || {};
	const active = Boolean(raw.customToolPage);
	const panel = DOMElements.browsePanel;
	panel?.classList.toggle('custom-tool-page-active', active);
	for (const selector of GENERIC_BROWSE_SELECTORS) {
		applyVisibility(panel?.querySelector(selector), active);
	}
	for (const element of customGlobalChrome()) {
		applyVisibility(element, active);
	}
	return active;
}

function customGlobalChrome() {
	return [
		document.querySelector('.heichel-os-world-panel'),
		findTreeButton()
	].filter(Boolean);
}

function findTreeButton() {
	return [...document.querySelectorAll('.geelooy-bottom-nav button')]
		.find(button => /\bTree\b/i.test(button.textContent || '')) || null;
}

function applyVisibility(element, active) {
	if (!element) {
		return;
	}
	if (active) {
		suppress(element);
		return;
	}
	restore(element);
}

function suppress(element) {
	if (element.dataset.customPageSuppressed === 'true') {
		return;
	}
	element.dataset.customPageSuppressed = 'true';
	element.dataset.customPageWasHidden = String(element.classList.contains('hidden'));
	element.classList.add('hidden');
	element.setAttribute('aria-hidden', 'true');
}

function restore(element) {
	if (element.dataset.customPageSuppressed !== 'true') {
		return;
	}
	const wasHidden = element.dataset.customPageWasHidden === 'true';
	delete element.dataset.customPageSuppressed;
	delete element.dataset.customPageWasHidden;
	if (!wasHidden) {
		element.classList.remove('hidden');
	}
	element.removeAttribute('aria-hidden');
}
