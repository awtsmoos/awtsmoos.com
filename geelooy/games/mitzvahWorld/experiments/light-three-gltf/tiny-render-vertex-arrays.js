// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-render-vertex-arrays.js
 * @description Reuses exact immutable WebGL vertex-array declarations between draws.
 * The Awtsmoos renews each visible form without repeating its identity; Awtsmoos.com
 * binds one proven vessel while every source attribute and fallback remains unchanged.
 */

import { createVertexArrayEntry } from './tiny-render-vertex-array-builder.js';

export class RenderVertexArrays {
	constructor(gl, glStateCache = null) {
		this.gl = gl;
		this.glStateCache = glStateCache;
		this.extension = gl.getExtension('OES_vertex_array_object');
		this.cache = new WeakMap();
		this.entries = new Set();
		this.current = null;
		this.creations = 0;
		this.failures = 0;
		this.stats = null;
	}

	beginFrame(stats) {
		this.stats = stats;
		stats.vertexArrays = {
			binds: 0,
			creations: this.creations,
			failures: this.failures,
			skips: 0,
			supported: Boolean(this.extension)
		};
	}

	bind(resource, locations, skinned) {
		if (!this.extension) return false;
		let entry;
		try {
			entry = this.entryFor(resource, locations, skinned);
		} catch (error) {
			this.failures += 1;
			this.stats.vertexArrays.failures = this.failures;
			this.releaseToDefault();
			return false;
		}
		if (this.current !== entry.vertexArray) {
			this.extension.bindVertexArrayOES(entry.vertexArray);
			this.current = entry.vertexArray;
			this.invalidateHiddenState();
			this.stats.vertexArrays.binds += 1;
		} else {
			this.stats.vertexArrays.skips += 1;
		}
		for (const fallback of entry.fallbacks) {
			this.gl.vertexAttrib4fv(fallback.location, fallback.values);
		}
		return true;
	}

	releaseToDefault() {
		if (!this.extension || this.current === null) return false;
		this.extension.bindVertexArrayOES(null);
		this.current = null;
		this.invalidateHiddenState();
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

	invalidateHiddenState() {
		this.glStateCache?.invalidateVertexArrayState?.();
	}
}
