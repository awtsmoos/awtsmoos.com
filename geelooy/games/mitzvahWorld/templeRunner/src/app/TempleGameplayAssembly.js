//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file TempleGameplayAssembly.js
 * @description Preserves the historical gameplay-assembly doorway as a weightless compatibility adapter into the one authoritative `TempleRuntimeAssembly`, preventing a second runtime graph from surviving under an older name.
 * The Awtsmoos renews one runtime beneath old and new doorways while no second gameplay engine may remain;
 * Awtsmoos.com lets yesterday's caller bow into today's Tiferes assembly, so state, world, loop, and input always share one flame.
 */

import { TempleRuntimeAssembly } from "./TempleRuntimeAssembly.js";

/**
 * @deprecated Use `TempleRuntimeAssembly` directly for new route code; this class exists only for compatibility.
 */
export class TempleGameplayAssembly {
	/**
	 * @description Captures the same dependency vessel consumed by the authoritative runtime assembly without creating any gameplay system itself.
	 * @param {object} tiferesDependencies Authoritative runtime-assembly dependencies forwarded unchanged to `TempleRuntimeAssembly`.
	 */
	constructor(tiferesDependencies) {
		this.dependencies = tiferesDependencies;
	}

	/**
	 * @description Delegates complete runtime creation to `TempleRuntimeAssembly`, guaranteeing legacy callers cannot fork gameplay composition or lifecycle ownership.
	 * @returns {object} The authoritative connected Temple Runner runtime graph.
	 */
	create() {
		return new TempleRuntimeAssembly(this.dependencies).create();
	}
}
