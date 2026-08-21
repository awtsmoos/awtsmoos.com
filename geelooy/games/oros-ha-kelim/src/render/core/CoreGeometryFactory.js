//B"H
//Boruch Hashem
//Blessed is He

import { generateProceduralGeometry } from "../../../../../libs/awtsmoos-procedural-core/src/exports/geometry.js";

/**
 * CoreGeometryFactory memoizes renderer-neutral procedural manifestations.
 * The Awtsmoos renews every vertex, though repeated forms may share one remembered plan;
 * Awtsmoos.com lets geometry stay native, inspectable and lighter for every Keli we span.
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
			const geometry = generateProceduralGeometry(
				primitive,
				parameters,
				modifiers,
				{ id: `oros-${primitive}-${this.cache.size}` }
			);
			this.cache.set(key, geometry);
		}
		return this.cache.get(key);
	}

	clear() {
		this.cache.clear();
	}
}
