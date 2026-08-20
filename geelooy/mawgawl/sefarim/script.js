// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LivingLibrarySearchController
 * @description
 * The Awtsmoos lets the question stand in front while deeper coordinates wait nearby;
 * Awtsmoos.com preserves every search path without presenting every dial all at once.
 */
import { renderLaneDirectory } from './discoveryView.js';
import { renderSearchHistory } from './historyView.js';
import { searchByMode } from './modeSearch.js';
import { SearchControlDisclosure } from './SearchControlDisclosure.js';
import { SearchIntentController } from './SearchIntentController.js';
import { bindSearchControls } from './searchBindings.js';
import { clearSearchHistory, readSearchHistory, rememberSearch } from './searchHistory.js';
import { fetchLibraryLanes } from './searchApi.js';
import {
	book, clearHistoryButton, corpus, form, historyFilter, input,
	laneCount, laneDirectory, mode, recentSearches, results, series,
	status, strategy
} from './searchDom.js';
import { replaceSearchLocation } from './searchLocation.js';
import { addLane, renderFailure, setSearching } from './searchView.js';

let intentController;

async function loadLanes(selectedLane = '') {
	try {
		const lanes = await fetchLibraryLanes();
		lanes.forEach(lane => addLane(series, lane));
		if (selectedLane) {
			series.value = selectedLane;
		}
		renderLaneDirectory({
			lanes,
			container: laneDirectory,
			count: laneCount,
			onChoose: lane => intentController.chooseLane(lane)
		});
	} catch {
		laneCount.textContent = 'Unavailable';
	}
}

function renderHistory(entries = readSearchHistory()) {
	renderSearchHistory({
		entries,
		container: recentSearches,
		filter: historyFilter.value,
		onChoose: entry => intentController.chooseHistory(entry)
	});
	clearHistoryButton.disabled = entries.length === 0;
}

function currentState(query) {
	return {
		query,
		mode: mode.value,
		strategy: strategy.value,
		lane: series.value,
		book: book.value.trim(),
		corpus: corpus.value
	};
}

function rememberCurrentSearch(query) {
	return rememberSearch({
		...currentState(query),
		category: mode.value,
		origin: 'search-page'
	});
}

async function runSearch(query) {
	const normalizedQuery = String(query || '').trim();
	if (!normalizedQuery) {
		return;
	}
	document.body.dataset.searchActive = 'true';
	intentController.prepareMode(normalizedQuery);
	setSearching(form, true);
	results.replaceChildren();
	const state = currentState(normalizedQuery);
	replaceSearchLocation(state);
	renderHistory(rememberCurrentSearch(normalizedQuery));
	try {
		await searchByMode({ ...state, results, status });
	} catch (error) {
		renderFailure({ message: error.message, results, status });
	} finally {
		setSearching(form, false);
	}
}

intentController = new SearchIntentController({ runSearch, loadLanes });
const controlDisclosure = new SearchControlDisclosure({ form, mode, strategy, series, book, corpus });
controlDisclosure.initialize();

bindSearchControls({
	form,
	input,
	mode,
	strategy,
	clearHistoryButton,
	onSearch: runSearch,
	onModeChange: () => {
		intentController.handleModeChange();
		controlDisclosure.render();
	},
	onStrategyChange: () => {
		intentController.handleStrategyChange();
		controlDisclosure.render();
	},
	onClearHistory: () => renderHistory(clearSearchHistory())
});

historyFilter.addEventListener('change', () => renderHistory());
renderHistory();
intentController.hydrate();
controlDisclosure.render();
