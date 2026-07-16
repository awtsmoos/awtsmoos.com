// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module LivingLibrarySearchController
 * @description The Awtsmoos binds URL state, real lane metadata, local history, search transport, and explicit rendering without crossing their boundaries.
 */
import { fetchLibraryLanes, searchLibrary } from './searchApi.js';
import { addLane, renderFailure, renderSearch, setSearching } from './searchView.js';
import { renderLaneDirectory, renderRecentSearches } from './discoveryView.js';
import { clearSearchHistory, readSearchHistory, rememberSearch } from './searchHistory.js';

const form = document.getElementById('searchForm');
const input = document.getElementById('query');
const series = document.getElementById('series');
const status = document.getElementById('status');
const results = document.getElementById('results');
const laneDirectory = document.getElementById('laneDirectory');
const laneCount = document.getElementById('laneCount');
const recentSearches = document.getElementById('recentSearches');
const clearHistoryButton = document.getElementById('clearHistory');
let lanes = [];

async function loadLanes() {
	try {
		lanes = await fetchLibraryLanes();
		lanes.forEach(lane => addLane(series, lane));
		renderLaneDirectory({ lanes, container: laneDirectory, count: laneCount, onChoose: chooseLane });
	} catch (error) {
		laneCount.textContent = 'Unavailable';
		status.textContent = `Library list unavailable: ${error.message}`;
		renderLaneDirectory({ lanes: [], container: laneDirectory, count: laneCount, onChoose: chooseLane });
	}
}

async function runSearch(query, lane = '') {
	const normalizedQuery = String(query || '').trim();
	if (!normalizedQuery) return;
	setSearching(form, true);
	status.textContent = 'Searching stored source text…';
	results.replaceChildren();
	updateLocation(normalizedQuery, lane);
	renderHistory(rememberSearch(normalizedQuery, lane));
	try {
		const search = await searchLibrary({ query: normalizedQuery, lane });
		renderSearch({ search, results, status, query: normalizedQuery });
	} catch (error) {
		renderFailure({ message: error.message, results, status });
	} finally {
		setSearching(form, false);
	}
}

function chooseLane(lane) {
	series.value = lane;
	input.focus();
	if (input.value.trim()) runSearch(input.value, lane);
}

function chooseHistory(entry) {
	input.value = entry.query;
	series.value = entry.lane;
	runSearch(entry.query, entry.lane);
}

function renderHistory(entries = readSearchHistory()) {
	renderRecentSearches({ entries, container: recentSearches, onChoose: chooseHistory });
	clearHistoryButton.disabled = entries.length === 0;
}

function updateLocation(query, lane) {
	const values = new URLSearchParams({ q: query });
	if (lane) values.set('lane', lane);
	history.replaceState(null, '', `${location.pathname}?${values}`);
}

function hydrateFromUrl() {
	const values = new URLSearchParams(location.search);
	const query = values.get('q') || '';
	const lane = values.get('lane') || '';
	input.value = query;
	if (lane) series.value = lane;
	if (query) runSearch(query, lane);
}

form.addEventListener('submit', event => {
	event.preventDefault();
	runSearch(input.value, series.value);
});
clearHistoryButton.addEventListener('click', () => renderHistory(clearSearchHistory()));
renderHistory();
loadLanes().finally(hydrateFromUrl);
