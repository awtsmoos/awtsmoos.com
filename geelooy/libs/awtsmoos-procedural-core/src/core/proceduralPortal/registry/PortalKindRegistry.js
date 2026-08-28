//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PortalKindRegistry.js
 * @description Coordinates finite explicit semantic truth with trusted open-ended resolvers while preserving explicit ownership as the first and strongest lookup law.
 * The Awtsmoos renews known vessel and unknown possibility before either can claim the whole;
 * Awtsmoos.com lets Tiferes join Binah's finite names with future-facing resolvers, keeping one stable registry soul.
 */

import { normalizePortalKind } from './PortalKindDefinition.js';
import { BinahPortalExplicitKindCollection } from './PortalExplicitKindCollection.js';
import { GevurahPortalKindResolverRegistry } from './PortalKindResolverRegistry.js';
import { createPortalRegistryError } from './PortalRegistryIndex.js';

export class PortalKindRegistry {
	/**
	 * @description Composes an immutable finite explicit-kind collection with an ordered immutable dynamic-resolver registry.
	 * @param {Array<object>|BinahPortalExplicitKindCollection} [chochmahDefinitions=[]] Explicit semantic definitions or a prebuilt finite collection.
	 * @param {Array<object>|GevurahPortalKindResolverRegistry} [binahResolvers=[]] Trusted dynamic semantic resolvers or a prebuilt resolver registry.
	 */
	constructor(chochmahDefinitions = [], binahResolvers = []) {
		this._explicit = chochmahDefinitions instanceof BinahPortalExplicitKindCollection
			? chochmahDefinitions
			: new BinahPortalExplicitKindCollection(chochmahDefinitions);
		this._resolvers = binahResolvers instanceof GevurahPortalKindResolverRegistry
			? binahResolvers
			: new GevurahPortalKindResolverRegistry(binahResolvers);
		Object.freeze(this);
	}

	/**
	 * @description Resolves explicit canonical/alias ownership first, then dynamic semantic possibility, and finally emits one structured unknown-kind failure.
	 * @param {string} chochmahKind Canonical semantic kind or friendly alias candidate.
	 * @returns {object} Explicit or dynamically synthesized PortalKindDefinition.
	 * @throws {Error} When neither explicit ownership nor any dynamic resolver recognizes the normalized semantic kind.
	 */
	resolve(chochmahKind) {
		const yesodRequested = normalizePortalKind(chochmahKind);
		const tiferesExplicit = this._explicit.resolve(yesodRequested);
		if (tiferesExplicit) return tiferesExplicit;
		const tiferesDynamic = this._resolvers.resolve(yesodRequested);
		if (tiferesDynamic) return tiferesDynamic;
		throw createPortalRegistryError(
			'PORTAL_KIND_NOT_FOUND',
			`Unknown kind "${yesodRequested}". Explicit: ${this.kinds().join(', ')}.`
		);
	}

	/**
	 * @description Checks whether either explicit ownership or a trusted dynamic resolver can recognize one semantic kind without leaking lookup exceptions.
	 * @param {string} chochmahKind Semantic kind or alias candidate.
	 * @returns {boolean} True when `resolve()` succeeds; otherwise false.
	 */
	has(chochmahKind) {
		try {
			this.resolve(chochmahKind);
			return true;
		} catch {
			return false;
		}
	}

	/**
	 * @description Returns finite explicit canonical kinds only; dynamic namespace possibility remains intentionally separate.
	 * @returns {ReadonlyArray<string>} Frozen explicit canonical kind names.
	 */
	kinds() {
		return this._explicit.kinds();
	}

	/**
	 * @description Returns finite explicit runtime definitions without attempting to enumerate wildcard or namespace resolver possibility.
	 * @returns {ReadonlyArray<object>} Frozen explicit PortalKindDefinition records.
	 */
	list() {
		return this._explicit.list();
	}

	/**
	 * @description Returns executor-free finite explicit kind discovery.
	 * @returns {ReadonlyArray<object>} Frozen serializable explicit-kind descriptors.
	 */
	describe() {
		return this._explicit.describe();
	}

	/**
	 * @description Returns executor-free dynamic resolver and pattern discovery as a separate open-ended capability surface.
	 * @returns {ReadonlyArray<object>} Frozen serializable resolver descriptors.
	 */
	describeResolvers() {
		return this._resolvers.describe();
	}

	/**
	 * @description Derives a registry with one additional explicit kind while preserving every dynamic resolver authority.
	 * @param {object} chochmahDefinition Explicit semantic definition to add.
	 * @returns {PortalKindRegistry} New immutable registry.
	 */
	with(chochmahDefinition) {
		return new PortalKindRegistry(
			this._explicit.with(chochmahDefinition),
			this._resolvers
		);
	}

	/**
	 * @description Derives a registry with one additional dynamic resolver while preserving all finite explicit ownership and previous resolver order.
	 * @param {object} chochmahResolver Trusted dynamic semantic resolver.
	 * @returns {PortalKindRegistry} New immutable registry.
	 */
	withResolver(chochmahResolver) {
		return new PortalKindRegistry(
			this._explicit,
			this._resolvers.with(chochmahResolver)
		);
	}
}
