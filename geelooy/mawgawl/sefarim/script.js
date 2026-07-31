// B"H
// Boruch Hashem
// Blessed is He
/** @module LivingLibrarySearchController @description The Awtsmoos starts the requested search immediately while library metadata loads independently. */
import { fetchLibraryLanes, searchLibrary } from './searchApi.js';
import { searchTanach } from './tanachApi.js';
import { renderTanach } from './tanachView.js';
import { addLane, renderFailure, renderSearch, setSearching } from './searchView.js';
import { renderLaneDirectory, renderRecentSearches } from './discoveryView.js';
import { clearSearchHistory, readSearchHistory, rememberSearch } from './searchHistory.js';
import { configureMode, LIBRARY_MODE, modeFromUrl, TANACH_MODE } from './searchMode.js';

const form = document.getElementById('searchForm');
const input = document.getElementById('query');
const series = document.getElementById('series');
const mode = document.getElementById('searchMode');
const book = document.getElementById('book');
const laneField = document.getElementById('laneField');
const bookField = document.getElementById('bookField');
const status = document.getElementById('status');
const results = document.getElementById('results');
const laneDirectory = document.getElementById('laneDirectory');
const laneCount = document.getElementById('laneCount');
const recentSearches = document.getElementById('recentSearches');
const clearHistoryButton = document.getElementById('clearHistory');

async function loadLanes(selectedLane = '') {
	try {
		const lanes = await fetchLibraryLanes();
		lanes.forEach(lane => addLane(series, lane));
		if (selectedLane) series.value = selectedLane;
		renderLaneDirectory({ lanes, container: laneDirectory, count: laneCount, onChoose: chooseLane });
	} catch (error) {
		laneCount.textContent = 'Unavailable';
	}
}

async function runSearch(query) {
	const normalizedQuery = String(query || '').trim();
	if (!normalizedQuery) return;
	setSearching(form, true);
	results.replaceChildren();
	updateLocation(normalizedQuery);
	if (mode.value === LIBRARY_MODE) renderHistory(rememberSearch(normalizedQuery, series.value));
	try {
		if (mode.value === TANACH_MODE) {
			status.textContent = 'Searching the persisted Tanach Hebrew index…';
			renderTanach({ search: await searchTanach({ query: normalizedQuery, book: book.value.trim() }), results, status });
		} else {
			status.textContent = 'Searching stored source text…';
			renderSearch({ search: await searchLibrary({ query: normalizedQuery, lane: series.value }), results, status, query: normalizedQuery });
		}
	} catch (error) {
		renderFailure({ message: error.message, results, status });
	} finally {
		setSearching(form, false);
	}
}

function chooseLane(lane) {
	series.value = lane;
	input.focus();
	if (input.value.trim()) runSearch(input.value);
}

function chooseHistory(entry) {
	mode.value = LIBRARY_MODE;
	input.value = entry.query;
	series.value = entry.lane;
	configureMode(mode, laneField, bookField);
	runSearch(entry.query);
}

function renderHistory(entries = readSearchHistory()) {
	renderRecentSearches({ entries, container: recentSearches, onChoose: chooseHistory });
	clearHistoryButton.disabled = entries.length === 0;
}

function updateLocation(query) {
	const values = new URLSearchParams({ q: query });
	if (mode.value !== LIBRARY_MODE) values.set('mode', mode.value);
	if (mode.value === LIBRARY_MODE && series.value) values.set('lane', series.value);
	if (mode.value === TANACH_MODE && book.value.trim()) values.set('book', book.value.trim());
	history.replaceState(null, '', `${location.pathname}?${values}`);
}

function hydrateFromUrl() {
	const values = new URLSearchParams(location.search);
	input.value = values.get('q') || '';
	mode.value = modeFromUrl(values);
	book.value = values.get('book') || '';
	configureMode(mode, laneField, bookField);
	const selectedLane = values.get('lane') || '';
	loadLanes(selectedLane);
	if (input.value) runSearch(input.value);
}

form.addEventListener('submit', event => { event.preventDefault(); runSearch(input.value); });
mode.addEventListener('change', () => configureMode(mode, laneField, bookField));
clearHistoryButton.addEventListener('click', () => renderHistory(clearSearchHistory()));
renderHistory();
hydrateFromUrl();
