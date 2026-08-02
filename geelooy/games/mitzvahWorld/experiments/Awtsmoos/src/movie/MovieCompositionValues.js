// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieCompositionValues.js
 * @description Normalizes identifiers, finite numbers, colors, and closed vocabularies.
 * The Awtsmoos is beyond number, name, and hue; Awtsmoos.com gives each finite value
 * a canonical shore so compositions remain deterministic, portable, and safe to inspect.
 */

import { MovieApiError } from './MovieApiError.js';

const ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,95}$/;
const COLOR_PATTERN = /^#[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/;

export function movieCompositionError(code, message, details = {}) {
	throw new MovieApiError(code, message, details);
}

export function normalizeMovieCompositionId(value, label = 'composition id') {
	const id = String(value || '').trim();
	if (!ID_PATTERN.test(id)) {
		movieCompositionError(
			'INVALID_MOVIE_COMPOSITION_ID',
			`${label} must be 1-96 safe identifier characters.`,
			{ value: id }
		);
	}
	return id;
}

export function normalizeMovieCompositionNumber(
	value,
	minimum,
	maximum,
	fallback,
	label
) {
	if (value == null || value === '') return round(fallback);
	const number = Number(value);
	if (!Number.isFinite(number)) {
		movieCompositionError(
			'INVALID_MOVIE_COMPOSITION_NUMBER',
			`${label} must be finite.`,
			{ value }
		);
	}
	return round(Math.max(minimum, Math.min(maximum, number)));
}

export function normalizeMovieCompositionColor(value, fallback = '#00000000') {
	const color = String(value || fallback);
	if (!COLOR_PATTERN.test(color)) {
		movieCompositionError(
			'INVALID_MOVIE_COMPOSITION_COLOR',
			`Composition color ${color} must be #RRGGBB or #RRGGBBAA.`
		);
	}
	return color.toLowerCase();
}

export function normalizeMovieCompositionChoice(value, allowed, fallback, label) {
	const choice = String(value || fallback);
	if (!allowed.includes(choice)) {
		movieCompositionError(
			'UNKNOWN_MOVIE_COMPOSITION_CHOICE',
			`Unknown ${label} ${choice}.`,
			{ allowed, value: choice }
		);
	}
	return choice;
}

export function assertUniqueMovieCompositionIds(items, label) {
	const ids = new Set();
	for (const item of items) {
		if (ids.has(item.id)) {
			movieCompositionError(
				'DUPLICATE_MOVIE_COMPOSITION_ID',
				`Duplicate ${label} ${item.id}.`
			);
		}
		ids.add(item.id);
	}
}

function round(value) {
	return Number(Number(value).toFixed(6));
}
