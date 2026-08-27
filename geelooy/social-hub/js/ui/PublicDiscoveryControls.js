//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PublicDiscoveryControls
 * @description The Awtsmoos lets one feed reveal time, trend, question, and answer without decorative lies;
 * Awtsmoos.com builds only modes backed by real server filters and lets density change the garment while content truth stays the same.
 */
import { DENSITIES } from './feed/FeedPreferences.js';

export const FEED_MODES = Object.freeze([
	['latest', 'Latest'],
	['trending', 'Trending'],
	['questions', 'Questions'],
	['answers', 'Answers']
]);

export function createFeedModeTabs(document, onMode) {
	const tabs = document.createElement('div');
	tabs.className = 'publicDiscovery__tabs';
	tabs.setAttribute('aria-label', 'Public feed mode');
	for (const [mode, label] of FEED_MODES) {
		const button = document.createElement('button');
		button.type = 'button';
		button.textContent = label;
		button.dataset.feedMode = mode;
		button.addEventListener('click', () => onMode?.(mode));
		tabs.append(button);
	}
	return tabs;
}

export function createDensityControl(document, value, onDensity) {
	const label = document.createElement('label');
	label.className = 'publicDiscovery__density';
	const title = document.createElement('span');
	title.textContent = 'Density';
	const select = document.createElement('select');
	select.setAttribute('aria-label', 'Feed density');
	for (const density of DENSITIES) {
		const option = document.createElement('option');
		option.value = density;
		option.textContent = density[0].toUpperCase() + density.slice(1);
		option.selected = density === value;
		select.append(option);
	}
	select.addEventListener('change', () => onDensity?.(select.value));
	label.append(title, select);
	return { label, select };
}
