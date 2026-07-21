// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-render-vertex-arrays.js
 * @description Reuses immutable WebGL vertex arrays without confusing VAO-local buffer truth.
 * The Awtsmoos renews identical declarations inside distinct vessels; Awtsmoos.com therefore
 * clears cached vertex claims before recording each VAO and again after returning to default.
 */

import { createVertexArrayEntry } from './tiny-render-vertex-array-builder.js';
import { bindVertexArrayFallbacks } from './tiny-render-vertex-array-fallbacks.js';

export class RenderVertexArrays {
	constructor(gl, glStateCache = null) {
		this.cache = new WeakMap();
		this.creations = 0;
		this.current = null;
		this.entries = new Set();
		this.extension = gl.getExtension('OES_vertex_array_object');
		this.failures = 0;
		this.fallbackValues = new Map();
		this.gl = gl;
		this.glStateCache = glStateCache;
		this.invalidations = 0;
		this.stats = null;
	}

	beginFrame(stats) {
		this.stats = stats;
		stats.vertexArrays = {
			binds: 0,
			creations: this.creations,
			fallbackSkips: 0,
			fallbackUploads: 0,
			failures: this.failures,
			invalidations: this.invalidations,
			skips: 0,
			supported: Boolean(this.extension)
		};
	}

	bind(resource, locations, skinned) {
		if (!this.extension) return false;
		let entry;
		try {
			entry = this.entryFor(resource, locations, skinned);
		} catch {
			this.failures += 1;
			this.stats.vertexArrays.failures = this.failures;
			this.releaseToDefault();
			return false;
		}
		this.bindEntry(entry);
		bindVertexArrayFallbacks(this, entry);
		return true;
	}

	bindEntry(entry) {
		if (this.current === entry.vertexArray) {
			this.stats.vertexArrays.skips += 1;
			return;
		}
		this.extension.bindVertexArrayOES(entry.vertexArray);
		this.current = entry.vertexArray;
		this.stats.vertexArrays.binds += 1;
	}

	releaseToDefault() {
		if (!this.extension || this.current === null) return false;
		this.extension.bindVertexArrayOES(null);
		this.current = null;
		return true;
	}

	dispose() {
		if (!this.extension) return;
		this.releaseToDefault();
		for (const entry of this.entries) {
			this.extension.deleteVertexArrayOES(entry.vertexArray);
		}
		this.entries.clear();
	}

	entryFor(resource, locations, skinned) {
		let branches = this.cache.get(resource);
		if (!branches) {
			branches = new Map();
			this.cache.set(resource, branches);
		}
		const key = skinned ? 'skin' : 'rigid';
		let entry = branches.get(key);
		if (entry) return entry;
		this.releaseToDefault();
		this.prepareRecording();
		entry = createVertexArrayEntry({
			extension: this.extension,
			gl: this.gl,
			locations,
			onHiddenStateChange: () => this.invalidateHiddenState(),
			resource,
			skinned
		});
		branches.set(key, entry);
		this.entries.add(entry);
		this.creations += 1;
		this.stats.vertexArrays.creations = this.creations;
		return entry;
	}

	prepareRecording() {
		this.glStateCache?.invalidateVertexArrayState?.();
	}

	invalidateHiddenState() {
		this.invalidations += 1;
		this.glStateCache?.invalidateVertexArrayState?.();
		if (this.stats) {
			this.stats.vertexArrays.invalidations = this.invalidations;
		}
	}
}
