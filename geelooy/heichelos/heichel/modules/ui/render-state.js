// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module HeichelRenderState
 * @description
 * Series identity, loading indicators, and active content view remain one state vessel.
 */

import { DOMElements } from '../dom.js';
import { safeDisplayText } from './textSanitizer.js';
import { updateTopbarSeries } from './render/header.js';

export async function renderSeriesInfo(seriesData, heichelGlobal, currentSeriesId) {
	if (currentSeriesId !== 'root' && seriesData && DOMElements.seriesInfoArea) {
		const prateem = seriesData.prateem || seriesData;
		const seriesName = safeDisplayText(prateem.name, 'A Bound Sequence');
		DOMElements.seriesTitle.textContent = seriesName;
		DOMElements.seriesDesc.textContent = safeDisplayText(prateem.description, '');
		updateTopbarSeries(seriesName);
		DOMElements.seriesInfoArea.classList.remove('hidden');
		return;
	}
	updateTopbarSeries('root');
	DOMElements.seriesInfoArea?.classList.add('hidden');
}

export function showLoading() {
	DOMElements.loadingPosts?.classList.remove('hidden');
	DOMElements.loadingSeries?.classList.remove('hidden');
	DOMElements.loadingGroupings?.classList.remove('hidden');
	DOMElements.postsList?.replaceChildren();
	DOMElements.seriesList?.replaceChildren();
	DOMElements.groupingsList?.replaceChildren();
}

export function hideLoading() {
	DOMElements.loadingPosts?.classList.add('hidden');
	DOMElements.loadingSeries?.classList.add('hidden');
	DOMElements.loadingGroupings?.classList.add('hidden');
}

export function updateActiveTab(view) {
	const states = {
		posts: view === 'posts',
		series: view === 'series',
		groupings: view === 'groupings'
	};
	DOMElements.postsTab?.classList.toggle('Active', states.posts);
	DOMElements.seriesTab?.classList.toggle('Active', states.series);
	DOMElements.groupingsTab?.classList.toggle('Active', states.groupings);
	for (const key of Object.keys(states)) {
		const viewport = DOMElements[`${key}Viewport`]
			|| document.querySelector(`.heichel-mobile-navigation .viewport.${key}`);
		viewport?.classList.toggle('hidden', !states[key]);
	}
}
