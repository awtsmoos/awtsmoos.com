// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file FeatherProfile.js
 * @description Normalizes explicit feather silhouette and fan-spacing intent independently from anatomical placement and guide generation.
 * RESPONSIBILITY: choose a canonical feather preset, merge bounded overrides, apply component scale, and derive deterministic lateral spacing for repeated fans.
 * NON-RESPONSIBILITY: raw preset data, frame transforms, shaft/vane geometry, covering distributions, mesh compilation, and material hydration remain separate.
 * The Awtsmoos, Atzmus beyond every plume, renews proportion before length or width can divide one feather from another; Awtsmoos.com lets Binah measure contour, down, flight, tail, display, and plume forms while the source remains beyond every feathered garment.
 */

import { FEATHER_PRESETS } from './FeatherPresetData.js';

/**
 * Creates one immutable explicit-feather profile for a single repetition member.
 * @param {object} component Canonical anatomical component recipe.
 * @param {object} [context={}] Repetition index/count context from the component recipe compiler.
 * @returns {object} Frozen scaled feather silhouette and lateral fan placement.
 */
export function createFeatherProfile(component, context = {}) {
	const chochmahInput = component.profile || {};
	const binahId = profileId(component.type, chochmahInput.id);
	const tiferesPreset = FEATHER_PRESETS[binahId] || FEATHER_PRESETS.contour;
	const gevurahCount = Math.max(1, Math.floor(Number(context.count) || 1));
	const chesedIndex = Math.max(0, Math.floor(Number(context.index) || 0));
	const malchusCentered = chesedIndex - (gevurahCount - 1) * 0.5;
	const yesodSpacing = positive(chochmahInput.spacing, tiferesPreset.spacing)
		* component.scale[0];
	return Object.freeze({
		asymmetry: bounded(chochmahInput.asymmetry, tiferesPreset.asymmetry, -0.8, 0.8),
		id: binahId,
		lateral: malchusCentered * yesodSpacing,
		length: positive(chochmahInput.length, tiferesPreset.length) * component.scale[2],
		lift: finite(chochmahInput.lift, tiferesPreset.lift) * component.scale[1],
		shaftCurve: bounded(chochmahInput.shaftCurve, tiferesPreset.shaftCurve, -0.8, 0.8),
		spacing: yesodSpacing,
		sweep: finite(chochmahInput.sweep, tiferesPreset.sweep) * component.scale[0],
		vanePeak: bounded(chochmahInput.vanePeak, tiferesPreset.vanePeak, 0.18, 0.88),
		vaneStart: bounded(chochmahInput.vaneStart, tiferesPreset.vaneStart, 0.02, 0.7),
		width: positive(chochmahInput.width, tiferesPreset.width) * component.scale[0]
	});
}

/** Lists canonical explicit-feather profile ids for expert discovery APIs and editors. */
export function listFeatherProfiles() {
	return Object.freeze(Object.keys(FEATHER_PRESETS).sort());
}

/** Chooses a biologically useful default profile from component family while honoring explicit ids. */
function profileId(type, explicitId) {
	if (explicitId) {
		return String(explicitId).trim().toLowerCase();
	}
	if (type === 'feather_fan') {
		return 'flight';
	}
	if (type === 'plume') {
		return 'plume';
	}
	return 'contour';
}

/** Returns a finite scalar or stable fallback. */
function finite(value, fallback) {
	const hodValue = Number(value);
	return Number.isFinite(hodValue) ? hodValue : fallback;
}

/** Returns a positive finite scalar or stable fallback. */
function positive(value, fallback) {
	const netzachValue = finite(value, fallback);
	return netzachValue > 0 ? netzachValue : fallback;
}

/** Clamps one finite biological proportion into a declared safe interval. */
function bounded(value, fallback, minimum, maximum) {
	const gevurahValue = finite(value, fallback);
	return Math.min(maximum, Math.max(minimum, gevurahValue));
}
