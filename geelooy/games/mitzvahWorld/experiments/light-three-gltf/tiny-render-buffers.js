// B"H
import { attributeType } from './tiny-render-webgl-utils.js';

/** Owns immutable GPU buffers without burdening the renderer's frame logic. */
export class RenderBufferCache {
	constructor(gl) {
		this.gl = gl;
		this.cache = new WeakMap();
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
		const gl = this.gl;
		if (location < 0) return;
		if (!attribute || !buffer) {
			gl.disableVertexAttribArray(location);
			gl.vertexAttrib4f(location, fallback[0], fallback[1], fallback[2], fallback[3] ?? 1);
			return;
		}
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.enableVertexAttribArray(location);
		gl.vertexAttribPointer(
			location,
			attribute.itemSize,
			attributeType(gl, attribute),
			attribute.normalized,
			0,
			0
		);
	}

	makeBuffer(attribute, target) {
		const buffer = this.gl.createBuffer();
		this.gl.bindBuffer(target, buffer);
		this.gl.bufferData(target, attribute.array, this.gl.STATIC_DRAW);
		return buffer;
	}

	baseBuffers(geometry, position) {
		return {
			positionAttribute: position,
			position: this.makeBuffer(position, this.gl.ARRAY_BUFFER),
			normalAttribute: geometry.attributes.normal,
			normal: geometry.attributes.normal
				? this.makeBuffer(geometry.attributes.normal, this.gl.ARRAY_BUFFER)
				: null,
			colorAttribute: geometry.attributes.color,
			color: geometry.attributes.color
				? this.makeBuffer(geometry.attributes.color, this.gl.ARRAY_BUFFER)
				: null,
			uvAttribute: geometry.attributes.uv,
			uv: geometry.attributes.uv
				? this.makeBuffer(geometry.attributes.uv, this.gl.ARRAY_BUFFER)
				: null,
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
		if (index.array instanceof Uint32Array) {
			this.gl.getExtension('OES_element_index_uint');
		}
		result.index = this.makeBuffer(index, this.gl.ELEMENT_ARRAY_BUFFER);
		result.indexType = index.array instanceof Uint32Array
			? this.gl.UNSIGNED_INT
			: this.gl.UNSIGNED_SHORT;
		result.count = index.count;
	}
}
