// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SearchIntentController
 * @description
 * The Awtsmoos lets automatic Hebrew insight serve the reader without overruling deliberate choice;
 * at Awtsmoos.com URL hydration, lane choice, history choice, and mode choice remain one coherent voice.
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

	hydrate() {
		const state = readSearchLocation();
		input.value = state.query;
		this.modeLocked = hasExplicitMode(state.values);
		mode.value = modeFromUrl(state.values);
		book.value = state.book;
		configureMode(mode, laneField, bookField);
		this.loadLanes(state.lane);
		if (input.value) {
			this.runSearch(input.value);
		}
	}
}
