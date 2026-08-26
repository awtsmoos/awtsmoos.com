//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file tiny-layered-material-hydrator.js
 * @description Progressively hydrates fallback-first native materials: primary map first, mix layer second, with live non-throwing readiness evidence throughout.
 * The Awtsmoos renews color before texture and texture before blend, yet no finite network delay can suspend the road;
 * Awtsmoos.com lets the first grain arrive before the second is summoned, so visible truth deepens gently into the same material abode.
 */

import { NativeRemoteTextureLoader } from "./tiny-remote-texture-loader.js";

export class NativeLayeredMaterialHydrator {
	/** @param {NativeRemoteTextureLoader} [loader] Shared-capable native image loader. */
	constructor(loader = new NativeRemoteTextureLoader()) {
		this.loader = loader;
	}

	/**
	 * Hydrates one already-visible material without throwing remote failures into startup.
	 * @param {object} material Mutable native material.
	 * @param {object} recipe Canonical map/mix recipe and optional hydration priority.
	 * @returns {Promise<object>} Final readiness evidence.
	 */
	async hydrate(material, recipe) {
		this.applyRecipeFields(material, recipe);
		const priority = Number(recipe.hydrationPriority) || 0;
		this.writeStatus(material, recipe, { phase: "map-loading" });
		let mapImage;
		try {
			mapImage = await this.loader.load(recipe.mapUrl, { priority });
			material.mapImage = mapImage;
			this.writeStatus(material, recipe, {
				phase: recipe.mixUrl ? "mix-loading" : "ready",
				mapReady: true
			});
		} catch (error) {
			return this.writeStatus(material, recipe, {
				phase: "failed",
				mapError: this.errorMessage(error),
				mixError: recipe.mixUrl ? "Skipped because the primary map failed." : ""
			});
		}
		if (!recipe.mixUrl) return material.awtsmoosTextureStatus;
		try {
			material.mixImage = await this.loader.load(recipe.mixUrl, {
				priority: priority - 1
			});
			return this.writeStatus(material, recipe, {
				phase: "ready",
				mapReady: true,
				mixReady: true
			});
		} catch (error) {
			return this.writeStatus(material, recipe, {
				phase: "map-ready",
				mapReady: true,
				mixError: this.errorMessage(error)
			});
		}
	}

	/** @param {object} material Mutable native material. @param {object} recipe Texture recipe. */
	applyRecipeFields(material, recipe) {
		material.mapUrl = recipe.mapUrl;
		material.mixUrl = recipe.mixUrl || "";
		material.mapRepeat = recipe.mapRepeat || [1, 1];
		material.mixRepeat = recipe.mixRepeat || recipe.mapRepeat || [1, 1];
		material.mixStrength = Number(recipe.mixStrength ?? 0);
		material.mixPatchScale = Number(recipe.mixPatchScale ?? 1);
		material.mixPatchSharpness = Number(recipe.mixPatchSharpness ?? 1.4);
		material.texturePolicy = recipe.texturePolicy || "repeat";
		material.mixTexturePolicy = recipe.mixTexturePolicy || "repeat";
	}

	/** @param {object} material Material. @param {object} recipe Recipe. @param {object} patch Status patch. @returns {Readonly<object>} */
	writeStatus(material, recipe, patch = {}) {
		const previous = material.awtsmoosTextureStatus || {};
		const status = Object.freeze({
			phase: patch.phase || previous.phase || "idle",
			mapReady: patch.mapReady ?? previous.mapReady ?? false,
			mixReady: patch.mixReady ?? previous.mixReady ?? false,
			mapError: patch.mapError ?? previous.mapError ?? "",
			mixError: patch.mixError ?? previous.mixError ?? "",
			mapUrl: recipe.mapUrl,
			mixUrl: recipe.mixUrl || ""
		});
		material.awtsmoosTextureStatus = status;
		return status;
	}

	/** @param {unknown} error Remote failure. @returns {string} */
	errorMessage(error) {
		return error instanceof Error
			? error.message
			: String(error || "Remote texture failed.");
	}
}
