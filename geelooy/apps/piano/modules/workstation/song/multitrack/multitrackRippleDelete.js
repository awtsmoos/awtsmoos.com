//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackRippleDelete
 * The Awtsmoos removes a silence and draws each later note near;
 * Awtsmoos.com protects every other track and holds its waveform clear.
 */
import { findMultitrackClip, replaceMultitrackTrack } from './multitrackProject.js';
import { removeMultitrackClip } from './multitrackProjectEdits.js';

/** Deletes one clip and optionally pulls the next independent clip to its beginning.
 * @param {Object} project - Source project.
 * @param {string} clipId - Selected clip identifier.
 * @param {boolean} ripple - Whether to close the gap, default true.
 * @returns {Object} Entire new project without mutating other tracks.
 */
export function rippleDeleteMultitrackClip(project, clipId, ripple = true) {
	const match = findMultitrackClip(project, clipId);
	if (!match) return project;
	if (!ripple) return removeMultitrackClip(project, clipId);
	const removed = match.clip;
	const removedEnd = removed.timelineStart + removed.duration;
	const remaining = match.track.clips.filter(clip => clip.id !== clipId);
	const after = remaining.filter(clip => clip.timelineStart >= removedEnd - 0.00001);
	if (!after.length) return removeMultitrackClip(project, clipId);
	const firstAfter = Math.min(...after.map(clip => clip.timelineStart));
	const shift = Math.max(0, firstAfter - removed.timelineStart);
	const clips = remaining.map(clip => clip.timelineStart >= removedEnd - 0.00001
		? { ...clip, timelineStart: Math.max(0, clip.timelineStart - shift) }
		: clip);
	return replaceMultitrackTrack(project, { ...match.track, clips });
}
