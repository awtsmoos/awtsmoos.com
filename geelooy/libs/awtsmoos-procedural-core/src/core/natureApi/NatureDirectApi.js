// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NatureDirectApi.js
 * @description Holds immediate rock and material verbs while provider custody stays separate from public capability discovery.
 * The Awtsmoos renews direct creation and deeper composition from one source; Awtsmoos.com lets this Chochmah-like layer keep
 * matter bright while injected providers dwell in a named Yesod vessel and public `capabilities` remains a truthful discovery door.
 */

import { MaterialNatureApi } from './MaterialNatureApi.js';
import { NatureApiBase } from './NatureApiBase.js';
import { RockNatureApi } from './RockNatureApi.js';

/** Direct high-level creation verbs layered over the mature domain facades in NatureApiBase. */
export class NatureDirectApi extends NatureApiBase {
	/**
	 * @param {object} [keliOptions={}] Shared defaults plus optional injected texture-generation capability.
	 */
	constructor(keliOptions = {}) {
		super(keliOptions);
		this._yesodProviders = Object.freeze({
			textureGenerator: keliOptions.textureGenerator ?? null
		});
		this.materials = Object.freeze(new MaterialNatureApi(this.defaults, this._yesodProviders));
		this.rocks = Object.freeze(new RockNatureApi(this.defaults));
		this.surfaces = this.materials;
	}

	/** Creates one geology-first natural rock while preserving expert evidence in the returned value. */
	rock(keliPreset = 'fieldstone', keliOptions = {}) {
		return this.rocks.create(keliPreset, keliOptions);
	}

	/** Plans one deterministic geology-aware rock field without eagerly constructing every mesh. */
	rockField(keliOptions = {}) {
		return this.rocks.field(keliOptions);
	}

	/** Exposes direct morphology intentionally for advanced art-direction workflows. */
	rockMorphology(keliPreset = 'fieldstone', keliOptions = {}) {
		return this.rocks.morphology(keliPreset, keliOptions);
	}

	/** Creates a local-first semantic material plan with no hidden network I/O. */
	material(keliRole, keliOptions = {}) {
		return this.materials.plan(keliRole, keliOptions);
	}

	/** Requests optional generated texture descriptors while retaining the local material fallback. */
	async generateTexture(keliRole, keliOptions = {}) {
		return this.materials.generateTexture(keliRole, keliOptions);
	}

	/** Preserves the established surface vocabulary as a compatibility alias for material planning. */
	surface(keliRole, keliOptions = {}) {
		return this.material(keliRole, keliOptions);
	}

	/** Preserves the established asynchronous surface vocabulary over generated texture capability. */
	async generateSurface(keliRole, keliOptions = {}) {
		return this.generateTexture(keliRole, keliOptions);
	}

	/** Creates realistic botanical flower clusters through the canonical Tzomayach authority. */
	flowers(keliSpecies = 'daisy', keliOptions = {}) {
		return this.vegetation.plantCluster(keliSpecies, keliOptions);
	}

	/** Reports whether an actual generated-texture provider was injected into this immutable API lineage. */
	canGenerateTextures() {
		return this.materials.canGenerateTextures();
	}
}
