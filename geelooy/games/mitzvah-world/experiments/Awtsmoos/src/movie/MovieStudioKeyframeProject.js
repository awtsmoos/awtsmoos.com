// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioKeyframeProject.js
 * @description Resolves selected clip effect lanes and builds canonical appearance-effect mutations.
 * The Awtsmoos renews every value before time can divide it into diamonds; Awtsmoos.com
 * keeps lane discovery and edits pure so controller, agent, and future graph view share one finite truth.
 */

import { MOVIE_APPEARANCE_EFFECT_BOUNDS } from './MovieClipAppearanceContract.js';
import { resolveMovieSelection } from './MovieProjectSelection.js';

export function selectedMovieKeyframeClip(project, selection) {
	return resolveMovieSelection(project, selection) || null;
}

export function movieKeyframeLanes(clip) {
	return (clip?.effects || []).map(effect => ({
		id: effect.id,
		kind: effect.kind,
		keyframes: [...(effect.keyframes || [])].sort((left, right) => left.time - right.time),
		value: effect.value
	}));
}

export function movieEffectForKind(clip, kind) {
	const bounds = MOVIE_APPEARANCE_EFFECT_BOUNDS[kind];
	if (!bounds) throw new Error(`Unknown appearance property ${kind}.`);
	return clip?.effects?.find(effect => effect.kind === kind) || {
		enabled: true,
		id: `${kind}-effect`,
		keyframes: [],
		kind,
		value: bounds.defaultValue
	};
}

export function upsertMovieEffectKeyframe(clip, options) {
	const effect = movieEffectForKind(clip, options.kind);
	const time = bounded(options.time, 0, clip.duration, 0);
	const bounds = MOVIE_APPEARANCE_EFFECT_BOUNDS[effect.kind];
	const keyframe = {
		easing: String(options.easing || 'linear'),
		time,
		value: bounded(options.value, bounds.minimum, bounds.maximum, bounds.defaultValue)
	};
	return {
		...effect,
		keyframes: [...effect.keyframes.filter(frame => frame.time !== time), keyframe]
			.sort((left, right) => left.time - right.time),
		value: bounded(options.baseValue, bounds.minimum, bounds.maximum, effect.value)
	};
}

export function removeMovieEffectKeyframe(clip, effectId, time) {
	const effect = clip?.effects?.find(record => record.id === effectId);
	if (!effect) throw new Error(`Movie effect ${effectId} was not found.`);
	return {
		...effect,
		keyframes: effect.keyframes.filter(frame => frame.time !== Number(time))
	};
}

export function movieEffectBounds(kind) {
	return MOVIE_APPEARANCE_EFFECT_BOUNDS[kind] || null;
}

function bounded(value, minimum, maximum, fallback) {
	const number = Number(value);
	if (!Number.isFinite(number)) return Number(fallback);
	return Number(Math.max(minimum, Math.min(maximum, number)).toFixed(4));
}
