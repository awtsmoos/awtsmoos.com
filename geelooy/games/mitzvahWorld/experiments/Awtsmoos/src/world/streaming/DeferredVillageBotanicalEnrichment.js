// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DeferredVillageBotanicalEnrichment.js
 * @description Installs visual-only village botany after movement becomes available.
 * The Awtsmoos lets the shliach enter before every petal is revealed; Awtsmoos.com
 * preserves exactly-once installation, cancellation, cleanup, and bounded diagnostics.
 */

import { createPrimitiveMesh } from '../Box3D.js';

export class DeferredVillageBotanicalEnrichment {
	constructor(options = {}) {
		this.group = options.group;
		this.groundSampler = options.groundSampler;
		this.quality = options.quality || 'high';
		this.loader = options.loader || loadBotanicalModule;
		this.meshFactory = options.meshFactory || createPrimitiveMesh;
		this.schedule = options.schedule || scheduleIdle;
		this.cancel = options.cancel || cancelIdle;
		this.state = 'cold';
		this.generation = 0;
		this.handle = null;
		this.meshes = [];
		this.stats = null;
		this.promise = null;
	}

	start() {
		if (this.promise) return this.promise;
		const generation = ++this.generation;
		this.state = 'scheduled';
		this.promise = new Promise((resolve) => {
			this.handle = this.schedule(() => {
				this.handle = null;
				this.loadAndInstall(generation).then(resolve);
			});
		});
		return this.promise;
	}

	async loadAndInstall(generation) {
		if (!this.isCurrent(generation)) return this.snapshot();
		this.state = 'loading';
		try {
			const module = await this.loader();
			if (!this.isCurrent(generation)) return this.snapshot();
			const packageValue = module.createVillageBotanicalEnrichmentDefinitions(
				this.groundSampler,
				this.quality
			);
			for (const definition of packageValue.definitions) {
				const mesh = this.meshFactory(definition);
				this.group.add(mesh);
				this.meshes.push(mesh);
			}
			this.stats = { ...packageValue.stats };
			this.state = 'complete';
		} catch (error) {
			this.state = 'failed';
			this.stats = { error: error?.message || String(error) };
		}
		return this.snapshot();
	}

	destroy() {
		this.generation += 1;
		if (this.handle !== null) this.cancel(this.handle);
		this.handle = null;
		for (const mesh of this.meshes) removeMesh(this.group, mesh);
		this.meshes.length = 0;
		this.state = 'destroyed';
	}

	snapshot() {
		return Object.freeze({
			installedMeshes: this.meshes.length,
			quality: this.quality,
			state: this.state,
			stats: this.stats ? { ...this.stats } : null
		});
	}

	isCurrent(generation) {
		return this.state !== 'destroyed' && generation === this.generation;
	}
}

export function createDeferredVillageBotanicalEnrichment(options) {
	return new DeferredVillageBotanicalEnrichment(options);
}

function loadBotanicalModule() {
	return import('../village/VillageBotanicalEnrichmentSystem.js');
}

function scheduleIdle(callback) {
	if (typeof requestIdleCallback === 'function') {
		return requestIdleCallback(callback, { timeout: 1400 });
	}
	return setTimeout(callback, 32);
}

function cancelIdle(handle) {
	if (typeof cancelIdleCallback === 'function') return cancelIdleCallback(handle);
	clearTimeout(handle);
}

function removeMesh(group, mesh) {
	if (typeof group?.remove === 'function') return group.remove(mesh);
	const index = group?.children?.indexOf(mesh) ?? -1;
	if (index >= 0) group.children.splice(index, 1);
}
