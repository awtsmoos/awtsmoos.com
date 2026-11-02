//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackClipEnvelope
 * @description
 * Tiferes lets finite gain rise and release while the Awtsmoos remains beyond loudness, boundary, and clock.
 * Awtsmoos.com schedules the same truthful envelope from every seek point, so a partial fade keeps moving instead of freezing in time.
 */

import {
	multitrackClipEnvelopeDuration,
	readMultitrackClipEnvelopeOffsets
} from './multitrackClipEnvelopeSegments.js';

/** Normalizes edge fades against the full envelope lineage represented by a clip segment. */
export function normalizeMultitrackClipFades(
	fadeIn,
	fadeOut,
	duration,
	fadeInOffset = 0,
	fadeOutOffset = 0
) {
	const envelopeDuration = Math.max(
		0,
		finite(duration) + nonnegative(fadeInOffset) + nonnegative(fadeOutOffset)
	);
	const safeFadeIn = clamp(fadeIn, 0, envelopeDuration);
	const safeFadeOut = clamp(fadeOut, 0, Math.max(0, envelopeDuration - safeFadeIn));
	return { fadeIn: safeFadeIn, fadeOut: safeFadeOut };
}

/** Returns the clip gain at one local audible second, including lineage-preserved fades. */
export function multitrackClipEnvelopeGain(clip, elapsedSeconds) {
	const duration = Math.max(0, finite(clip?.duration));
	const offsets = readMultitrackClipEnvelopeOffsets(clip);
	const envelopeDuration = multitrackClipEnvelopeDuration(clip);
	const { fadeIn, fadeOut } = normalizeMultitrackClipFades(
		clip?.fadeIn,
		clip?.fadeOut,
		duration,
		offsets.fadeInOffset,
		offsets.fadeOutOffset
	);
	const local = clamp(elapsedSeconds, 0, duration);
	const envelopeTime = offsets.fadeInOffset + local;
	const gain = clamp(clip?.gain ?? 1, 0, 2);
	if (fadeIn > 0 && envelopeTime < fadeIn) {
		return gain * envelopeTime / fadeIn;
	}
	const fadeOutStart = envelopeDuration - fadeOut;
	if (fadeOut > 0 && envelopeTime > fadeOutStart) {
		return gain * (envelopeDuration - envelopeTime) / fadeOut;
	}
	return gain;
}

/** Schedules sample-accurate gain automation for any playable sub-range of one clip. */
export function scheduleMultitrackClipEnvelope(
	parameter,
	clip,
	when,
	elapsedSeconds,
	playableDuration
) {
	const duration = Math.max(0, finite(clip?.duration));
	const offsets = readMultitrackClipEnvelopeOffsets(clip);
	const { fadeIn, fadeOut } = normalizeMultitrackClipFades(
		clip?.fadeIn,
		clip?.fadeOut,
		duration,
		offsets.fadeInOffset,
		offsets.fadeOutOffset
	);
	const start = clamp(elapsedSeconds, 0, duration);
	const end = clamp(start + Math.max(0, finite(playableDuration)), start, duration);
	parameter.cancelScheduledValues(when);
	parameter.setValueAtTime(multitrackClipEnvelopeGain(clip, start), when);
	if (!(end > start)) {
		return;
	}
	let cursor = start;
	const fadeInEnd = fadeIn - offsets.fadeInOffset;
	if (fadeIn > 0 && fadeInEnd > start) {
		cursor = Math.min(end, fadeInEnd);
		rampToLocalTime(parameter, clip, when, start, cursor);
	}
	const fadeOutStart = duration + offsets.fadeOutOffset - fadeOut;
	if (fadeOut > 0 && fadeOutStart > cursor && fadeOutStart < end) {
		cursor = fadeOutStart;
		parameter.setValueAtTime(
			multitrackClipEnvelopeGain(clip, cursor),
			when + cursor - start
		);
	}
	if (fadeOut > 0 && end > fadeOutStart && end > cursor) {
		rampToLocalTime(parameter, clip, when, start, end);
	}
}

function rampToLocalTime(parameter, clip, when, start, localTime) {
	parameter.linearRampToValueAtTime(
		multitrackClipEnvelopeGain(clip, localTime),
		when + localTime - start
	);
}

function nonnegative(value) {
	return Math.max(0, finite(value));
}

function finite(value) {
	const number = Number(value);
	return Number.isFinite(number) ? number : 0;
}

function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, finite(value)));
}
