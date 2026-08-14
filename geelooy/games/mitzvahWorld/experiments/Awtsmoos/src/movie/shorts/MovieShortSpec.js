// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieShortSpec.js
 * @description Normalizes reusable portrait Short intent, including optional multilingual secondary caption lines.
 * The Awtsmoos creates story, world, voice, and accompanying language together; Awtsmoos.com keeps the top-level schema focused
 * while small value-normalizers guard media, anchors, worlds, timing, and resolution in their own vessel.
 */

import { MovieApiError } from '../MovieApiError.js';
import { normalizeMovieSecondaryText } from '../MovieSecondaryTextContract.js';
import { MOVIE_SHORT_DURATION, MOVIE_SHORT_FPS } from './MovieShortConstants.js';
import { movieShortCompositionProfile } from './MovieShortCompositionProfiles.js';
import {
	normalizeShortAnchor,
	normalizeShortResolution,
	normalizeShortSpeaker,
	normalizeShortWorld,
	positiveShortNumber,
	requiredShortText,
	shortObjectCopy,
	shortSlug
} from './MovieShortSpecValues.js';

export function normalizeMovieShortSpec(source = {}) {
	const beats = normalizeBeats(source.beats);
	const duration = beats.reduce((sum, beat) => sum + beat.duration, 0);
	validateDuration(duration);
	const title = requiredShortText(source.title, 'Short title');
	return Object.freeze({
		beats,
		duration,
		fps: positiveShortNumber(source.fps, MOVIE_SHORT_FPS),
		hook: String(source.hook || title),
		id: String(source.id || shortSlug(title)),
		layout: normalizeLayout(source.layout),
		metadata: shortObjectCopy(source.metadata),
		resolution: normalizeShortResolution(source.resolution),
		seed: Number.isFinite(Number(source.seed)) ? Number(source.seed) : 613,
		speaker: normalizeShortSpeaker(source.speaker),
		title,
		world: source.world == null ? null : normalizeShortWorld(source.world)
	});
}

function normalizeBeats(source) {
	if (!Array.isArray(source) || !source.length) {
		throw new MovieApiError('SHORT_BEATS_REQUIRED', 'Short requires at least one authored beat.');
	}
	return source.map((beat, index) => Object.freeze({
		anchor: normalizeShortAnchor(beat.anchor),
		animation: String(beat.animation || 'talk'),
		camera: beat.camera == null ? null : String(beat.camera),
		captionStyle: shortObjectCopy(beat.captionStyle),
		duration: positiveShortNumber(beat.duration, null, `Beat ${index + 1} duration`),
		label: String(beat.label || `Beat ${index + 1}`),
		secondaryCaption: normalizeMovieSecondaryText(beat.secondaryCaption),
		text: requiredShortText(beat.text, `Beat ${index + 1} text`),
		visual: String(beat.visual || 'river-garden'),
		world: beat.world == null ? null : normalizeShortWorld(beat.world)
	}));
}

function normalizeLayout(value) {
	const id = String(value || 'world-first');
	if (movieShortCompositionProfile(id)) return id;
	throw new MovieApiError('SHORT_LAYOUT_UNKNOWN', `Unknown Short layout profile ${id}.`);
}

function validateDuration(value) {
	if (value >= MOVIE_SHORT_DURATION.min && value <= MOVIE_SHORT_DURATION.max) return;
	throw new MovieApiError(
		'SHORT_DURATION_OUT_OF_RANGE',
		`Short duration must be ${MOVIE_SHORT_DURATION.min}–${MOVIE_SHORT_DURATION.max} seconds.`,
		{ duration: value }
	);
}
