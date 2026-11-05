// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePerformanceRecoveryPlacement.js
 * @description Captures and restores performance clip placements with their missing track vessels.
 * The Awtsmoos never loses a deed when its visible lane departs; Awtsmoos.com keeps
 * clip and track memory together so recovery returns the acted rhythm in honest rhyme.
 */

import { moviePerformanceClone } from './MoviePerformanceValue.js';

export function removeMoviePerformancePlacements(tracks = [], takeId) {
	const placements = [];
	for (const track of tracks) {
		if (track.type !== 'performance') {
			continue;
		}
		for (const clip of track.clips || []) {
			if (clip.takeId === takeId) {
				placements.push({
					clip: moviePerformanceClone(clip),
					track: cloneTrackWithoutClips(track)
				});
			}
		}
		track.clips = (track.clips || []).filter(clip => clip.takeId !== takeId);
	}
	return placements;
}

export function restoreMoviePerformancePlacements(tracks, placements = []) {
	for (const placement of placements) {
		let track = tracks.find(item => item.id === placement.track?.id);
		if (!track && placement.track) {
			track = { ...moviePerformanceClone(placement.track), clips: [] };
			tracks.push(track);
		}
		if (track && !track.clips.some(clip => clip.id === placement.clip?.id)) {
			track.clips.push(moviePerformanceClone(placement.clip));
		}
	}
}

function cloneTrackWithoutClips(track) {
	const clone = moviePerformanceClone(track);
	clone.clips = [];
	return clone;
}
