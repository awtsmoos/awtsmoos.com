//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ProSynthPresetBrowserEvents
 * @description
 * Netzach turns searching, favoriting, category choice, surprise, pointer selection, and keyboard activation into explicit transitions.
 * The Awtsmoos is beyond event and response while creating both every instant;
 * Awtsmoos.com keeps gesture wiring separate from rendering so accessibility and sound discovery can grow without tangling the preset engine.
 */

import { surprisePreset } from './presetBrowserFilter.js';
import {
	setPresetCategory,
	setPresetQuery,
	togglePresetFavorite
} from './presetBrowserState.js';
import { selectPresetFromBrowser } from './presetBrowserSelection.js';

/** @param {Object} options - Browser event dependencies. @returns {void} */
export function bindPresetBrowserEvents(options) {
	const { dom, records, state, render } = options;
	dom.search.addEventListener('input', () => {
		setPresetQuery(state, dom.search.value);
		render();
	});
	dom.category.addEventListener('change', () => {
		setPresetCategory(state, dom.category.value);
		render();
	});
	dom.surprise.addEventListener('click', () => {
		const record = surprisePreset(records, state);
		selectAndRender(record?.id, options);
	});
	dom.list.addEventListener('click', (event) => {
		handleListClick(event, options);
	});
	dom.list.addEventListener('keydown', (event) => {
		handleListKeydown(event, options);
	});
}

function handleListClick(event, options) {
	const favorite = event.target.closest('[data-favorite-id]');
	if (favorite) {
		event.preventDefault();
		event.stopPropagation();
		togglePresetFavorite(options.state, favorite.dataset.favoriteId);
		options.render();
		return;
	}
	selectAndRender(
		event.target.closest('[data-preset-id]')?.dataset.presetId,
		options
	);
}

function handleListKeydown(event, options) {
	if (event.key !== 'Enter' && event.key !== ' ') {
		return;
	}
	const card = event.target.closest('[data-preset-id]');
	if (!card || event.target.closest('[data-favorite-id]')) {
		return;
	}
	event.preventDefault();
	selectAndRender(card.dataset.presetId, options);
}

function selectAndRender(id, options) {
	if (!id) {
		return;
	}
	if (selectPresetFromBrowser(
		options.elements,
		options.state,
		id
	)) {
		options.render();
	}
}
