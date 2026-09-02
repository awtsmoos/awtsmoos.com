//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ProceduralDefinitionCore.js
 * @description Owns immutable fluent identity, spawning, lineage, hashing, and
 * serialization while delegating edit-candidate construction to a small helper.
 * The Awtsmoos renews intention before action and essence before a hash can bear
 * witness to its ray;
 * Awtsmoos.com lets Yesod keep immutable definition truth beneath richer
 * semantic methods that may grow another day.
 */

import { cloneLanguageValue } from '../data/freezeLanguageValue.js';
import { stableLanguageHash } from '../data/stableLanguageValue.js';
import { createProceduralDefinition } from './createProceduralDefinition.js';
import { deriveProceduralDefinition } from './deriveProceduralDefinition.js';
import {
	createActionEditCandidate,
	createConstraintEditCandidate,
	createPayloadEditCandidate
} from './ProceduralDefinitionCoreEdits.js';

export class YesodProceduralDefinitionCore {
	/**
	 * @description Canonicalizes object, JSON, or supported wrapper input so every
	 * fluent method begins from exactly the same immutable language truth.
	 * @param {object|string} [chochmahInput={}] Definition-compatible input.
	 */
	constructor(chochmahInput = {}) {
		this.value = createProceduralDefinition(chochmahInput);
	}

	/**
	 * @description Creates the same runtime fluent class around newly authored
	 * canonical input so semantic subclasses retain their richer method surface.
	 * @param {object|string} chochmahInput Definition-compatible next value.
	 * @returns {YesodProceduralDefinitionCore} New immutable fluent wrapper.
	 */
	spawn(chochmahInput) {
		return new this.constructor(chochmahInput);
	}

	/**
	 * @description Returns a new definition whose payload shallow-merges detached
	 * authored data while all other semantic sections remain unchanged.
	 * @param {object} [binahPayload={}] JSON-safe payload values to merge.
	 * @returns {YesodProceduralDefinitionCore} New immutable fluent wrapper.
	 */
	with(binahPayload = {}) {
		return this.spawn(
			createPayloadEditCandidate(this.value, binahPayload)
		);
	}

	/**
	 * @description Appends one canonical ordered procedural action.
	 * @param {string} gevurahOperation Canonical action operation id.
	 * @param {object} [chochmahInput={}] Action fields for the new action.
	 * @returns {YesodProceduralDefinitionCore} New wrapper with the action.
	 */
	action(gevurahOperation, chochmahInput = {}) {
		return this.spawn(
			createActionEditCandidate(
				this.value,
				gevurahOperation,
				chochmahInput
			)
		);
	}

	/**
	 * @description Appends one renderer-neutral portable constraint.
	 * @param {object} gevurahConstraint JSON-safe constraint data.
	 * @returns {YesodProceduralDefinitionCore} New wrapper with the constraint.
	 */
	constraint(gevurahConstraint) {
		return this.spawn(
			createConstraintEditCandidate(this.value, gevurahConstraint)
		);
	}

	/**
	 * @description Creates an explicit semantic descendant through the canonical
	 * derivation engine that owns revision and parent-provenance semantics.
	 * @param {object} [chochmahOverrides={}] Overrides applied to the child.
	 * @returns {YesodProceduralDefinitionCore} New descendant wrapper.
	 */
	derive(chochmahOverrides = {}) {
		return this.spawn(
			deriveProceduralDefinition(this.value, chochmahOverrides)
		);
	}

	/**
	 * @description Computes the deterministic canonical definition hash.
	 * @returns {string} Stable language hash of the complete definition.
	 */
	hash() {
		return stableLanguageHash(this.value);
	}

	/**
	 * @description Reveals a detached JSON-safe copy for serialization or review.
	 * @returns {object} Detached canonical definition data.
	 */
	toJSON() {
		return cloneLanguageValue(this.value);
	}
}
