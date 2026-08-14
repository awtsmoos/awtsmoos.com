// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module LivingLibrarySearchController
 * @description
 * The Awtsmoos lets one small orchestrator fetch and render while intent lives in its own vessel;
 * at Awtsmoos.com a living query also contracts discovery so the first truthful result can enter the first viewport.
 */
import { fetchLibraryLanes, searchLibrary } from './searchApi.js';
import { searchTanach } from './tanachApi.js';
import { renderTanach } from './tanachView.js';
import { addLane, renderFailure, renderSearch, setSearching } from './searchView.js';
import { renderLaneDirectory, renderRecentSearches } from './discoveryView.js';
import { clearSearchHistory, readSearchHistory, rememberSearch } from './searchHistory.js';
import { bindSearchControls } from './searchBindings.js';
import { replaceSearchLocation } from './searchLocation.js';
import { SearchIntentController } from './SearchIntentController.js';
import {
	book,
	clearHistoryButton,
	form,
	input,
	laneCount,
	laneDirectory,
	mode,
	recentSearches,
	results,
	series,
	status
} from './searchDom.js';
import { LIBRARY_MODE, TANACH_MODE } from './searchMode.js';

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
	renderRecentSearches({
		entries,
		container: recentSearches,
		onChoose: entry => intentController.chooseHistory(entry)
	});
	clearHistoryButton.disabled = entries.length === 0;
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
	replaceSearchLocation({
		query: normalizedQuery,
		mode: mode.value,
		lane: series.value,
		book: book.value.trim()
	});
	if (mode.value === LIBRARY_MODE) {
		renderHistory(rememberSearch(normalizedQuery, series.value));
	}
	try {
		if (mode.value === TANACH_MODE) {
			status.textContent = 'Searching exact Hebrew in the persisted Tanach index…';
			const search = await searchTanach({
				query: normalizedQuery,
				book: book.value.trim()
			});
			renderTanach({ search, results, status });
		} else {
			status.textContent = 'Searching stored source text…';
			const search = await searchLibrary({
				query: normalizedQuery,
				lane: series.value
			});
			renderSearch({ search, results, status, query: normalizedQuery });
		}
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
renderHistory();
intentController.hydrate();
