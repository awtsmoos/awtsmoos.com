//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ProceduralTraitEditingApi.js
 * @description Exposes precise trait selection and full atomic patch transactions as one focused editing authority separate from authoring, execution, and inspection.
 * The Awtsmoos renews every definition while editing becomes a finite covenant of address, guard, revision, and receipt;
 * Awtsmoos.com lets advanced callers descend into exact traits without making the common procedural surface less complete.
 */

import { createProceduralDefinition } from '../definition/createProceduralDefinition.js';
import { applyProceduralPatchTransaction } from '../patch/applyProceduralPatchTransaction.js';
import { GevurahProceduralTraitEditor } from './ProceduralTraitEditor.js';

export class TiferesProceduralTraitEditingApi {
	/**
	 * @description Creates a trait-scoped immutable editor whose relative paths cannot escape the selected trait values vessel.
	 * @param {object|string} chochmahDefinition Definition data, JSON text, or fluent wrapper.
	 * @param {string} yesodTraitId Existing stable trait id.
	 * @returns {GevurahProceduralTraitEditor} Focused surgical editor for the selected trait.
	 */
	trait(chochmahDefinition, yesodTraitId) {
		return new GevurahProceduralTraitEditor(
			chochmahDefinition,
			yesodTraitId
		);
	}

	/**
	 * @description Returns one immutable canonical trait descriptor by stable id without exposing mutable definition internals.
	 * @param {object|string} chochmahDefinition Definition data, JSON text, or fluent wrapper.
	 * @param {string} yesodTraitId Stable trait id to read.
	 * @returns {Readonly<object>|null} Canonical trait descriptor or null when absent.
	 */
	getTrait(chochmahDefinition, yesodTraitId) {
		const tiferesDefinition = createProceduralDefinition(chochmahDefinition);
		return tiferesDefinition.traits[String(yesodTraitId)] || null;
	}

	/**
	 * @description Applies an arbitrary guarded multi-path edit atomically and returns both the new definition and deterministic consequence receipt.
	 * @param {object|string} chochmahDefinition Base definition data, JSON text, or fluent wrapper.
	 * @param {Array<object>} [gevurahPatches=[]] Ordered portable patch operations.
	 * @param {object} [binahOptions={}] Optional expectedRevision, reason, metadata, and explicit affected channels.
	 * @returns {Readonly<{definition: object, receipt: object}>} Detailed atomic mutation result.
	 */
	transaction(chochmahDefinition, gevurahPatches = [], binahOptions = {}) {
		return applyProceduralPatchTransaction(
			chochmahDefinition,
			gevurahPatches,
			binahOptions
		);
	}

	/**
	 * @description Applies a guarded transaction but returns only its canonical definition for concise immutable authoring flows.
	 * @param {object|string} chochmahDefinition Base definition.
	 * @param {Array<object>} [gevurahPatches=[]] Ordered portable patch operations.
	 * @param {object} [binahOptions={}] Transaction-level guards and provenance options.
	 * @returns {Readonly<object>} New canonical immutable definition.
	 */
	patch(chochmahDefinition, gevurahPatches = [], binahOptions = {}) {
		return this.transaction(
			chochmahDefinition,
			gevurahPatches,
			binahOptions
		).definition;
	}
}
