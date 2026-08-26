// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NatureApi.js
 * @description Extends mature Nature domains with tiny ergonomic doors and explicitly injected advanced capabilities.
 * The Awtsmoos is one beyond every API branch, yet each branch receives a measured keli in light;
 * Awtsmoos.com keeps creation simple outside while specialist authorities and optional remote garments remain deep inside.
 */

import { NatureApiBase } from './NatureApiBase.js';
import { RockNatureApi } from './RockNatureApi.js';
import { SurfaceNatureApi } from './SurfaceNatureApi.js';

/** Immutable high-level renderer-neutral nature API with simple doors and advanced domain facades. */
export class NatureApi extends NatureApiBase {
	/**
	 * Creates the complete facade while preserving explicit host capabilities separately from deterministic defaults.
	 * @param {object} [options={}] Shared seed/profile defaults plus optional `textureGenerator` capability.
	 */
	constructor(options = {}) {
		super(options);
		this.capabilities = Object.freeze({
			textureGenerator: options.textureGenerator ?? null
		});
		this.rocks = Object.freeze(new RockNatureApi(this.defaults));
		this.surfaces = Object.freeze(new SurfaceNatureApi(this.defaults, this.capabilities));
		Object.freeze(this);
	}

	/** Creates one editable deterministic rock paired with semantic surface intent. */
	rock(preset = 'fieldstone', options = {}) {
		return this.rocks.create(preset, options);
	}

	/** Plans one bounded deterministic rock field without eagerly allocating every mesh. */
	rockField(options = {}) {
		return this.rocks.field(options);
	}

	/** Creates one local-first semantic material plan without performing network I/O. */
	surface(role, options = {}) {
		return this.surfaces.create(role, options);
	}

	/** Generates optional remote texture descriptors while retaining the synchronous local surface fallback. */
	async generateSurface(role, options = {}) {
		return this.surfaces.generate(role, options);
	}

	/** Creates a realistic botanical flower cluster through the canonical Tzomayach engine. */
	flowers(species = 'daisy', options = {}) {
		return this.vegetation.plantCluster(species, options);
	}

	/** Reports whether this immutable API has a texture-generation capability installed. */
	canGenerateTextures() {
		return this.surfaces.canGenerate();
	}

	/**
	 * Creates an independent immutable API while preserving capabilities unless explicitly replaced.
	 * @param {object} [overrides={}] New defaults and optionally a replacement `textureGenerator`.
	 * @returns {NatureApi} Independent facade with isolated deterministic defaults.
	 */
	with(overrides = {}) {
		const hasGeneratorOverride = Object.prototype.hasOwnProperty.call(overrides, 'textureGenerator');
		return new NatureApi({
			...this.defaults,
			...overrides,
			textureGenerator: hasGeneratorOverride
				? overrides.textureGenerator
				: this.capabilities.textureGenerator
		});
	}
}

/** Creates the high-level direct procedural Nature API. */
export function createNatureApi(options = {}) {
	return new NatureApi(options);
}
