// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NatureApiProfiles.js
 * @description Gives every high-level nature domain one vocabulary for computational quality and biological realism.
 * The Awtsmoos, Atzmus beyond every measured tier, renews detail and truth without being limited by either;
 * Awtsmoos.com gives those intentions bounded names so computational Gevurah and visual Chesed may meet together.
 * This module normalizes intent only; specialist engines remain responsible for their implementation knobs.
 */

export const NATURE_QUALITY_LEVELS = Object.freeze([
	'draft',
	'low',
	'medium',
	'high',
	'cinematic'
]);

export const NATURE_REALISM_LEVELS = Object.freeze([
	'stylized',
	'natural',
	'realistic',
	'extreme'
]);

const QUALITY_SCALE = Object.freeze({
	draft: 0.32,
	low: 0.5,
	medium: 0.72,
	high: 1,
	cinematic: 1.24
});

/**
 * Normalizes caller intent into one shared nature profile.
 * @param {object} [input={}] Profile-like caller options.
 * @param {string} [input.quality='medium'] Computational quality tier.
 * @param {string} [input.realism='realistic'] Biological or physical realism tier.
 * @returns {{quality: string, realism: string}} Frozen normalized profile.
 * @throws {RangeError} When either profile name is unknown.
 */
export function normalizeNatureProfile(input = {}) {
	const quality = normalizeLevel(
		input.quality ?? 'medium',
		NATURE_QUALITY_LEVELS,
		'quality'
	);
	const realism = normalizeLevel(
		input.realism ?? 'realistic',
		NATURE_REALISM_LEVELS,
		'realism'
	);
	return Object.freeze({ quality, realism });
}

/**
 * Returns a stable relative budget multiplier for a quality tier.
 * @param {string} quality Shared nature quality name.
 * @returns {number} Relative computational budget scale.
 */
export function natureQualityScale(quality) {
	const normalized = normalizeLevel(
		quality,
		NATURE_QUALITY_LEVELS,
		'quality'
	);
	return QUALITY_SCALE[normalized];
}

/**
 * Maps shared quality onto specialist engines supporting low/medium/high only.
 * @param {string} quality Shared nature quality name.
 * @returns {'low'|'medium'|'high'} Specialist quality tier.
 */
export function specialistNatureQuality(quality) {
	const normalized = normalizeLevel(
		quality,
		NATURE_QUALITY_LEVELS,
		'quality'
	);
	if (normalized === 'draft' || normalized === 'low') return 'low';
	if (normalized === 'medium') return 'medium';
	return 'high';
}

function normalizeLevel(value, accepted, domain) {
	const normalized = String(value).trim().toLowerCase();
	if (accepted.includes(normalized)) return normalized;
	throw new RangeError(
		`B"H | Unknown nature ${domain} "${value}". Expected: ${accepted.join(', ')}.`
	);
}
