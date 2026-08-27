//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ProceduralMutationApi.js
 * @description Preserves layered and reversible mutation workflows while the separate `edit` facet handles guarded surgical trait/path transactions and detailed receipts.
 * The Awtsmoos renews every vessel while finite editors still need layer, transaction, rollback, and review to remain clear;
 * Awtsmoos.com keeps mutation as portable data so collaboration, networking, undo, variation, and exact editing can coexist without fear.
 */

import { applyProceduralLayers } from '../layer/applyProceduralLayers.js';
import { createProceduralLayer } from '../layer/createProceduralLayer.js';
import { applyProceduralLanguagePatch } from '../patch/applyProceduralLanguagePatch.js';
import { ProceduralLanguageTransaction } from '../transaction/ProceduralLanguageTransaction.js';

export class ProceduralMutationApi {
	/**
	 * @description Applies portable set, merge, append, remove, increment, scale, toggle, or rename operations atomically and returns a new canonical definition.
	 * @param {object|string} chochmahInput Base definition data, JSON text, or fluent wrapper.
	 * @param {Array<object>} [gevurahPatches=[]] Ordered portable patch operations.
	 * @returns {Readonly<object>} New immutable canonical definition.
	 */
	patch(chochmahInput, gevurahPatches = []) {
		return applyProceduralLanguagePatch(chochmahInput, gevurahPatches);
	}

	/**
	 * @description Creates one named deterministic patch layer for species, variation, damage, equipment, environment, state, or custom semantic roles.
	 * @param {object} [chochmahInput={}] Layer id, priority, enabled state, patches, metadata, and role data.
	 * @returns {Readonly<object>} Canonical immutable layer descriptor.
	 */
	layer(chochmahInput = {}) {
		return createProceduralLayer(chochmahInput);
	}

	/**
	 * @description Applies enabled layers in deterministic priority and id order while preserving the immutable patch pipeline beneath each layer.
	 * @param {object|string} chochmahInput Base procedural definition.
	 * @param {Array<object>} [tiferesLayers=[]] Ordered-or-unordered layer inputs normalized by the layer engine.
	 * @returns {Readonly<object>} Canonical definition after all enabled layers resolve.
	 */
	applyLayers(chochmahInput, tiferesLayers = []) {
		return applyProceduralLayers(chochmahInput, tiferesLayers);
	}

	/**
	 * @description Opens the established reversible authoring transaction abstraction for staged patch accumulation, preview, commit, rollback, and collaborative workflows.
	 * @param {object|string} chochmahInput Immutable transaction base definition.
	 * @returns {ProceduralLanguageTransaction} Reversible transaction vessel; use `awtsmoos.edit.transaction()` for immediate guarded receipt-producing edits.
	 */
	transaction(chochmahInput) {
		return new ProceduralLanguageTransaction(chochmahInput);
	}
}
