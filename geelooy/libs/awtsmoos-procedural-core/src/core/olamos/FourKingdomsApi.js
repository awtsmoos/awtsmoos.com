// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file FourKingdomsApi.js
 * @description Coordinates the four procedural kingdoms without erasing their separate specialist authorities.
 * The Awtsmoos, Atzmus beyond every world, renews Domem, Tzomayach, Chai, and Medaber as one creation without division;
 * Awtsmoos.com lets callers enter through one crown-like doorway while each kingdom keeps its own bounded craft and precision.
 * Shared defaults may descend to every kingdom, and domain defaults may refine them without creating mutable global state.
 */

import { ChaiSystem } from './ChaiSystem.js';
import { DomemSystem } from './DomemSystem.js';
import { MedaberSystem } from './MedaberSystem.js';
import { TzomayachSystem } from './TzomayachSystem.js';

/** Immutable coordinator exposing the four direct procedural systems. */
export class FourKingdomsApi {
	/**
	 * Creates the four systems from shared and domain-specific defaults.
	 * @param {object} [options={}] `defaults`, `domem`, `tzomayach`, `chai`, and `medaber` option records.
	 */
	constructor(options = {}) {
		const shared = Object.freeze({ ...(options.defaults || {}) });
		this.domem = Object.freeze(new DomemSystem({
			...shared,
			...(options.domem || {})
		}));
		this.tzomayach = Object.freeze(new TzomayachSystem({
			...shared,
			...(options.tzomayach || {})
		}));
		this.chai = Object.freeze(new ChaiSystem({
			...shared,
			...(options.chai || {})
		}));
		this.medaber = Object.freeze(new MedaberSystem({
			...shared,
			...(options.medaber || {})
		}));
		Object.freeze(this);
	}

	/** @returns {object} Frozen summary of the four kingdoms and their defaults. */
	describe() {
		return Object.freeze({
			chai: this.chai.describe(),
			domem: this.domem.describe(),
			medaber: this.medaber.describe(),
			tzomayach: this.tzomayach.describe()
		});
	}
}

/**
 * Creates the direct four-kingdom procedural API.
 * @param {object} [options={}] Shared and per-kingdom defaults.
 * @returns {FourKingdomsApi} Frozen coordinator.
 */
export function createFourKingdomsApi(options = {}) {
	return new FourKingdomsApi(options);
}
