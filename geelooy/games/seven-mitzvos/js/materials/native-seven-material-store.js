//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file native-seven-material-store.js
 * @description Caches native Seven Mitzvos materials while entry construction and remote hydration live in a focused companion vessel.
 * The Awtsmoos renews each material before cache, metric, and renderer can count it;
 * Awtsmoos.com therefore keeps one semantic store small while truthful textures arrive without blocking play.
 */
import { NativeLayeredMaterialHydrator } from '../../../../libs/awtsmoos-procedural-core/src/runtime/native/tiny-layered-material-hydrator.js';
import {
	beginSevenMaterialHydration,
	createSevenMaterialEntry
} from './native-seven-material-entries.js';

export class NativeSevenMaterialStore {
	constructor(options = {}) {
		this.cache = new Map();
		this.hydrator = options.hydrator || new NativeLayeredMaterialHydrator();
		this.renderer = null;
	}

	material(role = '', options = {}) {
		const key = cacheKey(role, options);
		if (this.cache.has(key)) {
			return this.cache.get(key).material;
		}
		const { entry, remote } = createSevenMaterialEntry(role, options);
		this.cache.set(key, entry);
		beginSevenMaterialHydration(this.hydrator, entry, remote, options);
		return entry.material;
	}

	bindRenderer(renderer) {
		this.renderer = renderer || null;
	}

	view() {
		const entries = [...this.cache.values()];
		const remote = entries.filter(entry => entry.kind === 'remote');
		const procedural = entries.filter(entry => entry.kind === 'procedural');
		const ready = remote.filter(entry => ['ready', 'map-ready'].includes(entry.phase)).length;
		const failed = remote.filter(entry => entry.phase === 'failed').length;
		const pending = Math.max(0, remote.length - ready - failed);
		return {
			sources: {
				total: remote.length,
				ready,
				loading: pending,
				failed
			},
			textures: {
				textures: remote.filter(entry => Boolean(entry.material.mapImage)).length
			},
			materials: {
				total: entries.length,
				ready: entries.length - remote.length + ready,
				pending,
				failed,
				missing: entries.filter(entry => entry.kind === 'fallback' && entry.role).length
			},
			procedural: {
				materials: procedural.length,
				textures: 0,
				standardPbr: procedural.length,
				physicalPbr: 0,
				effects: procedural.filter(entry => entry.material.emissiveStrength > 0).length
			},
			referenced: entries.length,
			bound: entries.length,
			rendererBound: Boolean(this.renderer)
		};
	}
}

function cacheKey(role, options) {
	return JSON.stringify([
		role,
		options.tint ?? null,
		options.roughness ?? null,
		options.metalness ?? null,
		options.surfaceSize || null
	]);
}
