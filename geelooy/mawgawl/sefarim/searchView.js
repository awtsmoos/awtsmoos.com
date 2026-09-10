//B"H
//Boruch Hashem
//Blessed be He
/**
	* @module LivingLibraryView
	* @description The Awtsmoos turns search state into concise, readable source windows with honest provenance and useful progressive disclosure.
	*/
import { mergeCommentHits } from './commentMerge.js';
import { rangeCard } from './rangeResults.js';

const initialResultCount = 6;
const resultIncrement = 6;

/** Adds one unique Library lane option with a truthful indexed-segment count. */
export function addLane(select, lane) {
	const value = String(lane?.id || '');
	if (!value || Array.from(select.options).some(option => option.value === value)) return;
	const label = String(lane?.title || lane?.label || value);
	select.add(new Option(`${label} · ${Number(lane?.count || 0).toLocaleString()} segments`, value));
}

/** Renders merged source/comment hits and publishes an honest result status. */
export function renderSearch({ search, results, status, query }) {
	const hits = mergeCommentHits(
		Array.isArray(search.hits) ? search.hits : [],
		Array.isArray(search.commentHits) ? search.commentHits : []
	);
	results.replaceChildren();
	updateQueryContext(query, hits.length);
	if (!hits.length) results.append(emptyCard(query, search.message));
	else renderResultWindow(results, hits, initialResultCount);
	status.textContent = statusMessage(search, hits);
}

/** Replaces prior result content with one accessible bounded failure vessel. */
export function renderFailure({ message, results, status }) {
	status.textContent = 'Search could not complete.';
	const card = document.createElement('article');
	card.className = 'library-error';
	card.innerHTML = '<span aria-hidden="true">!</span><div><strong>Search could not complete.</strong><p></p></div>';
	card.querySelector('p').textContent = message;
	results.replaceChildren(card);
}

/** Synchronizes submit availability, busy semantics, and visible search state. */
export function setSearching(form, searching) {
	form.classList.toggle('searching', searching);
	form.setAttribute('aria-busy', String(searching));
	const button = form.querySelector('button[type="submit"]');
	button.disabled = searching;
	button.querySelector('.library-search-label').textContent = searching ? 'Searching…' : 'Search sources';
}

/** Renders a finite result window and progressively reveals the remaining hits. */
function renderResultWindow(results, hits, visibleCount) {
	const visibleHits = hits.slice(0, visibleCount);
	const firstCommentIndex = visibleHits.findIndex(hasComments);
	const cards = visibleHits.map((hit, index) => rangeCard(hit, index, index === firstCommentIndex));
	results.replaceChildren(...cards);
	if (visibleCount >= hits.length) return;
	const button = document.createElement('button');
	button.type = 'button';
	button.className = 'library-load-more';
	button.innerHTML = `<span>Show more sources</span><small>${hits.length - visibleCount} remaining</small>`;
	button.addEventListener('click', () => {
		renderResultWindow(results, hits, visibleCount + resultIncrement);
		results.querySelector(`.result:nth-of-type(${visibleCount + 1})`)?.focus({ preventScroll: true });
	});
	results.append(button);
}

/** Keeps document title and result metadata synchronized with the active query. */
function updateQueryContext(query, count) {
	const title = document.getElementById('results-title');
	if (title) title.textContent = query ? `Results for “${query}”` : 'Sources worth opening';
	document.title = query ? `${query} — Living Library` : 'Search the Living Library — Geelooy';
	const page = document.querySelector('.library-page');
	if (page) page.dataset.resultCount = String(count);
}

/** Returns whether one merged result contains at least one linked comment. */
function hasComments(hit) {
	return Array.isArray(hit?.comments) && hit.comments.length > 0;
}

/** Describes result count, ranking mode, and truthful linked-comment availability. */
function statusMessage(search, hits) {
	const count = hits.length;
	const commentCount = hits.reduce((total, hit) => {
		return total + (Array.isArray(hit?.comments) ? hit.comments.length : 0);
	}, 0);
	const mode = search.mode === 'vector' ? 'vector ranked' : search.mode === 'text' ? 'stored text' : 'library';
	const comments = `${commentCount} linked comment${commentCount === 1 ? '' : 's'} available`;
	const openState = commentCount > 0 ? ' · The first source window is open.' : '';
	return `${count} source${count === 1 ? '' : 's'} found · ${mode} · ${comments}${openState}`;
}

/** Builds a calm empty-state card without injecting untrusted query text as HTML. */
function emptyCard(query, message) {
	const card = document.createElement('article');
	card.className = 'library-empty';
	card.innerHTML = '<span aria-hidden="true">∅</span><div><strong>No stored source matched.</strong><p></p></div>';
	card.querySelector('p').textContent = message || `No indexed source segment matched “${query}”. Try another phrase or lane.`;
	return card;
}
