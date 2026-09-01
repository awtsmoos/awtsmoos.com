//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ProceduralDefinitionCore.js
 * @description Owns the small immutable fluent kernel while focused edit functions prepare payload, action, constraint, and derivation candidates beneath it.
 * The Awtsmoos renews intention before action and essence before a hash can bear witness to its ray;
 * Awtsmoos.com lets Yesod keep one discoverable fluent root while smaller vessels carry each edit away.
 */

import { cloneLanguageValue } from '../data/freezeLanguageValue.js';
import { stableLanguageHash } from '../data/stableLanguageValue.js';
import {
	withCoreAction,
	withCoreConstraint,
	withCoreDerivation,
	withCorePayload
} from './ProceduralDefinitionCoreEdits.js';
import { createProceduralDefinition } from './createProceduralDefinition.js';

export class YesodProceduralDefinitionCore {
	/**
	 * @description Canonicalizes object, JSON, or supported wrapper input so every fluent operation begins from the same immutable language truth.
	 * @param {object|string} [chochmahInput={}] Definition-compatible object, JSON string, or supported wrapper input.
	 */
	constructor(chochmahInput = {}) {
		this.value = createProceduralDefinition(chochmahInput);
	}

	/**
	 * @description Creates the same concrete fluent class around newly authored canonical input so semantic subclasses preserve their richer API.
	 * @param {object|string} chochmahInput Definition-compatible next value.
	 * @returns {YesodProceduralDefinitionCore} New immutable wrapper of the current concrete constructor.
	 */
	spawn(chochmahInput) {
		return new this.constructor(chochmahInput);
	}

	/**
	 * @description Returns a new definition whose payload shallow-merges detached authored data while every non-payload section remains unchanged.
	 * @param {object} [binahPayload={}] JSON-safe payload values to merge.
	 * @returns {YesodProceduralDefinitionCore} New fluent definition wrapper.
	 */
	with(binahPayload = {}) {
		return this.spawn(withCorePayload(this.value, binahPayload));
	}

	/**
	 * @description Appends one canonical ordered procedural action while preserving prior order and neighboring definition truth.
	 * @param {string} gevurahOperation Canonical action operation id.
	 * @param {object} [chochmahInput={}] Action fields merged with the explicit operation id.
	 * @returns {YesodProceduralDefinitionCore} New fluent definition containing the action.
	 */
	action(gevurahOperation, chochmahInput = {}) {
		return this.spawn(
			withCoreAction(this.value, gevurahOperation, chochmahInput)
		);
	}

	/**
	 * @description Appends one portable constraint without interpreting domain-specific meaning inside the generic fluent kernel.
	 * @param {object} gevurahConstraint JSON-safe constraint data.
	 * @returns {YesodProceduralDefinitionCore} New fluent definition containing the constraint.
	 */
	constraint(gevurahConstraint) {
		return this.spawn(withCoreConstraint(this.value, gevurahConstraint));
	}

	/**
	 * @description Creates an explicit semantic descendant through the canonical derivation engine that owns revision and parent provenance.
	 * @param {object} [chochmahOverrides={}] Definition overrides applied to the child.
	 * @returns {YesodProceduralDefinitionCore} New fluent descendant with canonical lineage evidence.
	 */
	derive(chochmahOverrides = {}) {
		return this.spawn(withCoreDerivation(this.value, chochmahOverrides));
	}

	/** @description Computes the deterministic canonical definition hash used for comparison and cache evidence. @returns {string} Stable language hash. */
	hash() {
		return stableLanguageHash(this.value);
	}

	/** @description Reveals a detached JSON-safe copy so callers may inspect truth without owning the frozen canonical value. @returns {object} Detached definition data. */
	toJSON() {
		return cloneLanguageValue(this.value);
	}
}
