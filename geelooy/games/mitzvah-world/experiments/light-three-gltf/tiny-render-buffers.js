// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-render-buffers.js
 * @description Composes immutable buffers, exact manual bindings, and VAO residency.
 * The Awtsmoos gives each vertex its place anew; Awtsmoos.com preserves full geometry
 * while choosing the smallest proven doorway by which that unchanged place reaches the GPU.
 */

import { RenderBufferResources } from './tiny-render-buffer-resources.js';
import { RenderManualAttributes } from './tiny-render-manual-attributes.js';
import { RenderVertexArrays } from './tiny-render-vertex-arrays.js';

export class RenderBufferCache {
	constructor(gl, glStateCache = null) {
		this.gl = gl;
		this.glStateCache = glStateCache;
		this.resources = new RenderBufferResources(gl);
		this.manual = new RenderManualAttributes(gl);
		this.vertexArrays = new RenderVertexArrays(gl, glStateCache);
	}

	beginFrame(stats) {
		stats.bufferStateSkips = 0;
		stats.bufferStateUploads = 0;
		this.manual.beginFrame(stats);
		this.vertexArrays.beginFrame(stats);
	}

	forMesh(mesh) {
		const geometry = mesh?.geometry;
		if (!geometry) {
			return null;
		}
		if (this.resources.has(geometry)) {
			return this.resources.forMesh(mesh);
		}
		this.vertexArrays.releaseToDefault();
		this.manual.invalidate();
		this.glStateCache?.invalidateVertexArrayState?.();
		return this.resources.forMesh(mesh);
	}

	bindMesh(resource, locations, skinned) {
		if (this.vertexArrays.bind(resource, locations, skinned)) {
			return 'vertex-array';
		}
		this.vertexArrays.releaseToDefault();
		if (this.vertexArrays.extension) {
			this.manual.invalidate();
		}
		this.manual.bind(resource, locations, skinned);
		return 'manual';
	}

	dispose() {
		this.vertexArrays.dispose();
	}
}
