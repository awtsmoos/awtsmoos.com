// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file tiny-render-vertex-arrays.js
 * @description Reuses immutable WebGL vertex arrays while entry creation and evidence live in focused core helpers.
 * The Awtsmoos renews identical declarations inside distinct vessels while hidden GL state must stay clear;
 * Awtsmoos.com keeps binding and lifecycle here, while cache creation guards its own reusable frontier.
 */

import { vertexArrayEntryFor } from "./tiny-render-vertex-array-cache.js";
import { bindVertexArrayFallbacks } from "./tiny-render-vertex-array-fallbacks.js";
import { createVertexArrayStats } from "./tiny-render-vertex-array-stats.js";

export class RenderVertexArrays {
	/** @param {WebGLRenderingContext} gl Context. @param {object|null} glStateCache Shared state cache. */
	constructor(gl, glStateCache = null) {
		this.cache = new WeakMap();
		this.creations = 0;
		this.current = null;
		this.entries = new Set();
		this.extension = gl.getExtension("OES_vertex_array_object");
		this.failures = 0;
		this.fallbackValues = new Map();
		this.gl = gl;
		this.glStateCache = glStateCache;
		this.invalidations = 0;
		this.stats = null;
	}

	/** @param {object} stats Frame evidence ledger. */
	beginFrame(stats) {
		this.stats = stats;
		stats.vertexArrays = createVertexArrayStats(this);
	}

	/**
	 * Binds one cached VAO branch and any constant fallback attributes.
	 * @param {object} resource Mesh resource.
	 * @param {object} locations Shader attribute locations.
	 * @param {boolean} skinned Whether skin attributes are required.
	 * @returns {boolean} Whether VAO binding succeeded.
	 */
	bind(resource, locations, skinned) {
		if (!this.extension) return false;
		let entry;
		try {
			entry = vertexArrayEntryFor(
				this,
				resource,
				locations,
				skinned
			);
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

	/** @param {object} entry Cached VAO entry. */
	bindEntry(entry) {
		if (this.current === entry.vertexArray) {
			this.stats.vertexArrays.skips += 1;
			return;
		}
		this.extension.bindVertexArrayOES(entry.vertexArray);
		this.current = entry.vertexArray;
		this.stats.vertexArrays.binds += 1;
	}

	/** @returns {boolean} Whether a bound VAO was released. */
	releaseToDefault() {
		if (!this.extension || this.current === null) return false;
		this.extension.bindVertexArrayOES(null);
		this.current = null;
		return true;
	}

	/** Releases every cached browser VAO resource. */
	dispose() {
		if (!this.extension) return;
		this.releaseToDefault();
		for (const entry of this.entries) {
			this.extension.deleteVertexArrayOES(entry.vertexArray);
		}
		this.entries.clear();
	}

	/** Clears hidden vertex-array claims before recording a new VAO. */
	prepareRecording() {
		this.glStateCache?.invalidateVertexArrayState?.();
	}

	/** Records that VAO-local state invalidated the global state cache. */
	invalidateHiddenState() {
		this.invalidations += 1;
		this.glStateCache?.invalidateVertexArrayState?.();
		if (this.stats) {
			this.stats.vertexArrays.invalidations = this.invalidations;
		}
	}
}
