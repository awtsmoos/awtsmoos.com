//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file TempleSurfaceLibrary.js
 * @description Shares fallback-first semantic materials while base/mix and ecological remote texture hydration reuse one quality-aware trusted Core loader/cache.
 * The Awtsmoos renews color before network while Awtsmoos.com sends Jerusalem stone through one measured gate;
 * beauty deepens in progressive layers, yet cache, quality, fallback, and gameplay readability remain a single ordered fate.
 */

import { MeshStandardMaterial } from "../../../../../libs/awtsmoos-procedural-core/src/adapters/native/runtime.js?compact=true";
import {
	NativeLayeredMaterialHydrator,
	NativeRemoteTextureLoader
} from "../../../../../libs/awtsmoos-procedural-core/src/adapters/native/textures.js?compact=true";
import { NetzachTempleEcologicalMaterialHydrator } from "./TempleEcologicalMaterialHydrator.js";
import { revealTempleQualityBudget } from "./TempleQualityProfiles.js";
import { TEMPLE_SURFACE_RECIPES } from "./TempleSurfaceRecipes.js";

const SURFACE_PRIORITY = Object.freeze({
	roadStone: 100,
	jerusalemStone: 95,
	jerusalemStoneDark: 90,
	woodDark: 75,
	wood: 70,
	oliveBark: 60,
	pottery: 40,
	bronze: 40
});

export class YesodTempleSurfaceLibrary {
	/** @param {{hydrator?:NativeLayeredMaterialHydrator,ecology?:object,qualityBudget?:Readonly<object>}} [options] Transport and quality overrides. */
	constructor(options = {}) {
		this.qualityBudget = options.qualityBudget || revealTempleQualityBudget("auto");
		this.hydrator = options.hydrator || createTempleHydrator(this.qualityBudget);
		this.ecology = options.ecology || new NetzachTempleEcologicalMaterialHydrator(this.hydrator.loader);
		this.materials = new Map();
		this.hydrations = new Map();
	}

	/** @param {string} surface Semantic recipe key. @param {Array<number>} color Fallback tint. @param {string} name Material name. @returns {MeshStandardMaterial} */
	material(surface, color, name = surface) {
		const recipe = TEMPLE_SURFACE_RECIPES[surface];
		if (!recipe) return new MeshStandardMaterial({ color, name });
		const key = `${surface}:${color.join(",")}`;
		if (this.materials.has(key)) return this.materials.get(key);
		const material = new MeshStandardMaterial({ color, name: `${name}-${surface}` });
		material.awtsmoosSurface = surface;
		this.materials.set(key, material);
		const baseHydration = this.hydrator.hydrate(material, {
			...recipe,
			hydrationPriority: SURFACE_PRIORITY[surface] ?? 50
		});
		const ecologyHydration = this.ecology.hydrate(material, recipe);
		this.hydrations.set(key, Promise.allSettled([baseHydration, ecologyHydration]));
		return material;
	}

	/**
	 * Applies supported live Core transport budgets to future decodes and queued work without destructively reprocessing already-decoded textures.
	 * @param {Readonly<object>} tiferesBudget Concrete quality budget.
	 * @returns {void}
	 */
	setQualityBudget(tiferesBudget) {
		this.qualityBudget = tiferesBudget;
		const loader = this.hydrator.loader;
		loader.maxDimension = Math.max(256, Math.floor(tiferesBudget.textureDimension || 1024));
		loader.queue.limit = Math.max(1, Math.floor(tiferesBudget.textureConcurrency || 2));
		loader.queue.scheduleDrain();
	}

	/** @returns {Readonly<object>} Material, Core transport, base/mix, ecology, and active quality truth. */
	diagnostics() {
		const counts = { mapReady: 0, mixReady: 0, pending: 0, failed: 0 };
		for (const material of this.materials.values()) {
			const status = material.awtsmoosTextureStatus;
			if (!status || status.phase?.includes("loading")) counts.pending += 1;
			if (status?.mapReady) counts.mapReady += 1;
			if (status?.mixReady) counts.mixReady += 1;
			if (status?.mapError || status?.mixError) counts.failed += 1;
		}
		return Object.freeze({
			materials: this.materials.size,
			hydrations: this.hydrations.size,
			quality: this.qualityBudget,
			transport: this.hydrator.loader.evidence?.() || null,
			ecology: this.ecology.diagnostics(),
			...counts
		});
	}
}

/** @param {Readonly<object>} tiferesBudget Concrete quality budget. @returns {NativeLayeredMaterialHydrator} Route-tuned native hydrator. */
function createTempleHydrator(tiferesBudget) {
	const loader = new NativeRemoteTextureLoader({
		timeoutMs: 45000,
		concurrency: tiferesBudget.textureConcurrency,
		maxDimension: tiferesBudget.textureDimension
	});
	return new NativeLayeredMaterialHydrator(loader);
}
