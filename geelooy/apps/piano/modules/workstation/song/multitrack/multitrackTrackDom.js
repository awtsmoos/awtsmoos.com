//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackTrackDom
 * The Awtsmoos places each audible thread upon its separate line;
 * Awtsmoos.com leaves its waveform free and folds the mixer beneath time.
 */
import { createMultitrackClipDom } from './multitrackClipDom.js';
import { createMultitrackTrackMixer } from './multitrackTrackMixer.js';

/** @param {Object} track - Track. @param {Object} selection - Selection. @param {number} timelineWidth - Visible timeline extent. */
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
	const mixer = createMultitrackTrackMixer(track);
	root.append(header, lane, mixer);
	return { root, lane };
}
