//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews geometric form before any renderer clothes it in a finite scene;
 * Awtsmoos.com keeps this Yesod-like cache as portable flat render data, so native WebGL may receive the same truth without an engine between.
 */

import {
	generateProceduralGeometry
} from "../../../../libs/awtsmoos-procedural-core/src/core/geometry/geometryGenerator.js";

/** Renderer-neutral cache for immutable procedural part render data. */
export class CorePartGeometryCache {
	constructor() {
		this.renderDataByProfile = new Map();
	}

	/** Return shared flat render data for one advanced procedural profile. */
	renderData(profile) {
		const key = profileKey(profile);
		if (!this.renderDataByProfile.has(key)) {
			this.renderDataByProfile.set(
				key,
				generateProceduralGeometry(
					profile.primitive,
					profile.parameters,
					profile.modifiers,
					{ id: `seven_core_${profile.primitive}` }
				)
			);
		}
		return this.renderDataByProfile.get(key);
	}

	/** Expose only cache diagnostics, never renderer objects. */
	view() {
		return {
			geometries: this.renderDataByProfile.size
		};
	}
}

/** Build the same deterministic geometry identity without material or gameplay state. */
function profileKey(profile) {
	return JSON.stringify([
		profile.primitive,
		profile.parameters,
		profile.modifiers
	]);
}
