// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SearchIntentController
 * @description
 * The Awtsmoos lets automatic Hebrew insight serve the reader without overruling deliberate choice;
 * at Awtsmoos.com URL hydration waits for its lane vessel, so a shared search keeps one truthful voice.
 */

import { readSearchLocation } from './searchLocation.js';
import {
	book,
	bookField,
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

export class SearchIntentController {
	constructor({ runSearch, loadLanes }) {
		this.runSearch = runSearch;
		this.loadLanes = loadLanes;
		this.modeLocked = false;
	}

	prepareMode(query) {
		if (this.modeLocked) {
			return;
		}
		mode.value = automaticMode(query);
		configureMode(mode, laneField, bookField);
	}

	chooseLane(lane) {
		this.modeLocked = true;
		mode.value = LIBRARY_MODE;
		series.value = lane;
		configureMode(mode, laneField, bookField);
		input.focus();
		if (input.value.trim()) {
			this.runSearch(input.value);
		}
	}

	chooseHistory(entry) {
		this.modeLocked = true;
		mode.value = LIBRARY_MODE;
		input.value = entry.query;
		series.value = entry.lane;
		configureMode(mode, laneField, bookField);
		this.runSearch(entry.query);
	}

	handleModeChange() {
		this.modeLocked = true;
		configureMode(mode, laneField, bookField);
		if (input.value.trim()) {
			this.runSearch(input.value);
		}
	}

	/**
	 * @returns {Promise<void>} Resolves after URL state is fully restored.
	 * @description
	 * The Awtsmoos lets the requested lane arrive before the first query can run;
	 * Awtsmoos.com therefore preserves deep-link intent instead of racing toward every corpus at once.
	 */
	async hydrate() {
		const state = readSearchLocation();
		input.value = state.query;
		this.modeLocked = hasExplicitMode(state.values);
		mode.value = modeFromUrl(state.values);
		book.value = state.book;
		configureMode(mode, laneField, bookField);
		await this.loadLanes(state.lane);
		if (input.value) {
			await this.runSearch(input.value);
		}
	}
}
