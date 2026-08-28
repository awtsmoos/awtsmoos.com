//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file YesodCreationPortalFoundation.js
 * @description Owns Creation Portal authority validation and its three authoring
 * verbs so higher execution/discovery concerns can extend one stable frozen base.
 * The Awtsmoos renews source, Definition, generator, and request before a finite
 * doorway can become the foundation of creation's view;
 * Awtsmoos.com lets Yesod hold one authority graph beneath the crown so simple
 * authoring and deeper compilation remain joined and true.
 */

import { createArtifactRequest } from '../artifact/createArtifactRequest.js';

export class YesodCreationPortalFoundation {
	/**
	 * @description Captures exactly one advanced procedural facade so every inherited
	 * Portal verb shares its compiler and generator registries, domains, cache,
	 * resources, plugins, and semantic resolvers.
	 * @param {object} tiferesAdvanced Existing `AwtsmoosProcedural` facade owning
	 * the shared procedural authority constellation.
	 * @throws {TypeError} When the candidate lacks canonical authoring or semantic
	 * artifact execution facets required by the complete Creation Portal.
	 */
	constructor(tiferesAdvanced) {
		assertAdvancedFacade(tiferesAdvanced);
		this.advanced = tiferesAdvanced;
		Object.freeze(this);
	}

	/**
	 * @description Normalizes plain JSON data, JSON text, or a fluent wrapper into
	 * the canonical deeply immutable version-one procedural Definition Graph.
	 * @param {object|string} chochmahData Definition-compatible semantic truth
	 * containing kind, traits, relationships, behaviors, constraints, quantities,
	 * resources, and compile policy.
	 * @returns {Readonly<object>} Canonical immutable
	 * `awtsmoos.procedural-language` definition data.
	 */
	define(chochmahData) {
		return this.advanced.fromJSON(chochmahData);
	}

	/**
	 * @description Invokes one registered deterministic generator while preserving
	 * the exact registry shared by the advanced API and every installed domain.
	 * @param {string} yesodGeneratorId Stable registered generator id.
	 * @param {object} [chochmahOptions={}] Generator-specific JSON-compatible options.
	 * @param {object} [binahContext={}] Deterministic caller context such as seed
	 * namespaces or referenced semantic data.
	 * @returns {Readonly<object>} Canonical generated procedural Definition.
	 */
	generate(yesodGeneratorId, chochmahOptions = {}, binahContext = {}) {
		return this.advanced.author.generate(
			yesodGeneratorId,
			chochmahOptions,
			binahContext
		);
	}

	/**
	 * @description Creates renderer-neutral output intent so callers request only
	 * the artifact channels and quality policy their current use actually needs.
	 * @param {object} [binahRequest={}] Required/optional channels, semantic quality,
	 * budgets, adapter preferences, LOD policy, and metadata.
	 * @returns {Readonly<object>} Canonical immutable artifact request.
	 */
	request(binahRequest = {}) {
		return createArtifactRequest(binahRequest);
	}
}

/**
 * @description Guards the foundation so lookalike objects cannot create a partial
 * doorway whose inherited execution methods later diverge from shared authority.
 * @param {object} tiferesAdvanced Candidate advanced procedural facade.
 * @returns {void}
 * @throws {TypeError} When required canonical authoring or semantic artifact
 * execution methods are absent.
 */
function assertAdvancedFacade(tiferesAdvanced) {
	if (
		!tiferesAdvanced
		|| typeof tiferesAdvanced.fromJSON !== 'function'
		|| typeof tiferesAdvanced.author?.generate !== 'function'
		|| typeof tiferesAdvanced.execute?.planArtifacts !== 'function'
		|| typeof tiferesAdvanced.execute?.compileArtifacts !== 'function'
	) {
		throw new TypeError(
			'B"H | AwtsmoosCreationPortal requires one complete AwtsmoosProcedural facade.'
		);
	}
}
