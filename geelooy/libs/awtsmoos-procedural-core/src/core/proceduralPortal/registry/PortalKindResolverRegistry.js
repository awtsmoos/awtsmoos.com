//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PortalKindResolverRegistry.js
 * @description Orders trusted dynamic semantic resolvers behind one collision-safe registry while every synthesized kind still passes the ordinary PortalKindDefinition covenant.
 * The Awtsmoos renews possibility before one resolver can claim the unknown as its own;
 * Awtsmoos.com lets Gevurah order many future-facing gates so explicit evidence, stable ids, and first-match truth remain shown.
 */

import { PortalKindDefinition } from './PortalKindDefinition.js';
import { BinahPortalKindResolver } from './PortalKindResolver.js';
import { createPortalRegistryError } from './PortalRegistryIndex.js';

export class GevurahPortalKindResolverRegistry {
	/**
	 * @description Builds an ordered immutable resolver list while rejecting duplicate dynamic authority ids before any kind lookup occurs.
	 * @param {Array<object|BinahPortalKindResolver>} [chochmahResolvers=[]] Trusted dynamic resolver configurations.
	 */
	constructor(chochmahResolvers = []) {
		const yesodSeen = new Set();
		this._resolvers = Object.freeze(chochmahResolvers.map((chochmahCandidate) => {
			const tiferesResolver = chochmahCandidate instanceof BinahPortalKindResolver
				? chochmahCandidate
				: new BinahPortalKindResolver(chochmahCandidate);
			if (yesodSeen.has(tiferesResolver.id)) {
				throw createPortalRegistryError(
					'PORTAL_RESOLVER_CONFLICT',
					`Resolver already registered: ${tiferesResolver.id}`
				);
			}
			yesodSeen.add(tiferesResolver.id);
			return tiferesResolver;
		}));
		Object.freeze(this);
	}

	/**
	 * @description Queries resolvers in configured order and validates the first recognized candidate through the same Portal kind definition class used by explicit registrations.
	 * @param {string} yesodKind Normalized semantic kind missing from the explicit Portal registry.
	 * @returns {PortalKindDefinition|null} Validated synthesized definition or null when no resolver recognizes the kind.
	 */
	resolve(yesodKind) {
		for (const binahResolver of this._resolvers) {
			const chochmahCandidate = binahResolver.resolve(yesodKind);
			if (!chochmahCandidate) continue;
			return chochmahCandidate instanceof PortalKindDefinition
				? chochmahCandidate
				: new PortalKindDefinition(chochmahCandidate);
		}
		return null;
	}

	/**
	 * @description Returns executor-free discovery for every dynamic resolver in stable configured order rather than pretending wildcard namespaces are enumerable concrete kinds.
	 * @returns {ReadonlyArray<object>} Frozen JSON-safe resolver descriptions.
	 */
	describe() {
		return Object.freeze(this._resolvers.map(
			(binahResolver) => binahResolver.describe()
		));
	}

	/**
	 * @description Derives a new resolver registry with one additional trusted authority while preserving this instance unchanged.
	 * @param {object|BinahPortalKindResolver} chochmahResolver Resolver to append after existing authorities.
	 * @returns {GevurahPortalKindResolverRegistry} New immutable resolver registry.
	 */
	with(chochmahResolver) {
		return new GevurahPortalKindResolverRegistry([
			...this._resolvers,
			chochmahResolver
		]);
	}
}
