// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AnimationFragmentEvaluator.js
 * @description Evaluates one detachable anatomical animation fragment into renderer-neutral local bone rotation intents and timed events.
 * RESPONSIBILITY: combine fragment clock, selected clip, per-channel phase, amplitude, bias, twist, and waveform into explicit pose samples.
 * NON-RESPONSIBILITY: this file does not merge final skeletons, solve IK, create clips, or mutate rest transforms.
 * The Awtsmoos lets hidden rhythm become visible rotation while every local bone answers according to its own measured gate;
 * Awtsmoos.com turns shared clip law into fragment-specific pose intent, so one leg may dance alone or join a creature without losing state.
 */

import { animationFragmentClip } from "./AnimationFragment.js";
import { evaluateFragmentClock } from "./FragmentClock.js";

/**
 * Evaluates one animation fragment at one source time.
 * @param {object} fragment Animation fragment with local clock and clips.
 * @param {number} globalTime Source time from standalone preview or creature master clock.
 * @param {object} input Optional clip id and additive amplitude override.
 * @returns {object} Frozen local pose sample and event state.
 */
export function evaluateAnimationFragment(fragment, globalTime = 0, input = {}) {
	const clockState = evaluateFragmentClock(fragment.clock, globalTime);
	const clip = animationFragmentClip(fragment, input.clipId);
	if (!clip) {
		return emptyPose(fragment, clockState);
	}
	const clipPhase = normalizedPhase(
		clockState.localTime / positive(clip.cycleLength, 1)
		+ fragment.clock.phaseOffset
	);
	const amplitudeScale = clockState.amplitudeScale * nonNegative(input.amplitudeScale, 1);
	return Object.freeze({
		clipId: clip.id,
		events: Object.freeze(activeEvents(clip, clipPhase)),
		fragmentId: fragment.id,
		localTime: clockState.localTime,
		phase: clipPhase,
		poses: Object.freeze(clip.channels.map((channel) => {
			return evaluateChannel(channel, clipPhase, amplitudeScale);
		})),
		syncGroup: clockState.syncGroup,
		type: "animation-fragment-pose"
	});
}

/** Converts one procedural channel into an axis-angle local rotation intent. */
function evaluateChannel(channel, phase, amplitudeScale) {
	const localPhase = normalizedPhase(phase + finite(channel.phaseOffset, 0));
	const wave = waveform(channel.waveform, localPhase);
	const angle = finite(channel.bias, 0)
		+ finite(channel.amplitude, 0) * wave * amplitudeScale;
	return Object.freeze({
		angle,
		axis: Object.freeze([...(channel.axis || [1, 0, 0])]),
		localBoneId: channel.localBoneId,
		twist: finite(channel.twist, 0) * wave * amplitudeScale
	});
}

/** Emits one deterministic event pulse around the clip's canonical contact phase. */
function activeEvents(clip, phase) {
	if (!clip.event || clip.event === "none") {
		return [];
	}
	const distance = Math.min(Math.abs(phase), Math.abs(1 - phase));
	return distance < 0.035
		? [{ id: clip.event, phase }]
		: [];
}

/** Supports smooth cycles and sharper action pulses without mutable keyframe state. */
function waveform(type, phase) {
	if (type === "pulse") {
		return Math.sin(phase * Math.PI) ** 3;
	}
	return Math.sin(phase * Math.PI * 2);
}

/** Creates a stable empty pose when a fragment intentionally owns no clips. */
function emptyPose(fragment, clockState) {
	return Object.freeze({
		clipId: "",
		events: Object.freeze([]),
		fragmentId: fragment.id,
		localTime: clockState.localTime,
		phase: clockState.phase,
		poses: Object.freeze([]),
		syncGroup: clockState.syncGroup,
		type: "animation-fragment-pose"
	});
}

/** Wraps an arbitrary phase into one normalized cycle. */
function normalizedPhase(value) {
	return ((value % 1) + 1) % 1;
}

/** Returns a finite number or fallback. */
function finite(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) ? number : fallback;
}

/** Returns a positive finite number or fallback. */
function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}

/** Returns a non-negative finite number or fallback. */
function nonNegative(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number >= 0 ? number : fallback;
}
