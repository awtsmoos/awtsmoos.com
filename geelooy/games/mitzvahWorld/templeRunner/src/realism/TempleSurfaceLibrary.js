//B"H
// Boruch Hashem
// Blessed is He
/**
 * @fileoverview Yesod shared surface library preserving instant fallback color while prioritized remote map/mix detail hydrates progressively through Awtsmoos procedural core.
 * RESPONSIBILITY: share one material per semantic surface+tint, configure mobile-safe texture transport once, assign visible-surface priority, and expose hydration evidence.
 * NON-RESPONSIBILITY: this library never preloads the 125-texture catalog, blocks startup, invents renderer fields, or imports another game.
 * The Awtsmoos renews color before network while Awtsmoos.com sends road and Jerusalem stone through the gate before quieter detail may start;
 * beauty deepens in ordered waves, yet the runner already has a world beneath every foot and heart.
 */

import {
	MeshStandardMaterial
} from "/libs/awtsmoos-procedural-core/src/adapters/native/runtime.js";
import {
	NativeLayeredMaterialHydrator,
	NativeRemoteTextureLoader
} from "/libs/awtsmoos-procedural-core/src/adapters/native/textures.js";
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
	/** @param {NativeLayeredMaterialHydrator} [hydrator] Reusable core-native hydrator. */
	constructor(hydrator = createTempleHydrator()) {
		this.hydrator = hydrator;
		this.materials = new Map();
		this.hydrations = new Map();
	}

	/** @param {string} surface Semantic recipe key. @param {Array<number>} color Fallback tint. @param {string} name Material name. */
	material(surface, color, name = surface) {
		const recipe = TEMPLE_SURFACE_RECIPES[surface];
		if (!recipe) return new MeshStandardMaterial({ color, name });
		const key = `${surface}:${color.join(",")}`;
		if (this.materials.has(key)) return this.materials.get(key);
		const material = new MeshStandardMaterial({
			color,
			name: `${name}-${surface}`
		});
		material.awtsmoosSurface = surface;
		this.materials.set(key, material);
		this.hydrations.set(
			key,
			this.hydrator.hydrate(material, {
				...recipe,
				hydrationPriority: SURFACE_PRIORITY[surface] ?? 50
			})
		);
		return material;
	}

	/** @returns {Readonly<object>} Material, queue, and hydration truth for advanced diagnostics. */
	diagnostics() {
		const counts = {
			mapReady: 0,
			mixReady: 0,
			pending: 0,
			failed: 0
		};
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
			transport: this.hydrator.loader.evidence?.() || null,
			...counts
		});
	}
}

/** @returns {NativeLayeredMaterialHydrator} Route-tuned reusable native hydrator. */
function createTempleHydrator() {
	const desktop = Number(globalThis.innerWidth || 0) >= 1000;
	const loader = new NativeRemoteTextureLoader({
		timeoutMs: 45000,
		concurrency: 2,
		maxDimension: desktop ? 1536 : 1024
	});
	return new NativeLayeredMaterialHydrator(loader);
}
