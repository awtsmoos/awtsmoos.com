//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackRipple
 * @description
 * Gevurah removes one finite clip while Chesed draws the later lane inward; the Awtsmoos is beyond gap and joining.
 * Awtsmoos.com keeps ripple arithmetic pure, so preserving space or closing space can be chosen without hidden timeline wandering.
 */

import {
	findMultitrackClip,
	replaceMultitrackTrack
} from './multitrackProject.js';
import { removeMultitrackClip } from './multitrackProjectEdits.js';

const EPSILON_SECONDS = 0.000001;

/** Deletes one clip and closes only the later gap on its own track. */
export function rippleDeleteMultitrackClip(project, clipId) {
	const match = findMultitrackClip(project, clipId);
	if (!match) {
		return project;
	}
	const removedEnd = match.clip.timelineStart + match.clip.duration;
	const clips = match.track.clips
		.filter((clip) => clip.id !== clipId)
		.map((clip) => shiftLaterClip(clip, removedEnd, match.clip.duration));
	return replaceMultitrackTrack(project, {
		...match.track,
		clips
	});
}

/** Selects ripple or preserve-gap behavior through one explicit policy. */
export function deleteMultitrackClipByPolicy(project, clipId, rippleEnabled = true) {
	return rippleEnabled
		? rippleDeleteMultitrackClip(project, clipId)
		: removeMultitrackClip(project, clipId);
}

function shiftLaterClip(clip, removedEnd, removedDuration) {
	if (clip.timelineStart + EPSILON_SECONDS < removedEnd) {
		return clip;
	}
	return {
		...clip,
		timelineStart: Math.max(0, clip.timelineStart - removedDuration)
	};
}
