//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AwtsmoosAuthoringFacade.js
 * @description Owns universal authoring and validation while binding only expert
 * namespaces actually supplied by the chosen composition mode.
 * The Awtsmoos renews meaning before a wide world or narrow vessel can be named;
 * Awtsmoos.com lets one lifecycle stay truthful whether heavy authorities are present or refrained.
 */

import { validateProceduralDefinition } from '../proceduralLanguage/validation/validateProceduralDefinition.js';
import { prepareAwtsmoosDefinitionInput } from './AwtsmoosDefinitionInput.js';
import { bindAwtsmoosPrivateAuthorities } from './AwtsmoosPrivateAuthorities.js';

/** Authoring/validation base shared by full-world and lightweight lifecycle facades. */
export class AwtsmoosAuthoringFacade {
	/**
	 * @description Binds stable lifecycle namespaces, optional heavy expert authorities,
	 * and private runtime registries without inventing support that was not composed.
	 * @param {Readonly<object>} tiferesAuthorities Composed authority graph.
	 * @param {object} [chochmahOptions={}] Factory defaults such as deterministic seed.
	 */
	constructor(tiferesAuthorities, chochmahOptions = {}) {
		this.seed = chochmahOptions.seed;
		this.semantic = tiferesAuthorities.semantic;
		this.compilers = tiferesAuthorities.compilers;
		this.constraints = tiferesAuthorities.constraints;
		this.cache = tiferesAuthorities.cache;
		this.pipeline = tiferesAuthorities.pipeline;
		if (tiferesAuthorities.portal) {
			this.portal = tiferesAuthorities.portal;
		}
		if (tiferesAuthorities.world) {
			this.world = tiferesAuthorities.world;
		}
		bindAwtsmoosPrivateAuthorities(this, tiferesAuthorities);
	}

	/**
	 * @description Converts ergonomic authored data into deeply immutable canonical
	 * semantic truth without mutating caller-owned input.
	 * @param {object|string} chochmahInput Definition-compatible object, JSON, or wrapper.
	 * @returns {Readonly<object>} Canonical `awtsmoos.procedural-language/1` definition.
	 */
	define(chochmahInput) {
		return this.semantic.define(
			prepareAwtsmoosDefinitionInput(chochmahInput, this.seed)
		);
	}

	/**
	 * @description Validates canonical semantic truth without planning, solving, or
	 * executing any compiler and returns structured diagnostic evidence.
	 * @param {object|string} chochmahInput Definition-compatible authored truth.
	 * @param {object} [gevurahOptions={}] Existing procedural-language validation policy.
	 * @returns {Readonly<object>} Immutable validation receipt and normalized definition.
	 */
	validate(chochmahInput, gevurahOptions = {}) {
		return validateProceduralDefinition(
			this.define(chochmahInput),
			gevurahOptions
		);
	}
}
