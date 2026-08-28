//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PortalExplicitKindCollection.js
 * @description Owns finite explicit Portal kinds and aliases as one immutable collection, leaving open-ended semantic federation to a separate coordinator.
 * The Awtsmoos renews every named vessel before a registry can number or recall its place;
 * Awtsmoos.com lets Binah hold finite identity with clarity while unknown future namespaces remain outside this bounded space.
 */

import {
	PortalKindDefinition,
	normalizePortalKind
} from './PortalKindDefinition.js';
import {
	buildPortalAliasIndex,
	createPortalRegistryError
} from './PortalRegistryIndex.js';

export class BinahPortalExplicitKindCollection {
	/**
	 * @description Builds collision-safe canonical and alias indexes from explicit semantic definitions only.
	 * @param {Array<object|PortalKindDefinition>} [chochmahDefinitions=[]] Explicit kind definitions owned by this finite collection.
	 * @throws {Error} When two explicit definitions claim the same canonical kind or conflicting alias through the shared index builder.
	 */
	constructor(chochmahDefinitions = []) {
		this._entries = createExplicitEntries(chochmahDefinitions);
		this._aliases = buildPortalAliasIndex(this._entries);
		Object.freeze(this);
	}

	/**
	 * @description Resolves one canonical kind or friendly alias only inside this finite explicit collection, returning null when dynamic federation should be consulted instead.
	 * @param {string} chochmahKind Canonical semantic kind or friendly alias candidate.
	 * @returns {PortalKindDefinition|null} Explicit semantic definition when owned here, otherwise null.
	 */
	resolve(chochmahKind) {
		const yesodRequested = normalizePortalKind(chochmahKind);
		const yesodCanonical = this._entries.has(yesodRequested)
			? yesodRequested
			: this._aliases.get(yesodRequested);
		return yesodCanonical
			? this._entries.get(yesodCanonical)
			: null;
	}

	/**
	 * @description Returns the finite explicit canonical kind vocabulary in stable lexical order without implying anything about dynamic namespaces.
	 * @returns {ReadonlyArray<string>} Frozen explicit canonical kind names.
	 */
	kinds() {
		return Object.freeze([...this._entries.keys()].sort(
			(left, right) => left.localeCompare(right)
		));
	}

	/**
	 * @description Returns explicit runtime definitions in the same canonical order used by discovery and immutable derivation.
	 * @returns {ReadonlyArray<PortalKindDefinition>} Frozen explicit definitions.
	 */
	list() {
		return Object.freeze(this.kinds().map(
			(yesodKind) => this._entries.get(yesodKind)
		));
	}

	/**
	 * @description Projects only executor-free explicit kind metadata for editors, RAG, diagnostics, and public capability inspection.
	 * @returns {ReadonlyArray<object>} Frozen serializable explicit-kind descriptors.
	 */
	describe() {
		return Object.freeze(this.list().map(
			(tiferesDefinition) => tiferesDefinition.describe()
		));
	}

	/**
	 * @description Derives a new finite collection containing one additional explicit definition while preserving this collection unchanged.
	 * @param {object|PortalKindDefinition} chochmahDefinition Explicit definition to append.
	 * @returns {BinahPortalExplicitKindCollection} New immutable explicit-kind collection.
	 */
	with(chochmahDefinition) {
		return new BinahPortalExplicitKindCollection([
			...this.list(),
			chochmahDefinition
		]);
	}
}

/**
 * @description Validates and indexes explicit definitions while rejecting duplicate canonical ownership before aliases are constructed.
 * @param {Array<object|PortalKindDefinition>} chochmahDefinitions Explicit definition candidates.
 * @returns {Map<string, PortalKindDefinition>} Canonical kind map retained privately by one finite collection instance.
 * @throws {Error} When a canonical kind is registered more than once.
 */
function createExplicitEntries(chochmahDefinitions) {
	const yesodEntries = new Map();
	for (const chochmahCandidate of chochmahDefinitions) {
		const tiferesDefinition = chochmahCandidate instanceof PortalKindDefinition
			? chochmahCandidate
			: new PortalKindDefinition(chochmahCandidate);
		if (yesodEntries.has(tiferesDefinition.kind)) {
			throw createPortalRegistryError(
				'PORTAL_KIND_CONFLICT',
				`Kind already registered: ${tiferesDefinition.kind}`
			);
		}
		yesodEntries.set(tiferesDefinition.kind, tiferesDefinition);
	}
	return yesodEntries;
}
