// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SearchIntentController
 * @description
 * The Awtsmoos lets automatic Hebrew insight serve the reader without overruling deliberate choice;
 * at Awtsmoos.com URL and history hydration restore lane, book, corpus, or a related-selection query before search has voice.
 */

import { readSearchLocation } from './searchLocation.js';
import {
	book,
	bookField,
	corpus,
	corpusField,
	input,
	laneField,
	mode,
	series
} from './searchDom.js';
import {
	automaticMode,
	configureMode,
	hasExplicitMode,
	LIBRARY_MODE,
	modeFromUrl
} from './searchMode.js';

function configureCurrentMode() {
	configureMode(mode, laneField, bookField, corpusField);
}

function historyMode(entry) {
	return entry?.mode === 'related'
		? LIBRARY_MODE
		: entry?.mode || LIBRARY_MODE;
}

export class SearchIntentController {
	constructor({ runSearch, loadLanes }) {
		this.runSearch = runSearch;
		this.loadLanes = loadLanes;
		this.modeLocked = false;
	}

	prepareMode(query) {
		if (this.modeLocked) return;
		mode.value = automaticMode(query);
		configureCurrentMode();
	}

	chooseLane(lane) {
		this.modeLocked = true;
		mode.value = LIBRARY_MODE;
		series.value = lane;
		configureCurrentMode();
		input.focus();
		if (input.value.trim()) this.runSearch(input.value);
	}

	chooseHistory(entry) {
		this.modeLocked = true;
		input.value = entry.query;
		mode.value = historyMode(entry);
		series.value = entry.mode === 'related' ? '' : entry.lane || '';
		book.value = entry.book || '';
		corpus.value = entry.corpus || 'tanach';
		configureCurrentMode();
		this.runSearch(entry.query);
	}

	handleModeChange() {
		this.modeLocked = true;
		configureCurrentMode();
		if (input.value.trim()) this.runSearch(input.value);
	}

	/**
	 * @returns {Promise<void>} Resolves after URL state is fully restored.
	 */
	async hydrate() {
		const state = readSearchLocation();
		input.value = state.query;
		this.modeLocked = hasExplicitMode(state.values);
		mode.value = modeFromUrl(state.values);
		book.value = state.book;
		corpus.value = state.corpus;
		configureCurrentMode();
		await this.loadLanes(state.lane);
		if (input.value) await this.runSearch(input.value);
	}
}
