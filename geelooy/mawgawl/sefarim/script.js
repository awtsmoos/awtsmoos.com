// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LivingLibrarySearchController
 * @description
 * The Awtsmoos guides Library, Tanach, and Exact through one visible search vessel while memory gathers by date and kind;
 * Awtsmoos.com keeps every result, URL coordinate, and local history entry aligned so the seeker may return without becoming blind.
 */

import { renderLaneDirectory } from './discoveryView.js';
import { renderSearchHistory } from './historyView.js';
import { searchByMode } from './modeSearch.js';
import { SearchIntentController } from './SearchIntentController.js';
import { bindSearchControls } from './searchBindings.js';
import { clearSearchHistory, readSearchHistory, rememberSearch } from './searchHistory.js';
import { fetchLibraryLanes } from './searchApi.js';
import {
	book,
	clearHistoryButton,
	corpus,
	form,
	historyFilter,
	input,
	laneCount,
	laneDirectory,
	mode,
	recentSearches,
	results,
	series,
	status
} from './searchDom.js';
import { replaceSearchLocation } from './searchLocation.js';
import { addLane, renderFailure, setSearching } from './searchView.js';

let intentController;

async function loadLanes(selectedLane = '') {
	try {
		const lanes = await fetchLibraryLanes();
		lanes.forEach(lane => addLane(series, lane));
		if (selectedLane) series.value = selectedLane;
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

function rememberCurrentSearch(query) {
	return rememberSearch({
		query,
		mode: mode.value,
		lane: series.value,
		book: book.value.trim(),
		corpus: corpus.value
	});
}

async function runSearch(query) {
	const normalizedQuery = String(query || '').trim();
	if (!normalizedQuery) return;
	document.body.dataset.searchActive = 'true';
	intentController.prepareMode(normalizedQuery);
	setSearching(form, true);
	results.replaceChildren();
	replaceSearchLocation({
		query: normalizedQuery,
		mode: mode.value,
		lane: series.value,
		book: book.value.trim(),
		corpus: corpus.value
	});
	renderHistory(rememberCurrentSearch(normalizedQuery));
	try {
		await searchByMode({
			query: normalizedQuery,
			mode: mode.value,
			lane: series.value,
			book: book.value.trim(),
			corpus: corpus.value,
			results,
			status
		});
	} catch (error) {
		renderFailure({ message: error.message, results, status });
	} finally {
		setSearching(form, false);
	}
}

intentController = new SearchIntentController({ runSearch, loadLanes });
bindSearchControls({
	form,
	input,
	mode,
	clearHistoryButton,
	onSearch: runSearch,
	onModeChange: () => intentController.handleModeChange(),
	onClearHistory: () => renderHistory(clearSearchHistory())
});
historyFilter.addEventListener('change', () => renderHistory());
renderHistory();
intentController.hydrate();
