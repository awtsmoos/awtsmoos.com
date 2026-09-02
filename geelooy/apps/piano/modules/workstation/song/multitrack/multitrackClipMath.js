//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackClipMath
 * @description
 * Gevurah splits and trims finite boundaries while the Awtsmoos leaves the source sound whole beneath every change.
 * Awtsmoos.com moves only clip metadata, so a gesture may cut, shift, duplicate, and snap without destroying the audio map.
 */

import { createMultitrackClip } from './multitrackProject.js';

const MINIMUM_CLIP_SECONDS = 0.001;

/** Snaps seconds to a musical beat grid. @param {number} seconds Time. @param {number} tempo BPM. @param {number} gridBeats Beat grid, zero disables snapping. @returns {number} Snapped seconds. */
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

/** Moves a clip on the timeline. @param {Object} clip Clip. @param {number} timelineStart New start. @param {Object} timing Tempo/grid. @returns {Object} Moved clip. */
export function moveMultitrackClip(clip, timelineStart, timing = {}) {
	return {
		...clip,
		timelineStart: snapMultitrackTime(timelineStart, timing.tempo, timing.gridBeats)
	};
}

/** Trims or restores a clip's left edge within available source audio. @param {Object} clip Clip. @param {number} newStart Desired timeline start. @param {Object} timing Tempo/grid. @returns {Object} Trimmed clip. */
export function trimMultitrackClipLeft(clip, newStart, timing = {}) {
	const snapped = snapMultitrackTime(newStart, timing.tempo, timing.gridBeats);
	const earliestStart = Math.max(0, clip.timelineStart - clip.sourceOffset);
	const latestStart = clip.timelineStart + clip.duration - MINIMUM_CLIP_SECONDS;
	const start = clamp(snapped, earliestStart, latestStart);
	const delta = start - clip.timelineStart;
	return {
		...clip,
		timelineStart: start,
		sourceOffset: clip.sourceOffset + delta,
		duration: Math.max(MINIMUM_CLIP_SECONDS, clip.duration - delta)
	};
}

/** Trims a clip's right edge. @param {Object} clip Clip. @param {number} newEnd Desired timeline end. @param {Object} timing Tempo/grid. @param {number} sourceDuration Source buffer length. @returns {Object} Trimmed clip. */
export function trimMultitrackClipRight(clip, newEnd, timing = {}, sourceDuration = Infinity) {
	const snapped = snapMultitrackTime(newEnd, timing.tempo, timing.gridBeats);
	const available = Math.max(MINIMUM_CLIP_SECONDS, sourceDuration - clip.sourceOffset);
	const requested = snapped - clip.timelineStart;
	return {
		...clip,
		duration: clamp(requested, MINIMUM_CLIP_SECONDS, available)
	};
}

/** Splits one clip at a strict interior time. @param {Object} clip Clip. @param {number} splitTime Timeline split time. @returns {[Object,Object]} Left/right clips. */
export function splitMultitrackClip(clip, splitTime) {
	const offset = Number(splitTime) - clip.timelineStart;
	if (!(offset > MINIMUM_CLIP_SECONDS && offset < clip.duration - MINIMUM_CLIP_SECONDS)) {
		throw new Error('Split point must be inside the selected clip.');
	}
	const left = createMultitrackClip({
		...clip,
		id: undefined,
		name: `${clip.name} A`,
		duration: offset,
		loop: false
	});
	const right = createMultitrackClip({
		...clip,
		id: undefined,
		name: `${clip.name} B`,
		timelineStart: clip.timelineStart + offset,
		sourceOffset: clip.sourceOffset + offset,
		duration: clip.duration - offset,
		loop: false
	});
	return [left, right];
}

/** Duplicates a clip immediately after itself by default. @param {Object} clip Source clip. @param {number|null} start Optional start. @returns {Object} Duplicate. */
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
