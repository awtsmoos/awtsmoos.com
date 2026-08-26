// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NatureRealismPolicy.js
 * @description Translates shared realism words into restrained domain defaults without stealing expert control.
 * The Awtsmoos, Atzmus beyond every profile, renews nature before any slider divides stylized from extreme;
 * Awtsmoos.com lets these defaults act as keilim: simple at the surface, richly ecological when advanced callers deepen the scheme.
 */

import { vegetationEcologyPolicy } from './NatureEcologyPolicy.js';

const WATER_BASE = Object.freeze({
	stylized: Object.freeze({ depthScale: 0.9, speedScale: 0.9 }),
	natural: Object.freeze({ depthScale: 1, speedScale: 1 }),
	realistic: Object.freeze({ depthScale: 1.04, speedScale: 1.03 }),
	extreme: Object.freeze({ depthScale: 1.08, speedScale: 1.08 })
});

/**
 * Returns the complete immutable ecological policy for one vegetation realism profile.
 * @param {string} realism Shared realism profile.
 * @param {object} [overrides={}] Optional expert ecological overrides.
 * @returns {Readonly<object>} Serializable frozen ecological policy.
 */
export function vegetationRealismPolicy(realism, overrides = {}) {
	return vegetationEcologyPolicy(realism, overrides);
}

/**
 * Preserves the original scalar patchiness contract for legacy and specialist callers.
 * @param {string} realism Shared realism profile.
 * @returns {number} Patchiness in the inclusive 0..1 range.
 */
export function vegetationPatchinessForRealism(realism) {
	return vegetationRealismPolicy(realism).patchiness;
}

/**
 * Returns subtle physical base scaling for named water realism without changing solver stability.
 * @param {string} realism Shared realism profile.
 * @returns {{depthScale:number,speedScale:number}} Frozen scaling values.
 */
export function waterRealismPolicy(realism) {
	return resolvePolicy(WATER_BASE, realism, 'water realism');
}

/**
 * Resolves a named immutable policy from a catalog and rejects silent spelling drift.
 * @param {Readonly<object>} catalog Canonical policy catalog.
 * @param {unknown} value Requested profile label.
 * @param {string} label Human-readable contract label for failures.
 * @returns {unknown} Matching catalog policy.
 * @throws {RangeError} When the requested profile does not exist.
 */
function resolvePolicy(catalog, value, label) {
	const orosName = String(value || 'realistic').trim().toLowerCase();
	const keiliPolicy = catalog[orosName];
	if (keiliPolicy !== undefined) return keiliPolicy;
	throw new RangeError(`B"H | Unknown ${label} "${value}". Expected: ${Object.keys(catalog).join(', ')}.`);
}
