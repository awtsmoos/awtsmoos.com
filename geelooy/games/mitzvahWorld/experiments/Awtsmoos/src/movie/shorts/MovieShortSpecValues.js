// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieShortSpecValues.js
 * @description Normalizes reusable numeric, text, speaker, anchor, resolution, and world values for Short specifications.
 * The Awtsmoos creates measure and meaning before finite validation; Awtsmoos.com gives each small value one stable gate,
 * keeping the main Short schema readable while future bilingual, world, and media capabilities expand without compressed logic.
 */

import { MovieApiError } from '../MovieApiError.js';
import { MOVIE_SHORT_FPS, MOVIE_SHORT_RESOLUTION } from './MovieShortConstants.js';

export function normalizeShortSpeaker(source) {
	if (!source) return null;
	const url = requiredShortText(source.url, 'Speaker video URL');
	const mediaId = String(source.mediaId || 'short-speaker-video');
	const audioMediaId = String(source.audioMediaId || `${mediaId}-audio`);
	if (audioMediaId === mediaId) throw new MovieApiError(
		'SHORT_SPEAKER_MEDIA_IDS_MUST_DIFFER', 'Speaker video and audio media IDs must differ.'
	);
	const sourceOffset = nonnegativeShortNumber(source.sourceOffset);
	return Object.freeze({
		audioMediaId,
		audioSourceOffset: nonnegativeShortNumber(source.audioSourceOffset ?? sourceOffset),
		audioUrl: String(source.audioUrl || url),
		height: positiveShortNumber(source.height, 1080, 'Speaker source height'),
		label: String(source.label || 'Speaker'),
		mediaId,
		sourceOffset,
		url,
		width: positiveShortNumber(source.width, 1920, 'Speaker source width')
	});
}

export function normalizeShortAnchor(value) {
	if (!value) return null;
	const point = { x: Number(value.x), y: Number(value.y ?? 1.5), z: Number(value.z) };
	if (!Object.values(point).every(Number.isFinite)) throw new MovieApiError(
		'SHORT_CAMERA_ANCHOR_INVALID', 'Short camera anchor requires finite x, y, and z values.'
	);
	return Object.freeze(point);
}

export function normalizeShortResolution(value) {
	return {
		height: positiveShortNumber(value?.height, MOVIE_SHORT_RESOLUTION.height),
		width: positiveShortNumber(value?.width, MOVIE_SHORT_RESOLUTION.width)
	};
}

export function normalizeShortWorld(value) {
	return value && typeof value === 'object' ? Object.freeze({ ...value }) : String(value);
}

export function positiveShortNumber(value, fallback = MOVIE_SHORT_FPS, label = 'Value') {
	const number = Number(value ?? fallback);
	if (Number.isFinite(number) && number > 0) return number;
	throw new MovieApiError('SHORT_POSITIVE_NUMBER_REQUIRED', `${label} must be positive.`);
}

export function requiredShortText(value, label) {
	const text = String(value || '').trim();
	if (text) return text;
	throw new MovieApiError('SHORT_TEXT_REQUIRED', `${label} is required.`);
}

export function shortObjectCopy(value) {
	return value && typeof value === 'object' ? { ...value } : {};
}

export function shortSlug(value) {
	return String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'awtsmoos-short';
}

function nonnegativeShortNumber(value) {
	const number = Number(value);
	return Number.isFinite(number) ? Math.max(0, number) : 0;
}
