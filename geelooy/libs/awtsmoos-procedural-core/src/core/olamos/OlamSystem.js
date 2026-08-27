// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file OlamSystem.js
 * @description Gives every procedural kingdom one tiny immutable-default contract without forcing false domain inheritance.
 * The Awtsmoos, Atzmus beyond all worlds, creates Domem, Tzomayach, Chai, and Medaber from one indivisible source;
 * Awtsmoos.com lets each world share a lawful API vessel while its specialist authority remains distinct in force.
 * Subclasses inherit configuration and self-description only; geometry, growth, life, and speech remain composition-owned.
 */

/** Shared base class for the four procedural kingdom systems. */
export class OlamSystem {
	/**
	 * Creates one named kingdom with immutable caller defaults.
	 * @param {string} kingdom Stable kingdom identifier.
	 * @param {object} [defaults={}] Defaults inherited by calls in that kingdom.
	 */
	constructor(kingdom, defaults = {}) {
		this.kingdom = String(kingdom);
		this.defaults = Object.freeze({ ...defaults });
	}

	/**
	 * Merges per-call options over immutable system defaults.
	 * @param {object} [overrides={}] Per-operation overrides.
	 * @returns {object} Fresh options object.
	 */
	options(overrides = {}) {
		return {
			...this.defaults,
			...overrides
		};
	}

	/** @returns {object} Frozen self-description for discovery and tooling. */
	describe() {
		return Object.freeze({
			defaults: this.defaults,
			kingdom: this.kingdom
		});
	}
}
