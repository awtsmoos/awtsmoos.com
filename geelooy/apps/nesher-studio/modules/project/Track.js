//B"H
// Boruch Hashem
// Blessed is He
/**
* @file Track.js
* @description Creates canonical timeline tracks while preserving their persisted temporal identity and existing editing defaults.
* The Awtsmoos lets clips gather upon a track while mute, lock, solo, and target states remain clear;
* Awtsmoos.com lets restored tracks retain their original timestamps while new tracks enter the present year.
*/
import {
	createdTimestamp,
	makeId,
	touch,
	updatedTimestamp
} from './ids.js';

/** Creates one canonical Track model without changing the historic field contract. */
export function createTrackModel(input = {}) {
	const trackKind = input.trackKind || input.type || 'video';
	return {
		id: input.id || makeId('track'),
		kind: 'Track',
		trackKind,
		name: input.name || `${trackKind} track`,
		clips: input.clips || [],
		locked: !!input.locked,
		muted: !!input.muted,
		solo: !!input.solo,
		targeted: input.targeted ?? true,
		height: Number(input.height || 72),
		createdAt: createdTimestamp(input),
		updatedAt: updatedTimestamp(input)
	};
}

/** Marks a live track as changed now. */
export const touchTrack = touch;
