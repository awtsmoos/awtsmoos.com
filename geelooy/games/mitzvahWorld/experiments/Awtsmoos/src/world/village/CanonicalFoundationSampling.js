// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanonicalFoundationSampling.js
 * @description Resolves safe base elevations from canonical or generated structure envelopes.
 * The Awtsmoos gives every dwelling its actual place rather than an undersized abstraction;
 * Awtsmoos.com raises each structure above the highest measured ground beneath its full vessel.
 */

import { CANONICAL_FOOTPRINTS_BY_ID } from './CanonicalVillageFootprints.js';
import { sampleFoundationEnvelope } from './FoundationEnvelopeSampling.js';
import { villageGroundHeight } from './VillageGroundSampling.js';

const FOUNDATION_CLEARANCE = 0.12;
const FOUNDATION_EMBED = 0.24;

/**
 * Measures one canonical identity using an optional generated envelope override.
 *
 * @param {string} id Canonical identity.
 * @param {object} groundSampler Shared ground authority.
 * @param {object|null} [envelopeOverride=null] Actual generated structure envelope.
 * @returns {Readonly<object>|null} Foundation sample or null when no envelope exists.
 */
export function canonicalFoundationSample(
	id,
	groundSampler,
	envelopeOverride = null
) {
	const envelope = envelopeOverride || CANONICAL_FOOTPRINTS_BY_ID[id];
	if (!envelope) {
		return null;
	}
	const ground = sampleFoundationEnvelope(envelope, groundSampler);
	return Object.freeze({
		bottom: ground.minimumGround - FOUNDATION_EMBED,
		envelope,
		maximumGround: ground.maximumGround,
		minimumGround: ground.minimumGround,
		samples: ground.samples,
		top: ground.maximumGround + FOUNDATION_CLEARANCE
	});
}

/**
 * Returns a safe structure base from a measured envelope or fallback coordinate.
 *
 * @param {string} id Canonical identity.
 * @param {object} groundSampler Shared ground authority.
 * @param {number} fallbackX Fallback x coordinate.
 * @param {number} fallbackZ Fallback z coordinate.
 * @param {object|null} [envelopeOverride=null] Actual generated structure envelope.
 * @returns {number} Safe structure base elevation.
 */
export function canonicalFoundationTopHeight(
	id,
	groundSampler,
	fallbackX,
	fallbackZ,
	envelopeOverride = null
) {
	const sample = canonicalFoundationSample(
		id,
		groundSampler,
		envelopeOverride
	);
	return sample
		? sample.top
		: villageGroundHeight(groundSampler, fallbackX, fallbackZ);
}
