// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieClipAppearanceContract.js
 * @description Normalizes bounded fade, dissolve, filter effect, and effect-keyframe contracts.
 * The Awtsmoos is beyond color, opacity, blur, and measured time while each finite channel receives a truthful shore;
 * Awtsmoos.com rejects undefined appearance and preserves only canonical values a renderer can faithfully explore.
 */

import { MovieApiError } from './MovieApiError.js';

export const MOVIE_APPEARANCE_EFFECT_BOUNDS = Object.freeze({
	blur: Object.freeze({ defaultValue: 0, maximum: 64, minimum: 0 }),
	brightness: Object.freeze({ defaultValue: 1, maximum: 4, minimum: 0 }),
	contrast: Object.freeze({ defaultValue: 1, maximum: 4, minimum: 0 }),
	opacity: Object.freeze({ defaultValue: 1, maximum: 1, minimum: 0 }),
	saturate: Object.freeze({ defaultValue: 1, maximum: 4, minimum: 0 })
});

const TRANSITION_TYPES = new Set(['dissolve', 'fade']);

export function normalizeMovieClipTransition(source, clipDuration) {
	if (source == null) return null;
	const type = String(source.type || 'fade');
	if (!TRANSITION_TYPES.has(type)) appearanceError('UNKNOWN_MOVIE_TRANSITION', `Unknown transition ${type}.`);
	return {
		duration: bounded(source.duration, 0, Number(clipDuration), 0.5),
		easing: String(source.easing || 'smoothstep'),
		type
	};
}

export function normalizeMovieClipEffect(source, clipDuration) {
	const kind = String(source?.kind || '');
	const bounds = MOVIE_APPEARANCE_EFFECT_BOUNDS[kind];
	if (!bounds) appearanceError('UNKNOWN_MOVIE_EFFECT', `Unknown movie effect ${kind || '(empty)'}.`);
	const id = String(source.id || `${kind}-effect`);
	const keyframes = array(source.keyframes)
		.map(frame => normalizeMovieEffectKeyframe(frame, kind, clipDuration))
		.sort((left, right) => left.time - right.time);
	assertUniqueKeyframeTimes(keyframes, id);
	return {
		enabled: source.enabled !== false,
		id,
		keyframes,
		kind,
		value: bounded(
			source.value,
			bounds.minimum,
			bounds.maximum,
			bounds.defaultValue
		)
	};
}

export function normalizeMovieClipEffects(source, clipDuration) {
	const effects = array(source).map(effect => normalizeMovieClipEffect(effect, clipDuration));
	if (effects.length > 16) appearanceError('TOO_MANY_MOVIE_EFFECTS', 'A clip supports at most 16 effects.');
	const ids = new Set();
	for (const effect of effects) {
		if (ids.has(effect.id)) appearanceError('DUPLICATE_MOVIE_EFFECT_ID', `Duplicate movie effect ${effect.id}.`);
		ids.add(effect.id);
	}
	return effects;
}

export function validateMovieClipAppearance(clip) {
	normalizeMovieClipTransition(clip.transitionIn, clip.duration);
	normalizeMovieClipTransition(clip.transitionOut, clip.duration);
	normalizeMovieClipEffects(clip.effects, clip.duration);
	return true;
}

function normalizeMovieEffectKeyframe(source, kind, clipDuration) {
	const bounds = MOVIE_APPEARANCE_EFFECT_BOUNDS[kind];
	return {
		easing: String(source?.easing || 'linear'),
		time: bounded(source?.time, 0, Number(clipDuration), 0),
		value: bounded(source?.value, bounds.minimum, bounds.maximum, bounds.defaultValue)
	};
}

function assertUniqueKeyframeTimes(keyframes, effectId) {
	if (keyframes.length > 128) appearanceError('TOO_MANY_MOVIE_KEYFRAMES', `Effect ${effectId} supports at most 128 keyframes.`);
	const times = new Set();
	for (const frame of keyframes) {
		if (times.has(frame.time)) appearanceError('DUPLICATE_MOVIE_KEYFRAME_TIME', `Effect ${effectId} has duplicate keyframe time ${frame.time}.`);
		times.add(frame.time);
	}
}

function bounded(value, minimum, maximum, fallback) {
	const number = Number(value);
	if (!Number.isFinite(number)) return fallback;
	return Number(Math.max(minimum, Math.min(maximum, number)).toFixed(4));
}

function array(value) {
	return Array.isArray(value) ? value : [];
}

function appearanceError(code, message) {
	throw new MovieApiError(code, message);
}
