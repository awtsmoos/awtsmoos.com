//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file TempleSurfaceLibrary.js
 * @description Shares fallback-first semantic materials while Core-native remote texture hydration obeys live quality budgets for future decode size and scheduling pressure.
 * The Awtsmoos renews color before network while Awtsmoos.com sends Jerusalem stone through a measured gate;
 * beauty deepens in ordered waves, yet quality may widen or narrow finite vessels without blocking the runner's fate.
 */

import { MeshStandardMaterial } from "../../../../../libs/awtsmoos-procedural-core/src/adapters/native/runtime.js?compact=true";
import {
	NativeLayeredMaterialHydrator,
	NativeRemoteTextureLoader
} from "../../../../../libs/awtsmoos-procedural-core/src/adapters/native/textures.js?compact=true";
import { TEMPLE_SURFACE_RECIPES } from "./TempleSurfaceRecipes.js";
import { revealTempleQualityBudget } from "./TempleQualityProfiles.js";

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
	/** @param {{hydrator?:NativeLayeredMaterialHydrator,qualityBudget?:Readonly<object>}} [options] Core transport and initial quality overrides. */
	constructor(options = {}) {
		this.qualityBudget = options.qualityBudget || revealTempleQualityBudget("auto");
		this.hydrator = options.hydrator || createTempleHydrator(this.qualityBudget);
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
		this.hydrations.set(key, this.hydrator.hydrate(material, {
			...recipe,
			hydrationPriority: SURFACE_PRIORITY[surface] ?? 50
		}));
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

	/** @returns {Readonly<object>} Material, queue, hydration, and active quality truth for advanced diagnostics. */
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
