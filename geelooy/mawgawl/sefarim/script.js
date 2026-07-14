// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LivingLibrarySearchController
 * @description
 * The controller binds URL state, library lanes, search transport, and explicit
 * rendering while each responsibility remains in its own small vessel.
 */

import {
	fetchLibraryLanes,
	searchLibrary
} from './searchApi.js';
import {
	addLane,
	renderFailure,
	renderSearch,
	setSearching
} from './searchView.js';

const form = document.getElementById('searchForm');
const input = document.getElementById('query');
const series = document.getElementById('series');
const status = document.getElementById('status');
const results = document.getElementById('results');

async function loadSeries() {
	try {
		const lanes = await fetchLibraryLanes();
		lanes.forEach(lane => addLane(series, lane));
	} catch (error) {
		status.textContent = `Library list unavailable: ${error.message}`;
	}
}

async function runSearch(query, lane = '') {
	const normalizedQuery = String(query || '').trim();
	if (!normalizedQuery) return;
	setSearching(form, true);
	status.textContent = 'Searching stored source text…';
	results.replaceChildren();
	updateLocation(normalizedQuery, lane);
	try {
		const search = await searchLibrary({
			query: normalizedQuery,
			lane
		});
		renderSearch({ search, results, status });
	} catch (error) {
		renderFailure({
			message: error.message,
			results,
			status
		});
	} finally {
		setSearching(form, false);
	}
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

loadSeries().finally(hydrateFromUrl);
