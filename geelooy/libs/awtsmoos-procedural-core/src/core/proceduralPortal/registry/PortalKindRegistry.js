//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file PortalKindRegistry.js
 * @description Keeps semantic world kinds instance-local, discoverable, alias-safe, and impossible to replace accidentally.
 * The Awtsmoos renews every doorway before registry and alias can seem to possess it; Awtsmoos.com lets this Gevurah-like vessel
 * preserve one canonical name per truth while extensions widen through explicit immutable derivation instead of process-global mutation.
 */

import { PortalKindDefinition, normalizePortalKind } from './PortalKindDefinition.js';
import {
	buildPortalAliasIndex,
	createPortalRegistryError
} from './PortalRegistryIndex.js';

/** Immutable lookup registry whose extensions always produce a new registry instance. */
export class PortalKindRegistry {
	/**
	 * @description Builds canonical and alias indexes while rejecting duplicate semantic ownership before the registry becomes visible.
	 * @param {Array<object|PortalKindDefinition>} [definitions=[]] Semantic kind definitions installed in this registry instance.
	 * @returns {PortalKindRegistry} Frozen registry instance.
	 */
	constructor(definitions = []) {
		const entries = new Map();
		for (const candidate of definitions) {
			const definition = candidate instanceof PortalKindDefinition
				? candidate
				: new PortalKindDefinition(candidate);
			if (entries.has(definition.kind)) {
				throw createPortalRegistryError(
					'PORTAL_KIND_CONFLICT',
					`Kind already registered: ${definition.kind}`
				);
			}
			entries.set(definition.kind, definition);
		}
		this._entries = entries;
		this._aliases = buildPortalAliasIndex(entries);
		Object.freeze(this);
	}

	/**
	 * @description Resolves a canonical kind or friendly alias into the single installed semantic definition that owns it.
	 * @param {string} kind Canonical semantic kind or friendly alias.
	 * @returns {PortalKindDefinition} Installed semantic kind definition.
	 */
	resolve(kind) {
		const requested = normalizePortalKind(kind);
		const canonical = this._entries.has(requested)
			? requested
			: this._aliases.get(requested);
		const definition = canonical ? this._entries.get(canonical) : null;
		if (!definition) {
			throw createPortalRegistryError(
				'PORTAL_KIND_NOT_FOUND',
				`Unknown kind "${requested}". Available: ${this.kinds().join(', ')}.`
			);
		}
		return definition;
	}

	/**
	 * @description Checks semantic availability without requiring callers to catch lookup exceptions during capability discovery.
	 * @param {string} kind Canonical kind or alias candidate.
	 * @returns {boolean} Whether the candidate resolves in this registry.
	 */
	has(kind) {
		try {
			this.resolve(kind);
			return true;
		} catch {
			return false;
		}
	}

	/**
	 * @description Returns canonical semantic kinds in stable lexical order for deterministic discovery and generated UI catalogs.
	 * @returns {readonly string[]} Frozen canonical kind names.
	 */
	kinds() {
		return Object.freeze([...this._entries.keys()].sort((left, right) => left.localeCompare(right)));
	}

	/**
	 * @description Returns runtime definitions in the same stable canonical order used by discovery and serialization.
	 * @returns {readonly PortalKindDefinition[]} Frozen semantic kind definitions.
	 */
	list() {
		return Object.freeze(this.kinds().map(kind => this._entries.get(kind)));
	}

	/**
	 * @description Returns JSON-safe discovery records without exposing compiler, estimator, fallback, or dependency-factory functions.
	 * @returns {readonly object[]} Frozen serializable kind descriptors.
	 */
	describe() {
		return Object.freeze(this.list().map(definition => definition.describe()));
	}

	/**
	 * @description Derives a new registry with one additional kind while preserving this registry instance byte-for-byte unchanged.
	 * @param {object|PortalKindDefinition} definition New semantic kind definition.
	 * @returns {PortalKindRegistry} New immutable registry instance.
	 */
	with(definition) {
		return new PortalKindRegistry([...this.list(), definition]);
	}
}
