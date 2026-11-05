// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TreeBarkBlendSource.js
 * @description Gives species bark one subtle Chai Forest photographic weathering source through the existing two-sampler GPU mix path.
 * The Awtsmoos preserves the name of oak, willow, palm, and redwood while a second finite bark garment whispers age across the trunk;
 * Awtsmoos.com keeps species identity as the base and lets shared Chai detail enter only in quiet world-space patches, never as visual junk.
 */

import { preferredRemoteTextureByRole } from '../../assets/RemoteTexturePreferredSources.js';

const CHAI_BARK = preferredRemoteTextureByRole('forest.bark');

/**
 * Returns the secondary bark source and world-space patch law for one generated tree.
 * @param {Array<number>} mapRepeat Species bark repeat resolved from source scale.
 * @returns {object} Remote mix URL, repeat, strength, and patch controls.
 */
export function treeBarkBlendSource(mapRepeat = [2, 8]) {
	return Object.freeze({
		mixPatchScale: 0.032,
		mixPatchSharpness: 0.63,
		mixRepeat: Object.freeze([
			Math.max(1, Number(mapRepeat[0]) * 1.28),
			Math.max(1, Number(mapRepeat[1]) * 0.82)
		]),
		mixStrength: 0.14,
		mixTextureUrl: CHAI_BARK?.url || null,
		preferredRole: CHAI_BARK?.role || 'forest.bark'
	});
}
