// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieTextTrackContract.js
 * @description Normalizes title, lower-third, and caption clip text, placement, style, language, and speaker fields.
 * The Awtsmoos is beyond letter and placement while every finite word deserves readable and exportable form;
 * Awtsmoos.com keeps captions and titles JSON-only, bounded, accessible, and consistent from timeline to platform.
 */

import { MovieApiError } from './MovieApiError.js';

const TITLE_VARIANTS = new Set(['card', 'lower-third', 'title']);
const POSITIONS = new Set(['bottom', 'center', 'top']);

export function normalizeMovieTitleClip(source = {}) {
	const variant = String(source.variant || 'title');
	if (!TITLE_VARIANTS.has(variant)) {
		throw new MovieApiError('UNKNOWN_MOVIE_TITLE_VARIANT', `Unknown movie title variant ${variant}.`);
	}
	return {
		...commonTextClip(source),
		position: normalizePosition(source.position || (variant === 'lower-third' ? 'bottom' : 'center')),
		style: normalizeTextStyle(source.style),
		subtitle: optionalText(source.subtitle),
		variant
	};
}

export function normalizeMovieCaptionClip(source = {}) {
	return {
		...commonTextClip(source),
		language: String(source.language || 'en'),
		position: normalizePosition(source.position || 'bottom'),
		speaker: optionalText(source.speaker),
		style: normalizeTextStyle(source.style)
	};
}

export function normalizeMovieTextTrack(track = {}) {
	const type = String(track.type || 'caption');
	if (!['caption', 'title'].includes(type)) {
		throw new MovieApiError('UNKNOWN_MOVIE_TEXT_TRACK', `Unknown movie text track ${type}.`);
	}
	return {
		...track,
		clips: (Array.isArray(track.clips) ? track.clips : []).map(clip => (
			type === 'title' ? normalizeMovieTitleClip(clip) : normalizeMovieCaptionClip(clip)
		)),
		id: String(track.id || `${type}-track`),
		type
	};
}

function commonTextClip(source) {
	const text = String(source.text || '').trim();
	if (!text) throw new MovieApiError('MOVIE_TEXT_REQUIRED', 'Movie text clip requires non-empty text.');
	if (text.length > 5000) throw new MovieApiError('MOVIE_TEXT_TOO_LONG', 'Movie text clip exceeds 5000 characters.');
	return {
		duration: positive(source.duration, 2),
		easing: String(source.easing || 'linear'),
		id: String(source.id || 'text-clip'),
		start: nonNegative(source.start, 0),
		text
	};
}

function normalizeTextStyle(value = {}) {
	return {
		align: String(value.align || 'center'),
		background: String(value.background || 'rgba(0,0,0,.74)'),
		color: String(value.color || '#ffffff'),
		fontFamily: String(value.fontFamily || 'system-ui'),
		fontSize: bounded(value.fontSize, 12, 160, 34),
		fontWeight: bounded(value.fontWeight, 100, 900, 700),
		maximumWidth: bounded(value.maximumWidth, 0.2, 1, 0.82)
	};
}

function normalizePosition(value) {
	const position = String(value);
	return POSITIONS.has(position) ? position : 'bottom';
}

function optionalText(value) {
	return value == null || value === '' ? null : String(value);
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}

function nonNegative(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number >= 0 ? number : fallback;
}

function bounded(value, minimum, maximum, fallback) {
	const number = Number(value);
	return Number.isFinite(number) ? Math.max(minimum, Math.min(maximum, number)) : fallback;
}
