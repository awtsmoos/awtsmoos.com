//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackRatchet
 * @description
 * Gevurah contracts one audio fragment faster and faster while the Awtsmoos remains beyond repetition, duration, and drop.
 * Awtsmoos.com keeps every generated fragment pointed at the untouched source buffer, so an intense build may fracture in time without ever wounding the original sound.
 */

import { createMultitrackClip } from './multitrackProject.js';

const MAX_RATCHET_REPETITIONS = 16;
const MINIMUM_CLIP_SECONDS = 0.001;

/**
 * Builds shrinking audio fragments followed by a full selected-clip drop.
 *
 * @param {Object} clip Selected source clip.
 * @param {number} tempo Project tempo in BPM.
 * @param {Object} settings Song Studio ratchet settings expressed in beats.
 * @returns {Object[]} Generated ratchet fragments plus final drop.
 */
export function buildMultitrackRatchetDrop(clip, tempo, settings = {}) {
	const beatSeconds = 60 / positive(tempo, 120);
	const sliceStart = Math.max(0, Number(settings.sliceStart) || 0) * beatSeconds;
	const requestedLength = positive(settings.sliceLength, 1) * beatSeconds;
	const available = clip.duration - sliceStart;
	if (available <= MINIMUM_CLIP_SECONDS) {
		throw new Error('Ratchet slice start falls outside the selected audio clip.');
	}
	const baseLength = Math.min(requestedLength, available);
	const ratio = shrinkingRatio(settings.shortenRatio);
	const minimum = Math.min(
		baseLength,
		positive(settings.minimumSlice, 1 / 32) * beatSeconds
	);
	const repetitions = Math.min(
		MAX_RATCHET_REPETITIONS,
		Math.max(1, Math.floor(positive(settings.repetitions, 7)))
	);
	const fragments = [];
	let cursor = clip.timelineStart;
	let length = baseLength;
	for (let index = 0; index < repetitions; index += 1) {
		fragments.push(createRatchetFragment(clip, settings, index, cursor, sliceStart, length));
		cursor += length;
		length = Math.max(minimum, length * ratio);
	}
	cursor += Math.max(0, Number(settings.gapAfter) || 0) * beatSeconds;
	fragments.push(createDropClip(clip, cursor));
	return fragments;
}

function createRatchetFragment(clip, settings, index, cursor, sliceStart, length) {
	const gate = clamp(Number(settings.gate ?? 0.75), 0.05, 1);
	const rise = Math.max(0, Number(settings.velocityRamp) || 0);
	return createMultitrackClip({
		...clip,
		id: undefined,
		name: `${clip.name} Ratchet ${index + 1}`,
		timelineStart: cursor,
		sourceOffset: clip.sourceOffset + sliceStart,
		duration: Math.max(MINIMUM_CLIP_SECONDS, length * gate),
		gain: clamp(clip.gain * (1 + index * rise), 0, 2),
		loop: false
	});
}

function createDropClip(clip, timelineStart) {
	return createMultitrackClip({
		...clip,
		id: undefined,
		name: `${clip.name} DROP`,
		timelineStart,
		loop: false
	});
}

function shrinkingRatio(value) {
	const ratio = Number(value ?? 0.5);
	if (!(ratio > 0 && ratio < 1)) {
		throw new Error('Ratchet shorten ratio must stay between 0 and 1.');
	}
	return ratio;
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}

function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, Number.isFinite(value) ? value : minimum));
}
