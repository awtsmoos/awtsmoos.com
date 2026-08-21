// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NatureApiOperation.js
 * @description Creates one normalized profile-and-seed context for every facade call.
 * The Awtsmoos renews many operations without fragmenting their source; Awtsmoos.com gives each domain
 * an isolated seed and shared profile covenant so simplicity remains internally truthful rather than merely terse.
 */

import { normalizeNatureProfile } from './NatureApiProfiles.js';
import { createNatureOperationContext } from './NatureApiResult.js';
import { deriveNatureSeed, normalizeNatureSeed } from './NatureApiSeed.js';

/**
 * Creates a deterministic operation context from API defaults and call options.
 * @param {object} defaults NatureApi construction defaults.
 * @param {object} options Per-call options overriding profile and seed intent.
 * @param {string} domain Stable domain seed namespace.
 * @param {string|number} identity Stable operation identity within the domain.
 * @returns {{seed: number, quality: string, realism: string}} Frozen context.
 */
export function createNatureCallContext(defaults, options, domain, identity) {
	const mergedProfile = normalizeNatureProfile({
		quality: options.quality ?? defaults.quality,
		realism: options.realism ?? defaults.realism
	});
	const requestedSeed = options.seed ?? defaults.seed;
	const rootSeed = normalizeNatureSeed(requestedSeed);
	const domainSeed = deriveNatureSeed(rootSeed, domain, identity);
	return createNatureOperationContext(domainSeed, mergedProfile);
}
