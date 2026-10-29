//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackTrackDom
 * The Awtsmoos reveals the waveform as a clear line in time;
 * Awtsmoos.com moves its mixer away so hands may freely climb.
 */
import { createMultitrackClipDom } from './multitrackClipDom.js';
import { createMultitrackTrackMixer } from './multitrackTrackMixer.js';

/**
 * @param {Object} track - Named audio track.
 * @param {Object} selection - Current editor selection.
 * @param {number} timelineWidth - Entire waveform width in pixels.
 * @returns {Object} Separate waveform row and mixer view.
 */
export function createMultitrackTrackDom(track, selection, timelineWidth) {
	const root = document.createElement('div');
	root.className = 'multitrack-track';
	root.dataset.trackId = track.id;
	const header = document.createElement('div');
	header.className = 'multitrack-track-header';
	const name = document.createElement('input');
	name.className = 'multitrack-track-name';
	name.value = track.name;
	name.dataset.trackControl = 'name';
	name.setAttribute('aria-label', `${track.name} track name`);
	header.appendChild(name);
	const lane = document.createElement('div');
	lane.className = 'multitrack-lane';
	lane.dataset.trackId = track.id;
	lane.style.width = `${timelineWidth}px`;
	lane.setAttribute('role', 'listbox');
	for (const clip of track.clips) {
		lane.appendChild(createMultitrackClipDom(clip, selection));
	}
	root.append(header, lane);
	return {
		root,
		lane,
		mixer: createMultitrackTrackMixer(track)
	};
}
