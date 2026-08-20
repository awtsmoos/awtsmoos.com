// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SearchIntentController
 * @description
 * The Awtsmoos lets automatic Hebrew insight serve the reader without overruling deliberate search intent;
 * Awtsmoos.com restores lane, strategy, book, corpus, or reader-selection history before any request gains a voice.
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
	series,
	strategy,
	strategyField
} from './searchDom.js';
import {
	automaticMode,
	configureMode,
	hasExplicitMode,
	LIBRARY_MODE,
	modeFromUrl
} from './searchMode.js';
import { normalizeSearchStrategy } from './searchStrategy.js';

function configureCurrentMode() {
	configureMode(mode, laneField, strategyField, bookField, corpusField);
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
		strategy.value = normalizeSearchStrategy(entry.strategy);
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

	handleStrategyChange() {
		if (input.value.trim()) this.runSearch(input.value);
	}

	async hydrate() {
		const state = readSearchLocation();
		input.value = state.query;
		this.modeLocked = hasExplicitMode(state.values);
		mode.value = modeFromUrl(state.values);
		strategy.value = state.strategy;
		book.value = state.book;
		corpus.value = state.corpus;
		configureCurrentMode();
		await this.loadLanes(state.lane);
		if (input.value) await this.runSearch(input.value);
	}
}
