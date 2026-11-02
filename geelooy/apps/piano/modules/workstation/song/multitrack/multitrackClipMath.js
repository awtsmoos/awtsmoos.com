//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackClipMath
 * @description
 * Gevurah trims and divides finite regions while the Awtsmoos keeps the source sound whole beneath each measured line.
 * Awtsmoos.com moves metadata rather than samples, preserving gain and inherited envelope time through every lawful clip transformation.
 */

import {
	splitMultitrackClipEnvelope,
	trimMultitrackClipEnvelopeLeft,
	trimMultitrackClipEnvelopeRight
} from './multitrackClipEnvelopeSegments.js';
import { createMultitrackClip } from './multitrackProject.js';

const MINIMUM_CLIP_SECONDS = 0.001;

/** Snaps seconds to a musical beat grid. */
export function snapMultitrackTime(seconds, tempo, gridBeats) {
	const safe = Math.max(0, Number(seconds) || 0);
	const grid = Number(gridBeats);
	if (!(grid > 0)) {
		return safe;
	}
	const beatSeconds = 60 / positive(tempo, 120);
	const step = beatSeconds * grid;
	return Math.max(0, Number((Math.round(safe / step) * step).toFixed(6)));
}

/** Moves one clip without changing its audible source window or envelope. */
export function moveMultitrackClip(clip, timelineStart, timing = {}) {
	return {
		...clip,
		timelineStart: snapMultitrackTime(timelineStart, timing.tempo, timing.gridBeats)
	};
}

/** Trims or restores the left edge while preserving the inherited envelope segment. */
export function trimMultitrackClipLeft(clip, newStart, timing = {}) {
	const snapped = snapMultitrackTime(newStart, timing.tempo, timing.gridBeats);
	const earliestStart = Math.max(0, clip.timelineStart - clip.sourceOffset);
	const latestStart = clip.timelineStart + clip.duration - MINIMUM_CLIP_SECONDS;
	const start = clamp(snapped, earliestStart, latestStart);
	const delta = start - clip.timelineStart;
	return createMultitrackClip({
		...clip,
		...trimMultitrackClipEnvelopeLeft(clip, delta),
		timelineStart: start,
		sourceOffset: clip.sourceOffset + delta,
		duration: Math.max(MINIMUM_CLIP_SECONDS, clip.duration - delta)
	});
}

/** Trims or restores the right edge while preserving the inherited envelope segment. */
export function trimMultitrackClipRight(clip, newEnd, timing = {}, sourceDuration = Infinity) {
	const snapped = snapMultitrackTime(newEnd, timing.tempo, timing.gridBeats);
	const available = Math.max(MINIMUM_CLIP_SECONDS, sourceDuration - clip.sourceOffset);
	const requested = snapped - clip.timelineStart;
	const duration = clamp(requested, MINIMUM_CLIP_SECONDS, available);
	return createMultitrackClip({
		...clip,
		...trimMultitrackClipEnvelopeRight(clip, duration),
		duration
	});
}

/** Splits one clip into exact subsegments of the original audible envelope. */
export function splitMultitrackClip(clip, splitTime) {
	const offset = Number(splitTime) - clip.timelineStart;
	if (!(offset > MINIMUM_CLIP_SECONDS && offset < clip.duration - MINIMUM_CLIP_SECONDS)) {
		throw new Error('Split point must be inside the selected clip.');
	}
	const envelope = splitMultitrackClipEnvelope(clip, offset);
	const left = createMultitrackClip({
		...clip,
		...envelope.left,
		id: undefined,
		name: `${clip.name} A`,
		duration: offset,
		loop: false
	});
	const right = createMultitrackClip({
		...clip,
		...envelope.right,
		id: undefined,
		name: `${clip.name} B`,
		timelineStart: clip.timelineStart + offset,
		sourceOffset: clip.sourceOffset + offset,
		duration: clip.duration - offset,
		loop: false
	});
	return [left, right];
}

/** Duplicates a clip with gain, fades, lineage, trim, loop, and duration intact. */
export function duplicateMultitrackClip(clip, start = null) {
	return createMultitrackClip({
		...clip,
		id: undefined,
		name: `${clip.name} Copy`,
		timelineStart: start ?? clip.timelineStart + clip.duration
	});
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}

function clamp(value, minimum, maximum) {
	const number = Number(value);
	return Math.max(minimum, Math.min(maximum, Number.isFinite(number) ? number : minimum));
}
