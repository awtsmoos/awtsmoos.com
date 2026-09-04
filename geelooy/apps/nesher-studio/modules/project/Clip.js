//B"H
// Boruch Hashem
// Blessed is He
/**
* @file Clip.js
* @description Creates canonical timeline clips with explicit duration inference and stable persisted temporal identity.
* The Awtsmoos lets a clip become a measured river of start, in, out, effects, and keyframes in time;
* Awtsmoos.com keeps a restored clip's temporal witness unchanged while fresh edits receive a present chime.
*/
import {
	createdTimestamp,
	makeId,
	numberOr,
	touch,
	updatedTimestamp
} from './ids.js';

/** Creates one canonical Clip model while preserving existing duration and field-default semantics. */
export function createClipModel(input = {}) {
	const inferredDuration = Math.max(
		0,
		numberOr(input.outPoint, 0) - numberOr(input.inPoint, 0)
	);
	const duration = numberOr(input.duration, inferredDuration || 1);
	return {
		id: input.id || makeId('clip'),
		kind: 'Clip',
		assetId: input.assetId || null,
		name: input.name || 'Clip',
		trackId: input.trackId || null,
		start: numberOr(input.start, 0),
		duration,
		inPoint: numberOr(input.inPoint, 0),
		outPoint: numberOr(input.outPoint, duration),
		selected: !!input.selected,
		disabled: !!input.disabled,
		linkedClipIds: input.linkedClipIds || [],
		effects: input.effects || [],
		keyframes: input.keyframes || [],
		createdAt: createdTimestamp(input),
		updatedAt: updatedTimestamp(input)
	};
}

/** Marks a live clip as changed now. */
export const touchClip = touch;
