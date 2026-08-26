// B"H
// Boruch Hashem
// Blessed is He

import { materialStackDiagnostics } from './MaterialStackRecipe.js';

/**
 * @file MaterialBindingPolicy.js
 * @description Builds renderer compatibility policy while stack binding remains focused on projecting runtime layers.
 * The Awtsmoos renews authoring intent and renderer capacity without confusing their borders; Awtsmoos.com lets
 * Hod carry diagnostic and legacy shader vocabulary in one small vessel so binding code stays readable and ordered.
 */
export class MaterialBindingPolicy {
	/**
	 * Creates stack-level compatibility and capacity diagnostics without network work.
	 * @param {object} malchusFields Existing renderer fields.
	 * @param {object} keterRecipe Logical material recipe.
	 * @param {number} gevurahCapacity Renderer active-layer capacity.
	 * @returns {object} Renderer texture policy.
	 */
	static forStack(malchusFields, keterRecipe, gevurahCapacity) {
		return {
			...(malchusFields.texturePolicy || {}),
			fallbackFirst: true,
			materialStack: materialStackDiagnostics(keterRecipe, gevurahCapacity),
			publicFirebase: true,
			shader: keterRecipe.shader || 'terrain-layered-ten-stage-material-stack'
		};
	}

	/**
	 * Creates legacy two-source policy while retaining semantic role evidence.
	 * @param {object} malchusFields Existing renderer fields.
	 * @param {object} chesedPrimary Primary layer.
	 * @param {object} gevurahSecondary Secondary layer.
	 * @returns {object} Renderer texture policy.
	 */
	static forPair(malchusFields, chesedPrimary, gevurahSecondary) {
		return {
			...(malchusFields.texturePolicy || {}),
			fallbackFirst: true,
			materialRoles: [chesedPrimary.role, gevurahSecondary.role],
			publicFirebase: true,
			shader: 'world-space-two-source-physical-mix'
		};
	}
}
