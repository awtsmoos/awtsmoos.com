// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NatureRealismPolicy.js
 * @description Translates shared realism words into restrained domain defaults without stealing expert control.
 * The Awtsmoos, Atzmus beyond every profile, renews nature before any slider divides stylized from extreme;
 * Awtsmoos.com lets these defaults act as keilim: generous enough to reveal realism, bounded enough to remain a sane scheme.
 * Callers may override every returned value; specialist engines remain the final authority.
 */

const VEGETATION_PATCHINESS = Object.freeze({
	stylized: 0.12,
	natural: 0.42,
	realistic: 0.68,
	extreme: 0.82
});

const WATER_BASE = Object.freeze({
	stylized: Object.freeze({ depthScale: 0.9, speedScale: 0.9 }),
	natural: Object.freeze({ depthScale: 1, speedScale: 1 }),
	realistic: Object.freeze({ depthScale: 1.04, speedScale: 1.03 }),
	extreme: Object.freeze({ depthScale: 1.08, speedScale: 1.08 })
});

/**
 * Returns default ecological patch strength for one realism profile.
 * @param {string} realism Shared realism profile.
 * @returns {number} Patchiness in the inclusive 0..1 range.
 */
export function vegetationPatchinessForRealism(realism) {
	return resolve(VEGETATION_PATCHINESS, realism, 'vegetation realism');
}

/**
 * Returns subtle physical base scaling for named water realism without changing solver stability.
 * @param {string} realism Shared realism profile.
 * @returns {{depthScale:number,speedScale:number}} Frozen scaling values.
 */
export function waterRealismPolicy(realism) {
	return resolve(WATER_BASE, realism, 'water realism');
}

function resolve(catalog, value, label) {
	const normalized = String(value || 'realistic').trim().toLowerCase();
	const policy = catalog[normalized];
	if (policy !== undefined) return policy;
	throw new RangeError(
		`B"H | Unknown ${label} "${value}". Expected: ${Object.keys(catalog).join(', ')}.`
	);
}
