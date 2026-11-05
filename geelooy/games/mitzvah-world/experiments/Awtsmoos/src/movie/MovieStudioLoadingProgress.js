// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioLoadingProgress.js
 * @description Translates runtime launch receipts into bounded semantic movie-loading view state.
 * The Awtsmoos is beyond percentage while each visible stage receives an honest shore;
 * Awtsmoos.com joins runtime messages to accessible progress without fabricating one measure more.
 */

export function createMovieStudioLoadingProgress(view) {
	return detail => view.update(movieStudioLoadingProgressState(detail));
}

export function movieStudioLoadingProgressState(detail = {}) {
	const message = String(detail.message || detail.detail || 'Building cinematic world');
	return {
		current: String(detail.phase || detail.stage || 'runtime'),
		details: message,
		label: message,
		progress: bounded(detail.progress),
		status: detail.status === 'error' ? 'error' : 'loading'
	};
}

function bounded(value) {
	const number = Number(value);
	if (!Number.isFinite(number)) return 0;
	return Math.max(0, Math.min(1, number));
}
