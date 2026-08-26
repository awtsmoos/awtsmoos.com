//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file TempleEcologicalMaterialHydrator.js
 * @description Progressively decodes ecological layer URLs through the existing Core loader/cache and publishes successful layers in authored order without blocking fallback or base/mix material revelation.
 * The Awtsmoos renews each remote image before success or failure can divide the hidden source of sight;
 * Awtsmoos.com lets Netzach keep authored order through imperfect networks, adding living texture only where decoded vessels become bright.
 */

export class NetzachTempleEcologicalMaterialHydrator {
	/** @param {object} chochmahLoader Shared trusted Core remote-texture loader. */
	constructor(chochmahLoader) {
		this.loader = chochmahLoader;
		this.materials = 0;
		this.requested = 0;
		this.ready = 0;
		this.failed = 0;
	}

	/**
	 * Begins non-blocking ecological hydration while terrain-mixing policy is installed immediately on the fallback-first material.
	 * @param {object} malchusMaterial Native material.
	 * @param {Readonly<object>} binahRecipe Surface recipe.
	 * @returns {Promise<object>} Settled material after all ecological requests finish.
	 */
	async hydrate(malchusMaterial, binahRecipe) {
		const layers = binahRecipe.ecologicalLayers || [];
		this.applyTerrainMixing(malchusMaterial, binahRecipe);
		if (!layers.length) return malchusMaterial;
		this.materials += 1;
		this.requested += layers.length;
		const slots = Array(layers.length).fill(null);
		await Promise.all(layers.map((layer, index) => this.hydrateLayer(
			malchusMaterial,
			layer,
			index,
			slots
		)));
		return malchusMaterial;
	}

	/** @param {object} material Material. @param {Readonly<object>} layer Intent. @param {number} index Authored slot. @param {Array} slots Mutable hydration slots. @returns {Promise<void>} */
	async hydrateLayer(material, layer, index, slots) {
		try {
			const image = await this.loader.load(layer.url, { priority: layer.priority });
			slots[index] = Object.freeze({ ...layer, image });
			this.ready += 1;
		} catch (error) {
			this.failed += 1;
			this.recordFailure(material, layer, error);
		} finally {
			this.publish(material, slots);
		}
	}

	/** @param {object} material Material. @param {Array} slots Authored hydration slots. @returns {void} */
	publish(material, slots) {
		material.textureLayers = Object.freeze(slots.filter(Boolean));
		material.needsUpdate = true;
	}

	/** @param {object} material Material. @param {Readonly<object>} recipe Recipe. @returns {void} */
	applyTerrainMixing(material, recipe) {
		for (const key of ["terrainMixingA", "terrainMixingB", "terrainMixingC"]) {
			if (recipe[key]) material[key] = recipe[key];
		}
	}

	/** @param {object} material Material. @param {Readonly<object>} layer Failed layer. @param {unknown} error Failure. @returns {void} */
	recordFailure(material, layer, error) {
		const failures = material.awtsmoosEcologyFailures || [];
		material.awtsmoosEcologyFailures = Object.freeze([
			...failures,
			Object.freeze({ role: layer.role, url: layer.url, message: String(error?.message || error) })
		]);
	}

	/** @returns {Readonly<object>} Aggregate progressive ecological hydration evidence. */
	diagnostics() {
		return Object.freeze({
			materials: this.materials,
			requested: this.requested,
			ready: this.ready,
			failed: this.failed
		});
	}
}
