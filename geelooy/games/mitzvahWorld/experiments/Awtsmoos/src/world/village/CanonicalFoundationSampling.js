// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanonicalFoundationSampling.js
 * @description Resolves slope-aware finished-floor elevations from complete canonical support envelopes.
 * The Awtsmoos raises every dwelling above the mountain without severing it from the earth below;
 * Awtsmoos.com lets steeper ground earn a little more breathing room while retaining stone completes the flow.
 */

import { CANONICAL_FOOTPRINTS_BY_ID } from './CanonicalVillageFootprints.js';
import { sampleFoundationEnvelope } from './FoundationEnvelopeSampling.js';
import { villageGroundHeight } from './VillageGroundSampling.js';

const FOUNDATION_EMBED = 0.3;
const MINIMUM_CLEARANCE = 0.28;
const MAXIMUM_CLEARANCE = 0.75;
const SLOPE_CLEARANCE_FACTOR = 0.06;

/**
 * Measures one canonical identity using an optional generated envelope override.
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
	const terrainVariance = ground.maximumGround - ground.minimumGround;
	const clearance = Math.min(
		MAXIMUM_CLEARANCE,
		MINIMUM_CLEARANCE + terrainVariance * SLOPE_CLEARANCE_FACTOR
	);
	return Object.freeze({
		bottom: ground.minimumGround - FOUNDATION_EMBED,
		clearance,
		envelope,
		maximumGround: ground.maximumGround,
		minimumGround: ground.minimumGround,
		samples: ground.samples,
		terrainVariance,
		top: ground.maximumGround + clearance
	});
}

/**
 * Returns a safe finished-floor datum from a measured envelope or fallback coordinate.
 * @param {string} id Canonical identity.
 * @param {object} groundSampler Shared ground authority.
 * @param {number} fallbackX Fallback x coordinate.
 * @param {number} fallbackZ Fallback z coordinate.
 * @param {object|null} [envelopeOverride=null] Actual generated structure envelope.
 * @returns {number} Safe finished-floor elevation.
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
