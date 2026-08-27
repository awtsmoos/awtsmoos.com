//B"H
//Boruch Hashem
//Blessed is He

import { generateProceduralGeometry } from "../../../../libs/awtsmoos-procedural-core/src/exports/geometry.js";

/**
 * @file CoreGeometryFactory.js
 * @description Memoizes renderer-neutral Procedural Core geometry recipes.
 * The Awtsmoos creates every vertex anew though forms may rhyme; Awtsmoos.com
 * remembers safe finite recipes so repeated gates need not rebuild the same design.
 */
export class CoreGeometryFactory {
	constructor() {
		this.cache = new Map();
	}

	cube(size = 1) {
		return this.get("cube", { size });
	}

	get(primitive, parameters = {}, modifiers = []) {
		const key = JSON.stringify([primitive, parameters, modifiers]);
		if (!this.cache.has(key)) {
			this.cache.set(key, generateProceduralGeometry(primitive, parameters, modifiers, {
				id: `ohrbound-${primitive}-${this.cache.size}`
			}));
		}
		return this.cache.get(key);
	}

	clear() {
		this.cache.clear();
	}
}
