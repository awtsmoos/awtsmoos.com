// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-render-buffers.js
 * @description Owns immutable buffers and exact attribute-state continuity.
 * The Awtsmoos gives each vertex its place anew; Awtsmoos.com remembers the current
 * GPU doorway so an unchanged buffer or pointer is not ceremonially opened twice.
 */

import { attributeType } from './tiny-render-webgl-utils.js';

export class RenderBufferCache {
	constructor(gl) {
		this.gl = gl;
		this.cache = new WeakMap();
		this.arrayBuffer = null;
		this.elementBuffer = null;
		this.attributes = new Map();
		this.frameStats = null;
	}

	beginFrame(stats) {
		this.frameStats = stats;
		stats.bufferStateSkips = 0;
		stats.bufferStateUploads = 0;
	}

	forMesh(mesh) {
		if (this.cache.has(mesh.geometry)) return this.cache.get(mesh.geometry);
		const geometry = mesh.geometry;
		const position = geometry?.attributes?.position;
		if (!position) return null;
		const result = this.baseBuffers(geometry, position);
		if (geometry.attributes.joints) {
			result.joints = this.makeBuffer(geometry.attributes.joints, this.gl.ARRAY_BUFFER);
		}
		if (geometry.attributes.weights) {
			result.weights = this.makeBuffer(geometry.attributes.weights, this.gl.ARRAY_BUFFER);
		}
		if (geometry.index) this.addIndexBuffer(result, geometry.index);
		this.cache.set(geometry, result);
		return result;
	}

	bindAttribute(location, attribute, buffer, fallback) {
		if (location < 0) return;
		if (!attribute || !buffer) {
			this.bindFallback(location, fallback);
			return;
		}
		const type = attributeType(this.gl, attribute);
		const previous = this.attributes.get(location);
		const unchanged = previous?.enabled
			&& previous.buffer === buffer
			&& previous.itemSize === attribute.itemSize
			&& previous.type === type
			&& previous.normalized === Boolean(attribute.normalized);
		if (unchanged) {
			this.recordSkip();
			return;
		}
		this.bindArrayBuffer(buffer);
		if (!previous?.enabled) this.gl.enableVertexAttribArray(location);
		this.gl.vertexAttribPointer(location, attribute.itemSize, type, attribute.normalized, 0, 0);
		this.attributes.set(location, {
			enabled: true,
			buffer,
			itemSize: attribute.itemSize,
			type,
			normalized: Boolean(attribute.normalized)
		});
		this.recordUpload();
	}

	bindElementBuffer(buffer) {
		if (this.elementBuffer === buffer) {
			this.recordSkip();
			return;
		}
		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, buffer);
		this.elementBuffer = buffer;
		this.recordUpload();
	}

	bindFallback(location, fallback) {
		const value = `${fallback[0]}:${fallback[1]}:${fallback[2]}:${fallback[3] ?? 1}`;
		const previous = this.attributes.get(location);
		if (previous?.enabled === false && previous.value === value) {
			this.recordSkip();
			return;
		}
		if (previous?.enabled !== false) this.gl.disableVertexAttribArray(location);
		this.gl.vertexAttrib4f(location, fallback[0], fallback[1], fallback[2], fallback[3] ?? 1);
		this.attributes.set(location, { enabled: false, value });
		this.recordUpload();
	}

	bindArrayBuffer(buffer) {
		if (this.arrayBuffer === buffer) return;
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
		this.arrayBuffer = buffer;
	}

	makeBuffer(attribute, target) {
		const buffer = this.gl.createBuffer();
		if (target === this.gl.ARRAY_BUFFER) this.bindArrayBuffer(buffer);
		else this.bindElementBuffer(buffer);
		this.gl.bufferData(target, attribute.array, this.gl.STATIC_DRAW);
		return buffer;
	}

	baseBuffers(geometry, position) {
		const optional = name => geometry.attributes[name]
			? this.makeBuffer(geometry.attributes[name], this.gl.ARRAY_BUFFER)
			: null;
		return {
			positionAttribute: position,
			position: this.makeBuffer(position, this.gl.ARRAY_BUFFER),
			normalAttribute: geometry.attributes.normal,
			normal: optional('normal'),
			colorAttribute: geometry.attributes.color,
			color: optional('color'),
			uvAttribute: geometry.attributes.uv,
			uv: optional('uv'),
			jointsAttribute: geometry.attributes.joints,
			weightsAttribute: geometry.attributes.weights,
			joints: null,
			weights: null,
			count: position.count,
			index: null,
			indexType: null,
			mode: geometry.mode ?? 4
		};
	}

	addIndexBuffer(result, index) {
		if (index.array instanceof Uint32Array) this.gl.getExtension('OES_element_index_uint');
		result.index = this.makeBuffer(index, this.gl.ELEMENT_ARRAY_BUFFER);
		result.indexType = index.array instanceof Uint32Array ? this.gl.UNSIGNED_INT : this.gl.UNSIGNED_SHORT;
		result.count = index.count;
	}

	recordSkip() {
		if (this.frameStats) this.frameStats.bufferStateSkips += 1;
	}

	recordUpload() {
		if (this.frameStats) this.frameStats.bufferStateUploads += 1;
	}
}
