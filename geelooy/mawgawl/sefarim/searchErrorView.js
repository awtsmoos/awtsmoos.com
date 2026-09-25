//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module SearchErrorView
 * @description
 * The Awtsmoos distinguishes waiting from failure and exclusion from outage in every finite search gate;
 * Awtsmoos.com gives the reader one stable recovery vessel while truthful variants keep each boundary straight.
 */

const WARMING_CODES = new Set([
	'MULTILINGUAL_WORKER_WARMING',
	'EXACT_SERIES_WARMING'
]);

/**
 * Converts one search exception into human-facing recovery copy and a semantic variant class.
 *
 * @param {Object} error Search error with optional code and message fields.
 * @returns {{title:string, message:string, className:string, role:string}} Presentable error state.
 */
function errorCopy(error) {
	if (WARMING_CODES.has(error?.code)) {
		return {
			title: 'Search is warming up.',
			message: 'The local index or semantic model is preparing. Retry in a moment; later searches stay warm.',
			className: 'library-warming',
			role: 'status'
		};
	}

	if (error?.code === 'EXACT_SEARCH_DISABLED_FOR_CORPUS') {
		return {
			title: 'Exact search is intentionally unavailable here.',
			message: error.message,
			className: 'library-warning',
			role: 'status'
		};
	}

	return {
		title: 'Search could not complete.',
		message: error?.message || 'The library service returned an unexpected error.',
		className: 'library-error',
		role: 'alert'
	};
}

/**
 * Replaces the result region with one stable search-error card and clears duplicate status copy.
 *
 * @param {{error?:Object, results?:HTMLElement, status?:HTMLElement}} input Error and destination surfaces.
 * @returns {{title:string, message:string, className:string, role:string}} Rendered recovery state.
 */
export function renderSearchError({
	error,
	results,
	status
} = {}) {
	const copy = errorCopy(error);

	if (status) {
		status.textContent = '';
	}

	if (!results) {
		return copy;
	}

	const card = document.createElement('article');
	card.className = `search-error-card ${copy.className}`;
	card.setAttribute('role', copy.role);

	const title = document.createElement('strong');
	title.textContent = copy.title;

	const message = document.createElement('p');
	message.textContent = copy.message;

	card.append(title, message);
	results.replaceChildren(card);
	return copy;
}
