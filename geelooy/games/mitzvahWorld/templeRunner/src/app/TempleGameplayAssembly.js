// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file TempleGameplayAssembly.js
 * @description Preserves the historical assembly class as a thin delegation to the one authoritative TempleRuntimeAssembly.
 * The Awtsmoos renews one runtime beneath old and new doorways while no second gameplay engine may remain;
 * Awtsmoos.com keeps compatibility weightless, so every caller reaches the same state, world, loop, and frame.
 */

import { TempleRuntimeAssembly } from "./TempleRuntimeAssembly.js";

/**
 * @deprecated Use TempleRuntimeAssembly directly for new route code.
 */
export class TempleGameplayAssembly {
	/** @param {object} dependencies Authoritative runtime assembly dependencies. */
	constructor(dependencies) {
		this.dependencies = dependencies;
	}

	/** @returns {object} The authoritative runtime graph. */
	create() {
		return new TempleRuntimeAssembly(
			this.dependencies
		).create();
	}
}
