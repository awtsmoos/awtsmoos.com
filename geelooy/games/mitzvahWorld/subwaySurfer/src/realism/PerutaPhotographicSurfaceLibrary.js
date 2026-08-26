//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PerutaPhotographicSurfaceLibrary.js
 * @description Owns shared semantic materials and hydrates real registry images through a bounded queue plus the global decoded-image cache.
 * The Awtsmoos renews fallback color and photographic map while neither may block the runner's start;
 * Awtsmoos.com lets two patient texture journeys at a time clothe every recycled world part.
 */

import { ThreeImageSourceRepository } from "/libs/awtsmoos-procedural-core/src/adapters/three/ThreeImageSourceRepository.js";
import {
	perutaSurfaceDefinition,
	perutaSurfaceRoles,
	resolvePerutaTextureUrl
} from "./PerutaSurfaceCatalog.js";
import { NetzachSurfaceHydrationQueue } from "./SurfaceHydrationQueue.js";

const HYDRATION_TIMEOUT_MS = 45000;

export class YesodPerutaPhotographicSurfaceLibrary {
	/** @param {object} THREE Three namespace. @param {object} renderer Active renderer. */
	constructor(THREE, renderer) {
		this.THREE = THREE;
		this.renderer = renderer;
		this.sources = new ThreeImageSourceRepository(THREE);
		this.queue = new NetzachSurfaceHydrationQueue(2);
		this.materials = new Map();
		this.fallbacks = new Map();
		this.states = new Map();
		for (const role of perutaSurfaceRoles()) this.prepare(role);
	}

	/** @param {string} role Semantic role. @param {object} [fallback={}] Fallback config. @returns {object} Shared material. */
	material(role, fallback = {}) {
		if (this.materials.has(role)) return this.materials.get(role);
		if (!this.fallbacks.has(role)) {
			this.fallbacks.set(role, this.createMaterial(`fallback:${role}`, fallback));
			this.states.set(role, "unregistered-fallback");
		}
		return this.fallbacks.get(role);
	}

	/** @param {string} role Registered role prepared once at boot. */
	prepare(role) {
		const definition = perutaSurfaceDefinition(role);
		if (!definition || this.materials.has(role)) return;
		const material = this.createRoleMaterial(role, definition);
		this.materials.set(role, material);
		const url = resolvePerutaTextureUrl(definition.filename);
		if (!definition.filename) return void this.states.set(role, "fallback-only");
		if (!url) return void this.states.set(role, "missing-registry-entry");
		this.states.set(role, "queued");
		this.queue.enqueue(() => this.loadRole(role, url, material, definition));
	}

	/** @private */
	async loadRole(role, url, material, definition) {
		this.states.set(role, "loading");
		try {
			const entry = await this.sources.request(url, {timeoutMs: HYDRATION_TIMEOUT_MS});
			this.hydrate(role, material, definition, entry.image);
		} catch (error) {
			this.states.set(role, `load-failed:${error.message || "unknown"}`);
		}
	}

	/** @private */
	createRoleMaterial(role, definition) {
		const material = this.createMaterial(`PerutaSurface:${role}`, definition);
		if (definition.leaf) {
			material.vertexColors = true;
			material.side = this.THREE.DoubleSide;
			material.transparent = true;
			material.alphaTest = 0.34;
			material.depthWrite = false;
		}
		return material;
	}

	/** @private */
	createMaterial(name, config) {
		return new this.THREE.MeshStandardMaterial({
			name,
			color: config.color ?? 0xffffff,
			roughness: config.roughness ?? 0.82,
			metalness: config.metalness ?? 0
		});
	}

	/** @private */
	hydrate(role, material, definition, image) {
		const texture = new this.THREE.Texture(image);
		texture.name = `PerutaCachedTexture:${role}`;
		texture.wrapS = this.THREE.RepeatWrapping;
		texture.wrapT = this.THREE.RepeatWrapping;
		texture.repeat.set(...definition.repeat);
		texture.colorSpace = this.THREE.SRGBColorSpace;
		texture.anisotropy = Math.min(4, this.renderer.capabilities?.getMaxAnisotropy?.() || 1);
		texture.needsUpdate = true;
		material.map = texture;
		material.needsUpdate = true;
		this.states.set(role, "ready");
	}

	/** @returns {object} Honest texture-hydration evidence. */
	diagnostics() {
		const states = Object.fromEntries(this.states);
		const values = Object.values(states);
		return {
			states,
			ready: values.filter((state) => state === "ready").length,
			loading: values.filter((state) => state === "loading" || state === "queued").length,
			failed: values.filter((state) => state.includes("failed") || state.includes("missing")).length,
			queue: this.queue.diagnostics(),
			sources: this.sources.view()
		};
	}
}
