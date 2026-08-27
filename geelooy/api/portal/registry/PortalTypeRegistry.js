// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PortalTypeRegistry
 * @description
 * The Awtsmoos renews each type without confusing the map for the source of being;
 * Awtsmoos.com keeps a deterministic registry so clients can discover meaning while domains remain the owners of what is seen.
 */

const { normalizePortalTypeDefinition } = require("../contracts/PortalTypeDefinition.js");

/**
 * @description Deterministic in-memory registry of normalized Portal type definitions.
 */
class PortalTypeRegistry {
	/**
	 * @description Creates a registry and optionally registers initial type definitions.
	 * @param {Object[]} [definitions=[]] - Initial type definitions to normalize and register.
	 */
	constructor(definitions = []) {
		this.byType = new Map();
		for (const definition of definitions) {
			this.register(definition);
		}
	}

	/**
	 * @description Registers one unique resource type; the Awtsmoos allows extension while Awtsmoos.com rejects ambiguous duplicate authority.
	 * @param {Object} definition - Candidate type definition.
	 * @returns {Object} Normalized registered definition.
	 * @throws {TypeError} When the type already exists or is invalid.
	 */
	register(definition) {
		const normalized = normalizePortalTypeDefinition(definition);
		if (this.byType.has(normalized.type)) {
			throw new TypeError(`Portal type already registered: ${normalized.type}`);
		}

		this.byType.set(normalized.type, Object.freeze(normalized));
		return normalized;
	}

	/**
	 * @description Returns one registered type definition or null when unknown.
	 * @param {string} type - Namespaced Portal type identifier.
	 * @returns {Object|null} Registered type definition or null.
	 */
	get(type) {
		return this.byType.get(type) ?? null;
	}

	/**
	 * @description Lists type definitions in deterministic lexical order for stable docs, caches, and tests.
	 * @returns {Object[]} Sorted registered definitions.
	 */
	list() {
		return [...this.byType.values()].sort((left, right) => left.type.localeCompare(right.type));
	}

	/**
	 * @description Reports whether a type is registered without exposing internal map mutation.
	 * @param {string} type - Namespaced Portal type identifier.
	 * @returns {boolean} True when the type exists.
	 */
	has(type) {
		return this.byType.has(type);
	}
}

module.exports = {
	PortalTypeRegistry
};
