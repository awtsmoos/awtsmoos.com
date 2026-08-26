// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NatureApiProfiles.js
 * @description Gives every high-level nature domain one canonical profile vocabulary while friendly aliases normalize at the boundary.
 * The Awtsmoos, Atzmus beyond every measured tier, renews detail and truth without being limited by either;
 * Awtsmoos.com lets balanced speech become precise canonical intent so computational Gevurah and visual Chesed may meet together.
 * Specialist engines still own implementation knobs; this module only normalizes shared profile meaning.
 */
import {
	resolveNatureQualityAlias,
	resolveNatureRealismAlias
} from './NatureProfileAliases.js';

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
 * Normalizes caller intent into one shared canonical Nature profile.
 * Friendly aliases are resolved first, while returned values always use exported canonical names.
 * @param {object} [input={}] Profile-like caller options.
 * @param {string} [input.quality='medium'] Canonical or friendly computational quality tier.
 * @param {string} [input.realism='realistic'] Canonical or friendly biological/physical realism tier.
 * @returns {{quality: string, realism: string}} Frozen canonical profile.
 * @throws {RangeError} When a value is neither canonical nor an installed exact alias.
 */
export function normalizeNatureProfile(input = {}) {
	const quality = normalizeLevel(
		input.quality ?? 'medium',
		NATURE_QUALITY_LEVELS,
		'quality',
		resolveNatureQualityAlias
	);
	const realism = normalizeLevel(
		input.realism ?? 'realistic',
		NATURE_REALISM_LEVELS,
		'realism',
		resolveNatureRealismAlias
	);
	return Object.freeze({ quality, realism });
}

/**
 * Returns a stable relative budget multiplier for a canonical or friendly quality tier.
 * @param {string} quality Computational quality name or exact friendly alias.
 * @returns {number} Relative computational budget scale.
 */
export function natureQualityScale(quality) {
	const normalized = normalizeLevel(
		quality,
		NATURE_QUALITY_LEVELS,
		'quality',
		resolveNatureQualityAlias
	);
	return QUALITY_SCALE[normalized];
}

/**
 * Maps shared quality onto specialist engines supporting only low/medium/high.
 * @param {string} quality Shared canonical or friendly Nature quality name.
 * @returns {'low'|'medium'|'high'} Specialist quality tier.
 */
export function specialistNatureQuality(quality) {
	const normalized = normalizeLevel(
		quality,
		NATURE_QUALITY_LEVELS,
		'quality',
		resolveNatureQualityAlias
	);
	if (normalized === 'draft' || normalized === 'low') return 'low';
	if (normalized === 'medium') return 'medium';
	return 'high';
}

function normalizeLevel(valueOhr, acceptedOros, domainBinah, aliasResolver) {
	const normalizedYesod = aliasResolver(valueOhr);
	if (acceptedOros.includes(normalizedYesod)) return normalizedYesod;
	throw new RangeError(
		`B"H | Unknown nature ${domainBinah} "${valueOhr}". Expected: ${acceptedOros.join(', ')}.`
	);
}
