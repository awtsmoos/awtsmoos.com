//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ProceduralTraitEditorBase.js
 * @description Owns canonical trait-relative paths, immutable reads, and synchronous guarded transactions beneath ergonomic surgical editing verbs.
 * The Awtsmoos renews the whole while one nested trait value receives a precise finite address;
 * Awtsmoos.com lets Binah find the vessel and Gevurah change it without granting neighboring truth collateral passage.
 */

import { createProceduralDefinition } from '../definition/createProceduralDefinition.js';
import { applyProceduralPatchTransaction } from '../patch/applyProceduralPatchTransaction.js';
import { getLanguagePath } from '../query/languagePath.js';
import { assertTraitId } from '../trait/createTraitDescriptor.js';

export class BinahProceduralTraitEditorBase {
	/**
	 * @description Captures one canonical definition and one existing stable trait id so relative edits cannot escape into another trait.
	 * @param {object|string} chochmahDefinition Definition data, JSON text, or fluent wrapper.
	 * @param {string} yesodTraitId Existing stable trait id to inspect and edit.
	 * @throws {RangeError} When the requested trait does not exist in the canonical definition.
	 */
	constructor(chochmahDefinition, yesodTraitId) {
		assertTraitId(String(yesodTraitId));
		this.definition = createProceduralDefinition(chochmahDefinition);
		this.traitId = String(yesodTraitId);
		if (!this.definition.traits[this.traitId]) {
			throw new RangeError(`B"H | Unknown procedural trait: ${this.traitId}`);
		}
	}

	/**
	 * @description Reads one immutable value beneath the selected trait's `values` vessel.
	 * @param {string} [malchusRelativePath=''] Relative dotted or bracket-index path beneath `traits.<id>.values`.
	 * @returns {unknown} Canonical value at the path, or the complete values object when no relative path is supplied.
	 */
	get(malchusRelativePath = '') {
		return getLanguagePath(
			this.definition,
			this.valuePath(malchusRelativePath)
		);
	}

	/**
	 * @description Builds the canonical absolute path for one relative trait value while preventing accidental edits outside the chosen values namespace.
	 * @param {string} [malchusRelativePath=''] Relative value path.
	 * @returns {string} Canonical absolute procedural-language path.
	 */
	valuePath(malchusRelativePath = '') {
		const yesodBase = `traits.${this.traitId}.values`;
		const tiferesRelative = String(malchusRelativePath || '').replace(/^\.+/, '');
		return tiferesRelative ? `${yesodBase}.${tiferesRelative}` : yesodBase;
	}

	/**
	 * @description Applies one precise trait-value operation atomically and returns both canonical truth and its deterministic change receipt.
	 * @param {string} gevurahOp Supported patch operation.
	 * @param {string} malchusRelativePath Relative path beneath the selected trait values.
	 * @param {object} [binahOperation={}] Operation-specific value/delta/factor plus optional expect/expectExists guards.
	 * @param {object} [hodOptions={}] Optional expectedRevision, reason, metadata, and explicit affected channels.
	 * @returns {Readonly<{definition: object, receipt: object}>} Detailed synchronous mutation result.
	 */
	changeDetailed(gevurahOp, malchusRelativePath, binahOperation = {}, hodOptions = {}) {
		return this.changePathDetailed(
			gevurahOp,
			this.valuePath(malchusRelativePath),
			binahOperation,
			hodOptions
		);
	}

	/**
	 * @description Applies one precise edit to any already-controlled canonical path, used by child editors for trait-map operations such as rename.
	 * @param {string} gevurahOp Supported patch operation.
	 * @param {string} malchusAbsolutePath Canonical absolute definition path.
	 * @param {object} [binahOperation={}] Operation-specific values and guards.
	 * @param {object} [hodOptions={}] Transaction-level edit options.
	 * @returns {Readonly<{definition: object, receipt: object}>} Detailed synchronous mutation result.
	 */
	changePathDetailed(gevurahOp, malchusAbsolutePath, binahOperation = {}, hodOptions = {}) {
		return applyProceduralPatchTransaction(
			this.definition,
			[{...binahOperation, op: gevurahOp, path: malchusAbsolutePath}],
			hodOptions
		);
	}

	/**
	 * @description Applies one trait-value edit while returning only the resulting canonical definition for concise immutable chains.
	 * @param {string} gevurahOp Supported patch operation.
	 * @param {string} malchusRelativePath Relative trait-value path.
	 * @param {object} [binahOperation={}] Operation-specific values and guards.
	 * @param {object} [hodOptions={}] Transaction-level edit options.
	 * @returns {Readonly<object>} New canonical immutable definition.
	 */
	change(gevurahOp, malchusRelativePath, binahOperation = {}, hodOptions = {}) {
		return this.changeDetailed(
			gevurahOp,
			malchusRelativePath,
			binahOperation,
			hodOptions
		).definition;
	}
}
