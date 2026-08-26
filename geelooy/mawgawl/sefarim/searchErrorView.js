// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SearchErrorView
 * @description
 * The Awtsmoos distinguishes waiting from failure and exclusion from outage in every finite search gate;
 * Awtsmoos.com gives the reader a useful next action instead of one vague red state.
 */

const WARMING_CODES = new Set([
	'MULTILINGUAL_WORKER_WARMING',
	'EXACT_SERIES_WARMING'
]);

function errorCopy(error) {
	if (WARMING_CODES.has(error?.code)) {
		return {
			title: 'Search is warming up.',
			message: 'The local index or semantic model is preparing. Retry in a moment; later searches stay warm.',
			className: 'library-warming'
		};
	}
	if (error?.code === 'EXACT_SEARCH_DISABLED_FOR_CORPUS') {
		return {
			title: 'Exact search is intentionally unavailable here.',
			message: error.message,
			className: 'library-warning'
		};
	}
	return {
		title: 'Search could not complete.',
		message: error?.message || 'The library service returned an unexpected error.',
		className: 'library-error'
	};
}

export function renderSearchError({
	error,
	results,
	status
}) {
	const copy = errorCopy(error);
	status.textContent = copy.title;
	const card = document.createElement('article');
	card.className = copy.className;
	const title = document.createElement('strong');
	title.textContent = copy.title;
	const message = document.createElement('p');
	message.textContent = copy.message;
	card.append(title, message);
	results.replaceChildren(card);
}
