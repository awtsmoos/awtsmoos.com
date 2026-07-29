// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieClipAppearanceSampler.js
 * @description Samples bounded transition envelopes and effect keyframes at deterministic clip-local time.
 * The Awtsmoos is beyond interpolation while every finite value travels from authored point to point;
 * Awtsmoos.com binds opacity and color channels into one JSON snapshot the live canvas may anoint.
 */

import {
	MOVIE_APPEARANCE_EFFECT_BOUNDS,
	normalizeMovieClipEffects,
	normalizeMovieClipTransition
} from './MovieClipAppearanceContract.js';

export function sampleMovieClipAppearance(state) {
	if (!state?.clip) return defaultAppearance();
	const clip = state.clip;
	const values = defaultValues();
	for (const effect of normalizeMovieClipEffects(clip.effects, clip.duration)) {
		if (!effect.enabled) continue;
		values[effect.kind] = sampleEffect(effect, state.localTime);
	}
	const transitionIn = normalizeMovieClipTransition(clip.transitionIn, clip.duration);
	const transitionOut = normalizeMovieClipTransition(clip.transitionOut, clip.duration);
	const envelope = transitionEnvelope(state.localTime, clip.duration, transitionIn, transitionOut);
	values.opacity = round(values.opacity * envelope.opacity);
	return { ...values, filter: appearanceFilter(values), transition: envelope };
}

function sampleEffect(effect, localTime) {
	if (!effect.keyframes.length) return effect.value;
	if (localTime <= effect.keyframes[0].time) return effect.keyframes[0].value;
	const last = effect.keyframes.at(-1);
	if (localTime >= last.time) return last.value;
	for (let index = 1; index < effect.keyframes.length; index += 1) {
		const right = effect.keyframes[index];
		if (localTime > right.time) continue;
		const left = effect.keyframes[index - 1];
		const raw = (localTime - left.time) / (right.time - left.time);
		const progress = sampleAppearanceEasing(right.easing, raw);
		return round(left.value + (right.value - left.value) * progress);
	}
	return last.value;
}

function transitionEnvelope(localTime, duration, transitionIn, transitionOut) {
	let opacity = 1;
	const active = [];
	if (transitionIn?.duration > 0 && localTime < transitionIn.duration) {
		opacity *= sampleAppearanceEasing(
			transitionIn.easing,
			localTime / transitionIn.duration
		);
		active.push(`in:${transitionIn.type}`);
	}
	const remaining = duration - localTime;
	if (transitionOut?.duration > 0 && remaining < transitionOut.duration) {
		opacity *= sampleAppearanceEasing(
			transitionOut.easing,
			remaining / transitionOut.duration
		);
		active.push(`out:${transitionOut.type}`);
	}
	return { active, opacity: round(Math.max(0, Math.min(1, opacity))) };
}

export function sampleAppearanceEasing(name, value) {
	const time = Math.max(0, Math.min(1, Number(value) || 0));
	if (name === 'easeInQuad') return time * time;
	if (name === 'easeOutQuad') return 1 - (1 - time) ** 2;
	if (name === 'smoothstep') return time * time * (3 - 2 * time);
	if (name === 'smootherstep') return time ** 3 * (time * (time * 6 - 15) + 10);
	if (name === 'easeInOutQuad') {
		return time < 0.5 ? 2 * time * time : 1 - ((-2 * time + 2) ** 2) / 2;
	}
	if (name === 'easeInOutCubic') {
		return time < 0.5 ? 4 * time ** 3 : 1 - ((-2 * time + 2) ** 3) / 2;
	}
	return time;
}

function appearanceFilter(values) {
	return [
		`brightness(${values.brightness})`,
		`contrast(${values.contrast})`,
		`saturate(${values.saturate})`,
		`blur(${values.blur}px)`
	].join(' ');
}

function defaultAppearance() {
	const values = defaultValues();
	return {
		...values,
		filter: appearanceFilter(values),
		transition: { active: [], opacity: 1 }
	};
}

function defaultValues() {
	return Object.fromEntries(Object.entries(MOVIE_APPEARANCE_EFFECT_BOUNDS).map(
		([kind, bounds]) => [kind, bounds.defaultValue]
	));
}

function round(value) {
	return Number(Number(value).toFixed(4));
}
