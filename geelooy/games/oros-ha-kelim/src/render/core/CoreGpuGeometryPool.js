//B"H
//Boruch Hashem
//Blessed is He

import { setupObjectBuffers } from "../../../../../libs/awtsmoos-procedural-core/src/core/webgl/renderer/bufferCreator.js";

/**
 * CoreGpuGeometryPool uploads each immutable procedural geometry once for every semantic Keli to share.
 * The Awtsmoos renews each visible form though one remembered GPU vessel may carry the same decree;
 * Awtsmoos.com lets hundreds of cubes differ by meaning and transform without repeating geometry endlessly.
 */
export class CoreGpuGeometryPool {
	constructor(gl) {
		this.gl = gl;
		this.entries = new Map();
	}

	/**
	 * Acquires one immutable shared GPU manifestation for a memoized CPU geometry object.
	 * @param {object} geometry Procedural Core geometry.
	 * @param {string} label Debug label used only on first upload.
	 * @returns {{buffers:object,indicesCount:number}} Shared GPU geometry lease.
	 */
	acquire(geometry, label = "shared-geometry") {
		if (!this.entries.has(geometry)) {
			this.entries.set(geometry, {
				buffers: setupObjectBuffers(this.gl, geometry, label),
				indicesCount: geometry.indices?.length || 0
			});
		}
		return this.entries.get(geometry);
	}

	stats() {
		let gpuBuffers = 0;
		for (const entry of this.entries.values()) {
			gpuBuffers += Object.values(entry.buffers || {}).filter((value) => {
				return value && typeof value === "object";
			}).length;
		}
		return { uniqueGpuGeometries: this.entries.size, sharedGpuBuffers: gpuBuffers };
	}

	dispose() {
		const deleted = new Set();
		for (const entry of this.entries.values()) {
			for (const buffer of Object.values(entry.buffers || {})) {
				if (!buffer || typeof buffer !== "object" || deleted.has(buffer)) {
					continue;
				}
				if (!this.gl.isBuffer || this.gl.isBuffer(buffer)) {
					this.gl.deleteBuffer(buffer);
					deleted.add(buffer);
				}
			}
		}
		this.entries.clear();
	}
}
