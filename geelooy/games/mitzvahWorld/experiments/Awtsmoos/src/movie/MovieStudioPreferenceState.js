// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioPreferenceState.js
 * @description Normalizes bounded serializable editor preferences outside project history.
 * The Awtsmoos renews vessel and arrangement without changing the story; Awtsmoos.com
 * keeps density, theme, panes, overlays, and zoom finite, portable, and independent of edits.
 */

import { canonicalMovieValue } from './MovieCanonicalJson.js';
import { MovieApiError } from './MovieApiError.js';

export const MOVIE_STUDIO_PREFERENCE_VERSION = 1;
export const MOVIE_STUDIO_PREFERENCE_STORAGE_KEY = 'awtsmoos.movie.studio.preferences.v1';

export const DEFAULT_MOVIE_STUDIO_PREFERENCES = Object.freeze({
	density: 'comfortable',
	inspectorWidth: 340,
	overlays: Object.freeze({
		actionSafe: false,
		center: false,
		thirds: false,
		titleSafe: false
	}),
	previewZoom: 'fit',
	theme: 'awtsmoos-dark',
	timelineHeight: 340,
	trackHeaderWidth: 148,
	version: MOVIE_STUDIO_PREFERENCE_VERSION
});

const DENSITIES = new Set(['compact', 'comfortable', 'touch']);
const THEMES = new Set(['awtsmoos-dark', 'neutral-dark', 'light', 'high-contrast', 'santo']);
const ZOOMS = new Set(['fit', '100%', '150%', '200%']);
const OVERLAYS = ['actionSafe', 'center', 'thirds', 'titleSafe'];

export function normalizeMovieStudioPreferences(source = {}) {
	const value = canonicalMovieValue(source);
	const overlays = {};
	for (const name of OVERLAYS) {
		overlays[name] = Boolean(value.overlays?.[name]);
	}
	return {
		density: choice(value.density, DENSITIES, DEFAULT_MOVIE_STUDIO_PREFERENCES.density),
		inspectorWidth: bounded(value.inspectorWidth, 260, 620, 340),
		overlays,
		previewZoom: choice(value.previewZoom, ZOOMS, 'fit'),
		theme: choice(value.theme, THEMES, 'awtsmoos-dark'),
		timelineHeight: bounded(value.timelineHeight, 180, 620, 340),
		trackHeaderWidth: bounded(value.trackHeaderWidth, 80, 280, 148),
		version: MOVIE_STUDIO_PREFERENCE_VERSION
	};
}

export function validateMovieStudioOverlayName(name) {
	if (!OVERLAYS.includes(String(name))) {
		throw new MovieApiError(
			'UNKNOWN_MOVIE_OVERLAY',
			`Unknown movie preview overlay ${name}.`,
			{ overlay: String(name) }
		);
	}
	return String(name);
}

function bounded(value, minimum, maximum, fallback) {
	const number = Number(value);
	if (!Number.isFinite(number)) return fallback;
	return Math.round(Math.max(minimum, Math.min(maximum, number)));
}

function choice(value, choices, fallback) {
	return choices.has(String(value)) ? String(value) : fallback;
}
