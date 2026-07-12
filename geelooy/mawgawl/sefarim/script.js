// B"H
/**
 * @module LivingLibrarySearch
 * @description Ranks embedded Torah segments and reveals their exact source
 * windows. Each query enters a real API river and returns with visible evidence.
 */
import { rangeCard } from './rangeResults.js';

const form = document.getElementById('searchForm');
const input = document.getElementById('query');
const series = document.getElementById('series');
const status = document.getElementById('status');
const results = document.getElementById('results');

/** Loads dynamic search lanes from the social RAG API. */
async function loadSeries() {
	try {
		const response = await fetch('/api/social/search/rag/shards', { credentials: 'same-origin' });
		const payload = await response.json();
		if (!response.ok || payload?.error) throw new Error(payload?.error?.message || 'Search lanes unavailable.');
		for (const lane of payload?.success || []) addLane(lane);
	} catch (error) {
		console.warn('B"H search lane discovery failed', error.message);
	}
}

async function runSearch(query, lane = '') {
	const q = String(query || '').trim();
	if (!q) return;
	form.classList.add('searching');
	form.setAttribute('aria-busy', 'true');
	status.textContent = 'Ranking embedded text segments…';
	results.replaceChildren();
	const params = new URLSearchParams({ q, limit: '20', comments: 'true', maxCommentRows: '35' });
	if (lane) params.set('lane', lane);
	history.replaceState(null, '', `${location.pathname}?${new URLSearchParams({ q, ...(lane ? { lane } : {}) })}`);
	try {
		const response = await fetch(`/api/social/search/rag/query?${params}`, { credentials: 'same-origin' });
		const payload = await response.json();
		if (!response.ok || payload?.error) throw new Error(payload?.error?.message || payload?.message || 'Search failed.');
		const hits = rangeHits(payload);
		results.append(...hits.map((hit, index) => rangeCard(hit, index)));
		status.textContent = hits.length ? `${hits.length} embedded text segments, ordered by relevance.` : 'No matching segments found.';
	} catch (error) {
		status.textContent = error.message;
		const empty = document.createElement('article');
		empty.className = 'g-card';
		empty.textContent = 'The embedded-text search lane could not open.';
		results.replaceChildren(empty);
	} finally {
		form.classList.remove('searching');
		form.setAttribute('aria-busy', 'false');
	}
}

function addLane(lane) {
	const value = String(lane?.id || lane?.lane || lane?.shard || lane?.name || '');
	if (!value || Array.from(series.options).some(option => option.value === value)) return;
	series.add(new Option(String(lane?.label || lane?.title || value), value));
}

function rangeHits(payload) {
	const value = payload?.success ?? payload;
	return Array.isArray(value?.hits) ? value.hits : [];
}

function hydrateFromUrl() {
	const params = new URLSearchParams(location.search);
	const query = params.get('q') || '';
	const lane = params.get('lane') || '';
	input.value = query;
	if (lane) series.value = lane;
	if (query) runSearch(query, lane);
}

form.addEventListener('submit', event => {
	event.preventDefault();
	runSearch(input.value, series.value);
});

loadSeries().finally(hydrateFromUrl);
