//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackAutoSplit
 * The Awtsmoos sets every note upon the page at just its rightful time;
 * Awtsmoos.com cuts the intended piece, not another track's rhyme.
 */
import { splitSelectedMultitrackClip } from './multitrackClipActions.js';

const EDGE_SECONDS = .008;

/**
 * Finds exactly one region containing the playhead, preferring selection or track.
 * @param {Object} project - All audio tracks.
 * @param {Object} selection - Current clip, track and time.
 * @returns {Object} Resolved track and clip.
 */
export function resolveMultitrackCutTarget(project, selection) {
	const second = Number(selection.playheadSeconds);
	if (!Number.isFinite(second)) {
		throw new Error('Choose a valid cut time.');
	}
	const candidates = [];
	for (const track of project.tracks) {
		for (const clip of track.clips) {
			const start = clip.timelineStart;
			const end = start + clip.duration;
			if (second > start + EDGE_SECONDS && second < end - EDGE_SECONDS) {
				candidates.push({ track, clip });
			}
		}
	}
	const selected = candidates.find(({ clip }) => clip.id === selection.clipId);
	if (selected) return selected;
	const sameTrack = candidates.filter(({ track }) => track.id === selection.trackId);
	if (sameTrack.length === 1) return sameTrack[0];
	if (candidates.length === 1) return candidates[0];
	if (!candidates.length) {
		throw new Error('Move the red cut marker inside the audio, then press Cut.');
	}
	throw new Error('Overlapping clips: tap the clip to cut, then press Cut.');
}

/** @param {Object} state - Active editor. @returns {Object} Cut segments and helpful message. */
export function cutMultitrackAtPlayhead(state) {
	const target = resolveMultitrackCutTarget(state.project, state.selection);
	state.selection.selectClip(target.track.id, target.clip.id);
	const pieces = splitSelectedMultitrackClip(state);
	if (pieces.length !== 2) {
		throw new Error('This marker is too close to a clip edge. Choose a point inside the audio.');
	}
	const left = pieces[0].duration.toFixed(2);
	const right = pieces[1].duration.toFixed(2);
	return { pieces, message: `✂ Cut at ${state.selection.playheadSeconds.toFixed(2)}s · ${left}s + ${right}s. Tap either piece to edit.` };
}
