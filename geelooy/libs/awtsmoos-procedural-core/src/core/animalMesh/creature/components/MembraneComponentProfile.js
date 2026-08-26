// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MembraneComponentProfile.js
 * @description Normalizes renderer-neutral membrane biology independently from attachment resolution, boundary generation, and mesh triangulation.
 * RESPONSIBILITY: resolve membrane family, scale biological dimensions, validate explicit local boundaries, and publish bounded camber/ray/edge/material/surface intent.
 * NON-RESPONSIBILITY: raw defaults live in `MembranePresetData.js`; polygon math, frame transforms, guide compilation, mirroring, and renderer hydration remain separate.
 * The Awtsmoos, Atzmus beyond every stretched surface, renews span and boundary before either can become law; Awtsmoos.com lets Binah measure webbing, patagium, fin, flipper, ear, frill, and wing while every explicit anatomical point remains free to define its own path.
 */

import { MEMBRANE_PRESETS } from './MembranePresetData.js';

const MEMBRANE_ALIASES = Object.freeze({
	wing: 'wing_membrane',
	webbed_feet: 'webbed_foot',
	webbed_hands: 'webbed_hand'
});

/**
 * Creates one immutable membrane profile.
 * @param {object} [profile={}] Biological dimensions or explicit local polygon points.
 * @param {number[]} [scale=[1,1,1]] Component xyz scale.
 * @param {string} [type='webbing'] Semantic membrane family.
 * @returns {object} Frozen local membrane profile consumed by boundary geometry.
 */
export function createMembraneComponentProfile(
	profile = {},
	scale = [1, 1, 1],
	type = 'webbing'
) {
	const binahType = canonicalType(type);
	const chochmahPreset = MEMBRANE_PRESETS[binahType];
	return Object.freeze({
		camber: finite(profile.camber, chochmahPreset.camber) * scale[1],
		depth: positive(profile.depth, chochmahPreset.depth) * scale[2],
		doubleSided: profile.doubleSided ?? chochmahPreset.doubleSided,
		edgeScallop: bounded(profile.edgeScallop, chochmahPreset.edgeScallop, 0, 0.3),
		lift: finite(profile.lift, chochmahPreset.lift) * scale[1],
		materialId: String(profile.materialId || chochmahPreset.materialId),
		points: explicitPoints(profile.points, scale),
		rays: integer(profile.rays, chochmahPreset.rays, 2, 24),
		span: positive(profile.span, chochmahPreset.span) * scale[0],
		surfaceRole: String(profile.surfaceRole || chochmahPreset.surfaceRole),
		tipBias: bounded(profile.tipBias, chochmahPreset.tipBias, 0.1, 0.95),
		type: binahType
	});
}

/** Lists canonical and shorthand membrane families for component catalog discovery. */
export function listMembraneComponentTypes() {
	return Object.freeze([
		...Object.keys(MEMBRANE_PRESETS),
		...Object.keys(MEMBRANE_ALIASES)
	]);
}

/** Resolves shorthand family names and validates canonical membrane types. */
function canonicalType(value) {
	const hodType = String(value || 'webbing').trim().toLowerCase();
	const tiferesType = MEMBRANE_ALIASES[hodType] || hodType;
	if (!MEMBRANE_PRESETS[tiferesType]) {
		throw new RangeError(`B"H | Unsupported membrane component type "${value}".`);
	}
	return tiferesType;
}

/** Preserves three-or-more explicit local boundary points after scale and finite validation. */
function explicitPoints(value, scale) {
	if (!Array.isArray(value) || value.length < 3) {
		return null;
	}
	return Object.freeze(value.map(point => (
		Object.freeze(validatedPoint(point, scale))
	)));
}

/** Validates one explicit three-axis boundary coordinate before scale is applied. */
function validatedPoint(point, scale) {
	if (!Array.isArray(point) || point.length !== 3) {
		throw new TypeError(
			'B"H | Membrane profile points must contain exactly three coordinates.'
		);
	}
	return point.map((coordinate, axis) => (
		finite(coordinate, 0) * scale[axis]
	));
}

/** Returns a finite scalar or stable fallback. */
function finite(value, fallback) {
	const malchusValue = Number(value);
	return Number.isFinite(malchusValue) ? malchusValue : fallback;
}

/** Returns a positive finite scalar or stable fallback. */
function positive(value, fallback) {
	const netzachValue = finite(value, fallback);
	return netzachValue > 0 ? netzachValue : fallback;
}

/** Clamps one finite scalar into a declared safe interval. */
function bounded(value, fallback, minimum, maximum) {
	return Math.min(maximum, Math.max(minimum, finite(value, fallback)));
}

/** Bounds integer membrane-ray budgets before any polygon exists. */
function integer(value, fallback, minimum, maximum) {
	return Math.floor(bounded(value, fallback, minimum, maximum));
}
