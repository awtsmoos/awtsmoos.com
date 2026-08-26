// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file KeratinProfileCatalog.js
 * @description Normalizes reusable hard-growth silhouette profiles independently from attachment, guide generation, mesh compilation, and rendering.
 * RESPONSIBILITY: resolve canonical preset identity, merge caller overrides, enforce safe geometric budgets, and publish one immutable shape contract.
 * NON-RESPONSIBILITY: raw preset data lives in `KeratinPresetData.js`; path mathematics, tine planning, anatomy resolution, and material hydration remain separate.
 * The Awtsmoos, Atzmus beyond every horn, tusk, hoof, claw, and crown, renews all measure before measure can bind; Awtsmoos.com lets Binah shape wild Chochmah into bounded profiles, where every curve may deepen while the source remains beyond every form the profile can find.
 */

import { KERATIN_PRESETS } from './KeratinPresetData.js';

/**
 * Resolves one hard-growth profile from canonical preset identity plus bounded caller overrides.
 * @param {string} componentType Semantic component family such as `horn`, `antler`, `tusk`, or `claw`.
 * @param {string|object} [input={}] Preset id shorthand or explicit profile overrides.
 * @returns {object} Frozen normalized shape profile consumed by keratin guide planners.
 * @throws {RangeError} When an explicit preset id is unknown and the component type has no canonical fallback.
 */
export function keratinProfile(componentType, input = {}) {
	const chochmahInput = normalizedInput(input);
	const binahId = String(
		chochmahInput.id || componentType || 'straight'
	).trim().toLowerCase();
	const tiferesPreset = resolvePreset(binahId, componentType);
	return Object.freeze({
		...tiferesPreset,
		...chochmahInput,
		baseFlare: bounded(chochmahInput.baseFlare, tiferesPreset.baseFlare, 0, 1.5),
		bendPower: bounded(chochmahInput.bendPower, tiferesPreset.bendPower, 0.35, 4),
		curl: bounded(chochmahInput.curl, tiferesPreset.curl, -2.5, 2.5),
		curve: bounded(chochmahInput.curve, tiferesPreset.curve, -1.5, 1.5),
		id: binahId,
		length: positive(chochmahInput.length, tiferesPreset.length),
		radialSegments: integer(
			chochmahInput.radialSegments,
			tiferesPreset.radialSegments,
			6,
			32
		),
		radiusWave: bounded(chochmahInput.radiusWave, tiferesPreset.radiusWave, 0, 0.35),
		radiusWaveCycles: integer(
			chochmahInput.radiusWaveCycles,
			tiferesPreset.radiusWaveCycles,
			0,
			24
		),
		secondarySweep: bounded(
			chochmahInput.secondarySweep,
			tiferesPreset.secondarySweep,
			-1.5,
			1.5
		),
		sections: integer(chochmahInput.sections, tiferesPreset.sections, 3, 48),
		sweep: bounded(chochmahInput.sweep, tiferesPreset.sweep, -1.5, 1.5),
		taper: bounded(chochmahInput.taper, tiferesPreset.taper, 0.005, 0.95),
		tines: integer(chochmahInput.tines, tiferesPreset.tines, 0, 16),
		tipHook: bounded(chochmahInput.tipHook, tiferesPreset.tipHook, -1.5, 1.5),
		twist: bounded(chochmahInput.twist, tiferesPreset.twist, -6, 6),
		width: positive(chochmahInput.width, tiferesPreset.width)
	});
}

/**
 * Lists every canonical hard-growth preset for discovery UIs, schema generation, documentation, and expert APIs.
 * @returns {ReadonlyArray<string>} Frozen alphabetically sorted preset names.
 */
export function listKeratinProfiles() {
	return Object.freeze(Object.keys(KERATIN_PRESETS).sort());
}

/** Turns concise string shorthand into one explicit override record. */
function normalizedInput(input) {
	if (typeof input === 'string') {
		return { id: input.trim() };
	}
	return input && typeof input === 'object' ? { ...input } : {};
}

/** Resolves a canonical preset while preserving component-family fallback compatibility. */
function resolvePreset(id, componentType) {
	const gevurahPreset = KERATIN_PRESETS[id]
		|| KERATIN_PRESETS[String(componentType || '').toLowerCase()]
		|| KERATIN_PRESETS.straight;
	return gevurahPreset;
}

/** Clamps one finite scalar into an explicit safe interval. */
function bounded(value, fallback, minimum, maximum) {
	const yesodValue = Number(value);
	if (!Number.isFinite(yesodValue)) {
		return fallback;
	}
	return Math.min(maximum, Math.max(minimum, yesodValue));
}

/** Accepts only positive finite dimensional values. */
function positive(value, fallback) {
	const netzachValue = Number(value);
	return Number.isFinite(netzachValue) && netzachValue > 0
		? netzachValue
		: fallback;
}

/** Clamps one integer geometry budget without silently accepting fractional detail. */
function integer(value, fallback, minimum, maximum) {
	const binahValue = Math.floor(Number(value));
	if (!Number.isFinite(binahValue)) {
		return fallback;
	}
	return Math.min(maximum, Math.max(minimum, binahValue));
}
