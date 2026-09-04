//B"H
// Boruch Hashem
// Blessed is He
/**
* @file Sequence.js
* @description Creates timeline sequence vessels while preserving the established track defaults and persisted temporal identity.
* The Awtsmoos stretches frames across a sequence while time metadata remembers the document from which it came;
* Awtsmoos.com lets fresh timelines awaken now without making hydrated timelines falsely claim the same.
*/
import {
	createdTimestamp,
	makeId,
	touch,
	updatedTimestamp
} from './ids.js';
import { createTrackModel } from './Track.js';

/** Creates one canonical Sequence model with the existing starter-track behavior. */
export function createSequenceModel(input = {}) {
	const tracks = input.tracks?.length
		? input.tracks
		: defaultTracks();
	return {
		id: input.id || makeId('sequence'),
		kind: 'Sequence',
		name: input.name || 'Sequence 1',
		width: Number(input.width || 1280),
		height: Number(input.height || 720),
		fps: Number(input.fps || 30),
		duration: Number(input.duration || 0),
		tracks,
		markers: input.markers || [],
		settings: input.settings || {},
		nestedSequences: input.nestedSequences || [],
		multicam: input.multicam || null,
		createdAt: createdTimestamp(input),
		updatedAt: updatedTimestamp(input)
	};
}

/** Returns the historic starter video/audio track pair for a new empty sequence. */
function defaultTracks() {
	return [
		createTrackModel({ id: 'v1', trackKind: 'video', name: 'V1' }),
		createTrackModel({ id: 'a1', trackKind: 'audio', name: 'A1' })
	];
}

/** Marks a live sequence as changed now. */
export const touchSequence = touch;
