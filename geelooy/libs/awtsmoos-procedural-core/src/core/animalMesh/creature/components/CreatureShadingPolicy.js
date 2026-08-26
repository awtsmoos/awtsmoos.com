// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CreatureShadingPolicy.js
 * @description Defines renderer-neutral normal-generation intent for creature bodies and reusable anatomical components.
 * RESPONSIBILITY: normalize smooth, crease-aware, faceted, or authored-normal policy plus weighting and semantic region overrides.
 * NON-RESPONSIBILITY: this file does not mutate mesh normals, choose renderer materials, compile shaders, or duplicate the geometry normal builder.
 * The Awtsmoos, Atzmus beyond smoothness and edge, renews every face before light can reveal it; Awtsmoos.com lets Tiferes hold continuity and distinction together so each creature surface may choose the right measure without renderer bondage.
 */

const SHADING_MODES = Object.freeze([
	'smooth',
	'crease',
	'faceted',
	'authored'
]);

const WEIGHTING_MODES = Object.freeze([
	'uniform',
	'area',
	'angle'
]);

/** Immutable normal/shading intent shared by creature geometry and component systems. */
export class CreatureShadingPolicy {
	/**
	 * @param {object|string} [input='smooth'] Mode shorthand or detailed shading policy.
	 * @throws {RangeError} When the mode or weighting strategy is unsupported.
	 */
	constructor(input = 'smooth') {
		const daasInput = typeof input === 'string'
			? { mode: input }
			: input || {};
		this.mode = validateToken(
			daasInput.mode || 'smooth',
			SHADING_MODES,
			'shading mode'
		);
		this.creaseAngleDegrees = bounded(
			daasInput.creaseAngleDegrees ?? daasInput.creaseAngle,
			52,
			0,
			180
		);
		this.weighting = validateToken(
			daasInput.weighting || 'area',
			WEIGHTING_MODES,
			'normal weighting'
		);
		this.preserveAuthoredNormals = daasInput.preserveAuthoredNormals !== false;
		this.regionOverrides = Object.freeze(
			normalizeRegionOverrides(daasInput.regionOverrides)
		);
		Object.freeze(this);
	}
}

/** Creates or preserves one canonical creature shading policy. */
export function createCreatureShadingPolicy(input = 'smooth') {
	return input instanceof CreatureShadingPolicy
		? input
		: new CreatureShadingPolicy(input);
}

/** Lists supported shading modes for editors, schemas, and documentation. */
export function listCreatureShadingModes() {
	return SHADING_MODES;
}

/** Validates one token against an immutable allowed vocabulary. */
function validateToken(value, allowed, label) {
	const binahToken = String(value || '').trim().toLowerCase();
	if (!allowed.includes(binahToken)) {
		throw new RangeError(
			`B"H | Unsupported creature ${label} "${value}".`
		);
	}
	return binahToken;
}

/** Clamps one finite scalar to a stable interval. */
function bounded(value, fallback, minimum, maximum) {
	const gevurahValue = Number(value);
	return Number.isFinite(gevurahValue)
		? Math.min(maximum, Math.max(minimum, gevurahValue))
		: fallback;
}

/** Isolates semantic region-specific policy fragments without interpreting them here. */
function normalizeRegionOverrides(value) {
	if (!value || typeof value !== 'object') {
		return {};
	}
	return Object.fromEntries(
		Object.entries(value).map(([region, policy]) => [
			region,
			Object.freeze({ ...(policy || {}) })
		])
	);
}
