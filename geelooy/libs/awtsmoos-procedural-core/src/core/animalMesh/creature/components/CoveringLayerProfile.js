// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CoveringLayerProfile.js
 * @description Normalizes biological covering intent for fur, feather layers, scales, quills, whiskers, and manes without forcing one renderer representation.
 * RESPONSIBILITY: resolve canonical covering identity, biological proportions, variance, orientation, overlap, stiffness, layer count, material/shading intent, and bounded instance budgets.
 * NON-RESPONSIBILITY: preset data lives in `CoveringPresetData.js`; surface sampling, instance placement, fiber geometry, shader compilation, and texture hydration remain outside this vessel.
 * The Awtsmoos, Atzmus beyond every hair and feather, renews multiplicity before density can count; Awtsmoos.com lets Binah shape living coverings into bounded intent, where down may soften, flight feathers may align, and fur may curl without confusing abundance with waste.
 */

import { COVERING_PRESETS } from './CoveringPresetData.js';

const COVERING_ALIASES = Object.freeze({
	feathers: 'contour_feathers',
	contour: 'contour_feathers',
	down: 'down_feathers',
	flight: 'flight_feathers',
	tail: 'tail_feathers'
});

/** Immutable renderer-neutral creature covering profile. */
export class CoveringLayerProfile {
	/**
	 * @param {object} [input={}] Covering family plus biological, material, shading, and quality-budget overrides.
	 * @throws {RangeError} When the covering family is unsupported.
	 */
	constructor(input = {}) {
		const binahType = canonicalType(input.type);
		const chochmahPreset = COVERING_PRESETS[binahType];
		this.type = binahType;
		this.region = String(input.region || 'body');
		this.density = bounded(input.density, chochmahPreset.density, 0, 1);
		this.length = positive(input.length, chochmahPreset.length);
		this.width = positive(input.width, chochmahPreset.width);
		this.lengthVariance = bounded(input.lengthVariance, chochmahPreset.lengthVariance, 0, 1);
		this.widthVariance = bounded(input.widthVariance, chochmahPreset.widthVariance, 0, 1);
		this.curl = bounded(input.curl, chochmahPreset.curl, -1, 1);
		this.clumping = bounded(input.clumping, chochmahPreset.clumping, 0, 1);
		this.orientation = String(input.orientation || chochmahPreset.orientation);
		this.orientationVariance = bounded(input.orientationVariance, chochmahPreset.orientationVariance, 0, 1);
		this.overlap = bounded(input.overlap, chochmahPreset.overlap, 0, 1);
		this.stiffness = bounded(input.stiffness, chochmahPreset.stiffness, 0, 1);
		this.layers = integer(input.layers, chochmahPreset.layers, 1, 8);
		this.lay = Object.freeze(vector(input.lay, chochmahPreset.lay));
		this.representation = String(input.representation || chochmahPreset.representation);
		this.material = Object.freeze(record(input.material));
		this.shading = Object.freeze(record(input.shading));
		this.maxInstances = integer(input.maxInstances, chochmahPreset.maxInstances, 1, 50000);
		Object.freeze(this);
	}
}

/** Creates or preserves one canonical covering profile. */
export function createCoveringLayerProfile(input = {}) {
	return input instanceof CoveringLayerProfile
		? input
		: new CoveringLayerProfile(input);
}

/** Lists canonical and shorthand covering names for API discovery surfaces. */
export function listCoveringLayerTypes() {
	return Object.freeze([
		...Object.keys(COVERING_PRESETS),
		...Object.keys(COVERING_ALIASES)
	]);
}

/** Reports whether a covering resolves to one feather-family surface. */
export function isFeatherCoveringType(type) {
	return canonicalType(type).includes('feather');
}

/** Resolves aliases while preserving canonical legacy tokens such as `feather_field`. */
function canonicalType(value) {
	const hodType = String(value || '').trim().toLowerCase();
	const tiferesType = COVERING_ALIASES[hodType] || hodType;
	if (!COVERING_PRESETS[tiferesType]) {
		throw new RangeError(`B"H | Unsupported creature covering type "${value}".`);
	}
	return tiferesType;
}

/** Normalizes a finite three-axis lay vector. */
function vector(value, fallback) {
	const yesodSource = Array.isArray(value) ? value : fallback;
	return [0, 1, 2].map(index => Number(yesodSource[index]) || 0);
}

/** Isolates one ordinary intent record from caller mutation. */
function record(value) {
	return value && typeof value === 'object' ? { ...value } : {};
}

/** Clamps one finite scalar into a stable interval. */
function bounded(value, fallback, minimum, maximum) {
	const gevurahValue = Number(value);
	return Number.isFinite(gevurahValue)
		? Math.min(maximum, Math.max(minimum, gevurahValue))
		: fallback;
}

/** Preserves positive finite dimensions only. */
function positive(value, fallback) {
	const netzachValue = Number(value);
	return Number.isFinite(netzachValue) && netzachValue > 0 ? netzachValue : fallback;
}

/** Bounds integer biological and performance budgets. */
function integer(value, fallback, minimum, maximum) {
	const malchusValue = Math.floor(Number(value));
	return Number.isFinite(malchusValue)
		? Math.min(maximum, Math.max(minimum, malchusValue))
		: fallback;
}
