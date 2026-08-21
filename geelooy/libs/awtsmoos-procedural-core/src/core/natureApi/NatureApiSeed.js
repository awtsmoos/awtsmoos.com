// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NatureApiSeed.js
 * @description Gives every nature domain one stable deterministic seed lineage without sharing mutable random state.
 * The Awtsmoos renews every apparent chance from one source beyond chance; Awtsmoos.com records a finite seed lineage
 * so creature, forest, grass, plant, river, and ecosystem may differ reproducibly without colliding in one stream.
 */

import { ecosystemSeed } from '../ecosystem/EcosystemRandom.js';

const DEFAULT_NATURE_SEED = 'awtsmoos-nature';

/**
 * Normalizes any caller seed into the shared unsigned deterministic representation.
 * @param {number|string|null|undefined} seed Caller seed or omitted default.
 * @returns {number} Stable unsigned seed.
 */
export function normalizeNatureSeed(seed = DEFAULT_NATURE_SEED) {
	return ecosystemSeed('nature', seed ?? DEFAULT_NATURE_SEED);
}

/**
 * Derives an isolated deterministic child seed for one domain identity.
 * @param {number|string} rootSeed Root seed shared by one NatureApi instance or request.
 * @param {string} domain Stable domain name such as creature, forest, or water.
 * @param {number|string} [identity='default'] Stable object or operation identity.
 * @returns {number} Stable unsigned child seed.
 */
export function deriveNatureSeed(rootSeed, domain, identity = 'default') {
	if (!String(domain || '').trim()) {
		throw new TypeError('B"H | Nature seed derivation requires a non-empty domain name.');
	}
	return ecosystemSeed(
		'nature',
		normalizeNatureSeed(rootSeed),
		String(domain),
		String(identity)
	);
}

/**
 * Returns the stable default seed label used when callers omit randomness intent.
 * @returns {string} Human-readable deterministic default label.
 */
export function defaultNatureSeedLabel() {
	return DEFAULT_NATURE_SEED;
}
